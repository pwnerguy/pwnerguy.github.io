---
layout: single
title: Enumeration Cheat Sheet
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

Welcome to the blog's **Enumeration Cheat Sheet**! I will be actively updating it through commits as needed.

<br>
# Enum
-------------

| **Nmap**                                                                                                                                                                                                                          | **Description**                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Host discovery and scanning**                                                                                                                                                                                                   |                                                                                                      |
| `nmap 192.168.0.0/24 -sn -oA tnet `\|` grep for `\|` cut -d" " -f5`                                                                                                                                                               | Scan network range saving results                                                                    |
| `nmap -sn -oA tnet -iL hosts `\|` grep for `\|` cut -d" " -f5`<br>`nmap -sn -oA tnet 10.129.2.18 10.129.2.19 10.129.2.20 `\|` grep for `\|` cut -d" " -f5`<br>`nmap -sn -oA tnet 10.129.2.18-20 `\|` grep for `\|` cut -d" " -f5` | Scan specific network rangessaving results                                                           |
| `--packet-trace`                                                                                                                                                                                                                  | Show all packets sends and received                                                                  |
| `--reason`                                                                                                                                                                                                                        | Show why Nmap says the hosts are alive                                                               |
| `-PE`                                                                                                                                                                                                                             | Use ICMP Echo requests for the scan (but Nmap prioritizes ARP)                                       |
| `--disable-arp-ping`                                                                                                                                                                                                              | Disable ARP ping                                                                                     |
| `nmap -p- --open -sS --min-rate 5000 -vvv -n -Pn 10.10.10.10 -oG allPorts`                                                                                                                                                        | Nmap open ports custom scan redirecting the output to allPorts file                                  |
| `nmap -sCV -p21,22,80 10.10.10.10`                                                                                                                                                                                                | Nmap basic recon scripts scan over speccific ports showing service version                           |
| `-Pn`                                                                                                                                                                                                                             | Disable ICMP Echo requests                                                                           |
| `-n`                                                                                                                                                                                                                              | Disable DNS resolution                                                                               |
| `-sS`                                                                                                                                                                                                                             | SYN Sealth Scan (doesn't complete the THW, being faster and sealth)                                  |
| `-sT`                                                                                                                                                                                                                             | TCP Scan (default scan). It uses the TWH to determinate port status (noisy, but polite)              |
| `-sU`                                                                                                                                                                                                                             | UDP scan                                                                                             |
| `--initial-rtt-timeout`<br>`--max-rtt-timeout`                                                                                                                                                                                    | Time to receive a response from the scanned port                                                     |
| `--max-retries`                                                                                                                                                                                                                   | Max amount of retries Nmap does when scanning ports                                                  |
| `--min-rate`                                                                                                                                                                                                                      | Set the amount of packets that are going to simultaneously be sent                                   |
| `-T 0-5`                                                                                                                                                                                                                          | Timing templates. T3 is the default one.                                                             |
| **NSE**                                                                                                                                                                                                                           |                                                                                                      |
| `auth`                                                                                                                                                                                                                            | Auth credentials                                                                                     |
| `broadcast`                                                                                                                                                                                                                       | Host discovery by broadcasting and the discovered hosts                                              |
| `brute`                                                                                                                                                                                                                           | Log in by brute-forcing with credentials                                                             |
| `default`<br>`sudo nmap <target> -sC`                                                                                                                                                                                             | Basic scripts                                                                                        |
| `discovery`                                                                                                                                                                                                                       | Evaluation of accessible services                                                                    |
| `dos`                                                                                                                                                                                                                             | Check if the host is vulnerable to DOS                                                               |
| `exploit`                                                                                                                                                                                                                         | Exploit known vulnerabilities for the scanned port                                                   |
| `external`                                                                                                                                                                                                                        | Scripts that use external services for further processing                                            |
| `fuzzer`                                                                                                                                                                                                                          | Identify vulns and unexpected packet handling by sending different fields, which can take much time  |
| `intrusive`                                                                                                                                                                                                                       | Intrusive scripts that could negatively affect the target system                                     |
| `malware`                                                                                                                                                                                                                         | Checks if some malware infects the target system                                                     |
| `safe`                                                                                                                                                                                                                            | Defensive scripts that do not perform intrusive and destructive access                               |
| `version`                                                                                                                                                                                                                         | Extension for service detection                                                                      |
| `vuln`                                                                                                                                                                                                                            | Identification of specific vulnerabilities                                                           |
| `nmap 10.10.10.10 --script <category>`                                                                                                                                                                                            | Specific scripts category                                                                            |
| `nmap 10.10.10.10 --script <script-name>,<script-name>,...`                                                                                                                                                                       | Specific defined scripts                                                                             |
| ``nmap -sV --script=banner -p21,22,80 10.10.10.10``                                                                                                                                                                               | Banner grabbing                                                                                      |
| `locate scripts/<script-name>`                                                                                                                                                                                                    | List various available nmap scripts                                                                  |
| **Firewall and IDS/IPS evasion**                                                                                                                                                                                                  |                                                                                                      |
| `-sA`                                                                                                                                                                                                                             | TCP ACK scan, it sends TCP packets with only the ACK flag, being harder to filter.                   |
| `-D RND:5`                                                                                                                                                                                                                        | Decoy scanning method generates various random source IP addresses for the scan                      |
| `-f`                                                                                                                                                                                                                              | Packets fragmentation                                                                                |
| `--mtu`                                                                                                                                                                                                                           | MTU is a firewall value used in Nmap to bypass firewalls by adjunsting the size of the packets sent. |
| `--data-length 21`                                                                                                                                                                                                                | Packet size                                                                                          |
| `-S 10.10.10.10`                                                                                                                                                                                                                  | Specifies the source IP address for the scan                                                         |
| `--spoof-mac`                                                                                                                                                                                                                     | Spoof origin MAC address                                                                             |
| `-g 53`                                                                                                                                                                                                                           | Specifies the source port for the scan                                                               |
| `-e tun0`                                                                                                                                                                                                                         | Speficies the source interface for the scan                                                          |
| `--dns-server <ns>,<ns>`                                                                                                                                                                                                          | Specifies the DNS server used for the scan                                                           |
| `ncat -nv --source-port 53 10.129.2.28 50000`                                                                                                                                                                                     | Connect to a port using netcat from port 53/tcp (accepted by the firewall)                           |
| **Output options**                                                                                                                                                                                                                |                                                                                                      |
| `-oN filename`                                                                                                                                                                                                                    | Normal format                                                                                        |
| `-oA filename`                                                                                                                                                                                                                    | All available formats                                                                                |
| `-oG filename`                                                                                                                                                                                                                    | "Grepeable" format                                                                                   |
| `-oX filename`<br>`xsltproc target.xml -o target.html`                                                                                                                                                                            | XML format and XML conversion to HTML                                                                |

| **Nmap alternatives**                                |                                                    |
| ---------------------------------------------------- | -------------------------------------------------- |
| `masscan -p21,22,80 -Pn 10.10.10.10/16 --rate=10000` | Valid alternative to nmap                          |
| `arp-scan -I eth0 --localnet --ignoredups`           | ARP scan in the local network.                     |
| `netdiscover`                                        | Util to perform a scan in the local network.       |
| `ping -c 1 10.10.10.10`                              | ICMP packet                                        |
| `echo '' > /dev/tcp/10.10.10.10/80`                  | Communications to /dev/tcp, an alternative to ICMP |

<br>
# Web Enum
------

| **Web Enum**                                                                                                     |                                                                               |
| ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `curl -IL https://10.10.10.10`                                                                                   | Grab website banner                                                           |
| `gobuster dir -u http://10.10.10.10/ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt` | Run a directory scan on a website using 20 threats                            |
| `whatweb 10.10.10.10`                                                                                            | List details about the webserver/certificates                                 |
| `whatweb --no-errors 10.10.10.10/16`                                                                             | Web App enumeration across a network                                          |
| `ctrl+u`                                                                                                         | View page source code (in Firefox)                                            |
| `openssl s_client -connect test.local:443`                                                                       | Inspect the site's SSL certificate                                            |
| `sslscan test.local`                                                                                             | Scan to search vulns in a HTTPS site                                          |

<br>
# Common services enum
-----

| **Common Services Enum**                                 |                                                      |
| -------------------------------------------------------- | ---------------------------------------------------- |
| `smbclient -L -N //10.10.10.10`                          | List SMB Shares                                      |
| `smbmap -H //10.10.10.10`                                | List SMB Shares and its permissions                  |
| `smbclient //10.10.10.10/share -N`                       | Connect to a SMB share as 'guest' to see files       |
| `smbclient //10.10.10.10/share -U user password`         | Connect to a SMB share with credentials to see files |
| `netcat 10.10.10.10 8080`                                | Banner Grabbing                                      |
| `ftp -p 10.10.10.10`                                     | Connecting to FTP as Anonymous                       |
| `snmpwalk -v 2c -c public 10.10.10.10 1.3.6.1.2.1.1.5.0` | Scan SNMP on an IP                                   |
| `onesixtyone -c dict.txt 10.10.10.10`                    | Brute force SNMP secret string                       |

<br>
# OSINT
------

| **Util**                           | **URL**                                                                                                                                      |
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
| Whois                              | [https://www.dondominio.com/es/whois](https://www.dondominio.com/es/whois)                                                                   |
| dnsdumpster                        | [https://dnsdumpster.com](https://dnsdumpster.com)                                                                                           |
| ctfr.py                            | [https://github.com/UnaPibaGeek/ctfr/blob/master/ctfr.py](https://github.com/UnaPibaGeek/ctfr/blob/master/ctfr.py)                           |
| crt.sh                             | [http://crt.sh](http://crt.sh)                                                                                                               |
| Gobuster                           | `gobuster dns -d test.local -w /usr/share/SecLists/Discovery/DNS/namelist.txt`                                                               |
| **Dorking**                        |                                                                                                                                              |
| Implemented Search Engine          | [https://pentest-tools.com/information-gathering/google-hacking](https://pentest-tools.com/information-gathering/google-hacking)             |
| Dorking Manual                     | [https://www.exploit-db.com/google-hacking-database ](https://www.exploit-db.com/google-hacking-database)                                    |
| **Web Technologies**               |                                                                                                                                              |
| Wappalyzer addon for Firefox       | [https://addons.mozilla.org/en-US/firefox/addon/wappalyzer/Wappalyzer](https://addons.mozilla.org/en-US/firefox/addon/wappalyzer/Wappalyzer) |
| BuiltWith                          | [https://builtwith.com](https://builtwith.com)                                                                                               |

<br>
# OS Version
----

| **Ubuntu**           | **OpenSSH** | **Apache** | **nginx** |
| -------------------- | ----------- | ---------- | --------- |
| 14.04 - Trusty [LTS] | 6.6p1       | 2.4.7      | 1.4.6     |
| 14.10 - Utopic       | 6.6p1       | 2.4.10     | 1.6.2     |
| 15.04 - Vivid        | 6.7p1       | 2.4.12     | 1.6.2     |
| 15.10 - Wily         | 6.9p1       | 2.4.12     | 1.6.2     |
| 16.04 - Xenial [LTS] | 7.2p1       | 2.4.18     | 1.10.0    |
| 16.10 - Yakketty     | 7.2p1       | 2.4.18     | 1.10.0    |
| 17.04 - Zesty        | 7.4p1       | 2.4.25     | 1.12.0    |
| 17.10 - Artful       | 7.6p1       | 2.4.27     | 1.13.3    |
| 18.04 - Bionic [LTS] | 7.6p1       | 2.4.29     | 1.14.0    |
| 18.10 - Cosmic       | 7.7p1       | 2.4.34     | 1.16.0    |
| 19.04 - Disco        | 7.9p1       | 2.4.35     | 1.16.0    |
| 19.10 - Eoan         | 7.9p1       | 2.4.41     | 1.17.3    |
| 20.04 - Focal [LTS]  | 8.2p1       | 2.4.41     | 1.18.0    |
| 20.10 - Groovy       | 8.2p1       | 2.4.46     | 1.18.0    |
| 21.04 - Hirsute      | 8.4p1       | 2.4.48     | 1.20.1    |
| 21.10 - Impish       | 8.4p1       | 2.4.51     | 1.20.1    |
| 22.04 - Jimmy [LTS]  | 8.9p1       | 2.4.52     | 1.18.0    |
| 22.10 - Kinetic      | 8.9p1       | 2.4.52     | 1.22.0    |
| 23.04 - Junar        | 9.0p1       | 2.4.54     | 1.24.0    |
| 23.10 - Mantic       | 9.3p1       | 2.4.57     | 1.24.0    |
| 24.04 - Noble [LTS]  | 9.6p1       | 2.4.58     | 1.24.0    |
| 24.10 - Oracular     | 9.7p1       | 2.4.62     | 1.26.0    |
| 25.04 - Plucky       | 9.9p1       | 2.4.63     | 1.26.3    |

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

| **Windows**                | **IIS** |
| -------------------------- | ------- |
| 10 / Server 2016 and later | 10.0    |
| 8.1 / Server 2012 R2       | 8.5     |
| 7 / Server 2008 R2         | 7.5     |
| XP (x64) / Server 2003     | 6.0     |

<br>
# Default Web Roots
--------

| **Web Server** | **Root**                                  |
| -------------- | ----------------------------------------- |
| Apache         | `/var/www/html/`                          |
| nginx          | `/usr/local/nginx/html/`                  |
| IIS            | `C:\inetpub\wwwroot\`                     |
| XAMPP          | `C:\xampp\htdocs\`<br>`/opt/lampp/htdocs` |


