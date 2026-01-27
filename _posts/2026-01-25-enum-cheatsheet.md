---
layout: single
title: Enum Cheat Sheet
date: 2026-01-07
classes: wide
header:
  teaser: /assets/images/cheatsheet.png
  teaser_home_page: true
categories:
  - Cheat Sheets
tags:
  - cheatsheets
---

# Introduction
-----

This is the **Shell & Coffee enumeration cheat sheet** that I will be actively updating through commits as needed.

<br>
# OSINT
--------

| **Name**                           | **URL**                                                                                                                                      |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mails and credentials**          |                                                                                                                                              |
| Hunter                             | [https://hunter.io](https://hunter.io)                                                                                                       |
| phonebook                          | [https://phonebook.cz](https://phonebook.cz)                                                                                                 |
| Verifymailaddress                  | [https://www.verifyemailaddress.org](https://www.verifyemailaddress.org)                                                                     |
| email-checker                      | [https://email-checker.net](https://email-checker.net)                                                                                       |
| haveibeenpwned                     | [https://haveibeenpwned.com/](https://haveibeenpwned.com/)                                                                                   |
| haveibeenpwned (for phone numbers) | [https://www.passwordmanager.com/have-i-been-pwned/](https://www.passwordmanager.com/have-i-been-pwned/)                                     |
| LeakPeek                           | [https://leakpeek.com](https://leakpeek.com)                                                                                                 |
| Epieos                             | [https://epieos.com](https://epieos.com)                                                                                                     |
| Shodan                             | [https://www.shodan.io](https://www.shodan.io)                                                                                               |
| Social-Searcher                    | [https://www.social-searcher.com](https://www.social-searcher.com)                                                                           |
| What's My Name                     | [https://whatsmyname.app](https://whatsmyname.app)                                                                                           |
| Censys                             | [https://search.censys.io](https://search.censys.io)                                                                                         |
| **Images**                         |                                                                                                                                              |
| Pimeyes                            | [https://pimeyes.com](https://pimeyes.com)                                                                                                   |
| Google Images                      | [https://images.google.com](https://images.google.com)                                                                                       |
| **Domains**                        |                                                                                                                                              |
| phonebook                          | [https://phonebook.cz](https://phonebook.cz)                                                                                                 |
| ctfr.py                            | [https://github.com/UnaPibaGeek/ctfr/blob/master/ctfr.py](https://github.com/UnaPibaGeek/ctfr/blob/master/ctfr.py)                           |
| Whois                              | [https://www.dondominio.com/es/whois](https://www.dondominio.com/es/whois)                                                                   |
| dnsdumpster                        | [https://dnsdumpster.com](https://dnsdumpster.com)                                                                                           |
| crt.sh                             | [http://crt.sh](http://crt.sh)                                                                                                               |
| rpcenum                            | [https://github.com/s4vitar/rpcenum/blob/master/rpcenum](https://github.com/s4vitar/rpcenum/blob/master/rpcenum)                             |
| Gobuster                           | `gobuster dns -d inlanefreight.com -w /usr/share/SecLists/Discovery/DNS/namelist.txt`                                                        |
| **Dorking**                        |                                                                                                                                              |
| Implemented Search Engine          | [https://pentest-tools.com/information-gathering/google-hacking](https://pentest-tools.com/information-gathering/google-hacking)             |
| Dorking Manual                     | [https://www.exploit-db.com/google-hacking-database ](https://www.exploit-db.com/google-hacking-database)                                    |
| **Web Technologies**               |                                                                                                                                              |
| Wappalyzer addon for Firefox       | [https://addons.mozilla.org/en-US/firefox/addon/wappalyzer/Wappalyzer](https://addons.mozilla.org/en-US/firefox/addon/wappalyzer/Wappalyzer) |
| BuiltWith                          | [https://builtwith.com](https://builtwith.com)                                                                                               |


<br>
# Scanning
-------------

| **Command**                                                                                               | **Description**                                                               |
| --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Service Scanning**                                                                                      |                                                                               |
| `nmap -p- --open -sS --min-rate 5000 -vvv -n -Pn [ip] -oG allPorts`                                       | Nmap custom basic port scan redirecting the output to a fiile called allPorts |
| `nmap -sCV -p[ports] [ip]`                                                                                | Nmap basic recon scripts scan over speccific ports                            |
| `nmap --script smb-os-discovery.nse -p[ports] [ip]`                                                       | Run an nmap script on an IP                                                   |
| ``nmap -sV --script=banner -p[ports] [ip]``                                                               | Run a nmap script for Banner Grabbing                                         |
| `locate scripts/citrix`                                                                                   | List various available nmap scripts                                           |
| `masscan -p[ports] -Pn [ip]/[cidr] --rate=10000`                                                          | Valid alternative to nmap                                                     |
| `arp-scan -I [interface] --localnet --ignoredups`                                                         | ARP scan in the local network.                                                |
| `netdiscover`                                                                                             | Util to perform a scan in the local network.                                  |
| `echo '' > /dev/tcp/[ip]/`                                                                                | Communications to /dev/tcp, an alternative to ICMP                            |
| **Web Enumeration**                                                                                       |                                                                               |
| `gobuster dir -u http://[ip]/ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt` | Run a directory scan on a website using 20 threats                            |
| `curl -IL https://[ip]`                                                                                   | Grab website banner                                                           |
| `whatweb [ip]`                                                                                            | List details about the webserver/certificates                                 |
| `whatweb --no-errors [ip]/[cidr]`                                                                         | Web App enumeration across a network                                          |
| `ctrl+u`                                                                                                  | View page source code (in Firefox)                                            |
| `openssl s_client -connect [domain]:[port]`                                                               | Inspect the site's SSL certificate                                            |
| `sslscan [domain]`                                                                                        | Scan to search vulns in a HTTPS site                                          |
| **Other Services Enumeration**                                                                            |                                                                               |
| `smbclient -L -N //[ip]`                                                                                  | List SMB Shares                                                               |
| `smbmap -H //[ip]`                                                                                        | List SMB Shares and its permissions                                           |
| `smbclient //[ip]/[share] -N`                                                                             | Connect to an SMB share as 'guest' to see files                               |
| `smbclient //[ip]/[share] -U [user] [password]`                                                           |                                                                               |
| `netcat [ip] [port]`                                                                                      | Banner Grabbing                                                               |
| `ftp -p [ip]`                                                                                             | Connecting to FTP as Anonymous                                                |
| `snmpwalk -v 2c -c public [ip] 1.3.6.1.2.1.1.5.0`                                                         | Scan SNMP on an IP                                                            |
| `onesixtyone -c dict.txt [ip]`                                                                            | Brute force SNMP secret string                                                |

<br>
# OS Version
----

| **Ubuntu**           | **OpenSSH** | **Apache** | **nginx** |
| -------------------- | ----------- | ---------- | --------- |
| 14.04 - trusty [LTS] | 6.6p1       | 2.4.7      | 1.4.6     |
| 14.10 - utopic       | 6.6p1       | 2.4.10     | 1.6.2     |
| 15.04 - vivid        | 6.7p1       | 2.4.12     | 1.6.2     |
| 15.10 - wily         | 6.9p1       | 2.4.12     | 1.6.2     |
| 16.04 - xenial [LTS] | 7.2p1       | 2.4.18     | 1.10.0    |
| 16.10 - yakketty     | 7.2p1       | 2.4.18     | 1.10.0    |
| 17.04 - zesty        | 7.4p1       | 2.4.25     | 1.12.0    |
| 17.10 - artful       | 7.6p1       | 2.4.27     | 1.13.3    |
| 18.04 - bionic [LTS] | 7.6p1       | 2.4.29     | 1.14.0    |
| 18.10 - cosmic       | 7.7p1       | 2.4.34     | 1.16.0    |
| 19.04 - disco        | 7.9p1       | 2.4.35     | 1.16.0    |
| 19.10 - eoan         | 7.9p1       | 2.4.41     | 1.17.3    |
| 20.04 - focal [LTS]  | 8.2p1       | 2.4.41     | 1.18.0    |
| 20.10 - groovy       | 8.2p1       | 2.4.46     | 1.18.0    |
| 21.04 - hirsute      | 8.4p1       | 2.4.48     | 1.20.1    |
| 21.10 - impish       | 8.4p1       | 2.4.51     | 1.20.1    |
| 22.04 - jammy [LTS]  | 8.9p1       | 2.4.52     | 1.18.0    |
| 22.10 - kinetic      | 8.9p1       | 2.4.52     | 1.22.0    |
| 23.04 - junar        | 9.0p1       | 2.4.54     | 1.24.0    |
| 23.10 - mantic       | 9.3p1       | 2.4.57     | 1.24.0    |
| 24.04 - noble [LTS]  | 9.6p1       | 2.4.58     | 1.24.0    |
| 24.10 - oracular     | 9.7p1       | 2.4.62     | 1.26.0    |
| 25.04 - plucky       | 9.9p1       | 2.4.63     | 1.26.3    |

| **Debian**    | **OpenSSH** | **nginx** |
| ------------- | ----------- | --------- |
| 8 - Jessie    | 6.7p1       | 1.6.2     |
| 9 - Stretch   | 7.4p1       | 1.10.3    |
| 10 - Buster   | 7.9p1       | 1.42.2    |
| 11 - Bullseye | 8.4p1       | 1.8.0     |
| 12 - Bookworm | 9.2p1       | 1.22.1    |

| **Red Hat / CentOS** | **OpenSSH** | **Apache** |
| -------------------- | ----------- | ---------- |
| 5                    | 5.3p1       | 2.2.3      |
| 6                    | 6.6p1       | 2.2.15     |
| 7                    | 7.4p1       | 2.4.6      |
| 8                    | 8.0p1       | 2.4.37     |
| 9                    | 9.1p1       | 2.4.53     |

| **Windows**                        | **IIS**                  |
| ---------------------------------- | ------------------------ |
| Windows 10 / Server 2016 and later | Microsoft IIS httpd 10.0 |
| Windows 8.1 / Server 2012 R2       | Microsoft IIS httpd 8.5  |
| Windows 7 / Server 2008 R2         | Microsoft IIS httpd 7.5  |
| Windows XP (x64) / Server 2003     | Microsoft IIS httpd 6.0  |

<br>
# Default web roots
--------

| **Web Server** | **Route**                |
| -------------- | ------------------------ |
| Apache         | `/var/www/html/`         |
| Nginx          | `/usr/local/nginx/html/` |
| IIS            | `C:\inetpub\wwwroot\`    |
| XAMPP          | `C:\xampp\htdocs\`       |
