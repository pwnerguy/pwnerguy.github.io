---
title: OSINT
logo: /assets/images/cheatsheet.png
---

Welcome to the blog's [OSINT Cheat Sheet](https://pwnerguy.github.io/cheatsheets/view/osint.html)! I will be actively updating it through commits as needed.

## OSINT

| **Util**                     | **URL**                                                                                                                                                                                                                                                                                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mails and credentials**    |                                                                                                                                                                                                                                                                                                                                                          |
| Hunter                       | [https://hunter.io](https://hunter.io)                                                                                                                                                                                                                                                                                                                   |
| Phonebook                    | [https://phonebook.cz](https://phonebook.cz)                                                                                                                                                                                                                                                                                                             |
| VerifyEmailAddress           | [https://www.verifyemailaddress.org](https://www.verifyemailaddress.org)                                                                                                                                                                                                                                                                                 |
| Email Checker                | [https://email-checker.net](https://email-checker.net)                                                                                                                                                                                                                                                                                                   |
| HIBP                         | [https://haveibeenpwned.com/](https://haveibeenpwned.com/)                                                                                                                                                                                                                                                                                               |
| HIBP (phone numbers)         | [https://www.passwordmanager.com/have-i-been-pwned/](https://www.passwordmanager.com/have-i-been-pwned/)                                                                                                                                                                                                                                                 |
| leakpeek                     | [https://leakpeek.com](https://leakpeek.com)                                                                                                                                                                                                                                                                                                             |
| Epieos                       | [https://epieos.com](https://epieos.com)                                                                                                                                                                                                                                                                                                                 |
| Shodan                       | [https://www.shodan.io](https://www.shodan.io)<br>`for i in $(cat subdomainlist);do host $i `\|` grep "has address" `\|` grep inlanefreight.com `\|` cut -d" " -f4 >> ip-addresses.txt;done`<br>`for i in $(cat ip-addresses.txt);do shodan host $i;done`                                                                                                |
| Social Searcher              | [https://www.social-searcher.com](https://www.social-searcher.com)                                                                                                                                                                                                                                                                                       |
| WhatsMyName                  | [https://whatsmyname.app](https://whatsmyname.app)                                                                                                                                                                                                                                                                                                       |
| Censys                       | [https://search.censys.io](https://search.censys.io)                                                                                                                                                                                                                                                                                                     |
| **Images**                   |                                                                                                                                                                                                                                                                                                                                                          |
| Pimeyes                      | [https://pimeyes.com](https://pimeyes.com)                                                                                                                                                                                                                                                                                                               |
| Google Images                | [https://images.google.com](https://images.google.com)                                                                                                                                                                                                                                                                                                   |
| **Domains**                  |                                                                                                                                                                                                                                                                                                                                                          |
| Phonebook                    | [https://phonebook.cz](https://phonebook.cz)                                                                                                                                                                                                                                                                                                             |
| WhoIs                        | [https://www.dondominio.com/es/whois](https://www.dondominio.com/es/whois)                                                                                                                                                                                                                                                                               |
| DNSDumpster                  | [https://dnsdumpster.com](https://dnsdumpster.com)                                                                                                                                                                                                                                                                                                       |
| ctfr.py                      | [https://github.com/UnaPibaGeek/ctfr/blob/master/ctfr.py](https://github.com/UnaPibaGeek/ctfr/blob/master/ctfr.py)                                                                                                                                                                                                                                       |
| crt.sh                       | [https://crt.sh](https://crt.sh)<br>`curl 'https://crt.sh/?q=inlanefreight.com&output=json' `\|` jq . `\|` grep name `\|` cut -d":" -f2 `\|` grep -v "CN=" `\|` cut -d'"' -f2 `\|` awk '{gsub(/\\n/,"\n");}1;' `\|` sort -u`<br>`for i in $(cat subdomainlist);do host $i `\|` grep "has address" `\|` grep inlanefreight.com `\|` cut -d" " -f1,4;done` |
| Dig                          | `dig any inlanefreight.com`                                                                                                                                                                                                                                                                                                                              |
| **Dorking**                  |                                                                                                                                                                                                                                                                                                                                                          |
| Implemented Search Engine    | [https://pentest-tools.com/information-gathering/google-hacking](https://pentest-tools.com/information-gathering/google-hacking)                                                                                                                                                                                                                         |
| Dorking Manual               | [https://www.exploit-db.com/google-hacking-database ](https://www.exploit-db.com/google-hacking-database)                                                                                                                                                                                                                                                |
| GrayHatWarfare               | [https://buckets.grayhatwarfare.com/](https://buckets.grayhatwarfare.com/)                                                                                                                                                                                                                                                                               |
| **Web Technologies**         |                                                                                                                                                                                                                                                                                                                                                          |
| Wappalyzer addon for Firefox | [https://addons.mozilla.org/en-US/firefox/addon/wappalyzer/Wappalyzer](https://addons.mozilla.org/en-US/firefox/addon/wappalyzer/Wappalyzer)                                                                                                                                                                                                             |
| BuiltWith                    | [https://builtwith.com](https://builtwith.com)                                                                                                                                                                                                                                                                                                           |

## OS Version

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

## Default Web Roots

| **Web Server** | **Root**                                  |
| -------------- | ----------------------------------------- |
| Apache         | `/var/www/html/`                          |
| nginx          | `/usr/local/nginx/html/`                  |
| IIS            | `C:\inetpub\wwwroot\`                     |
| XAMPP          | `C:\xampp\htdocs\`<br>`/opt/lampp/htdocs` |


