---
title: Enumeration
logo: /assets/images/cheatsheet.png
---


Welcome to the blog's [Enumeration Cheat Sheet](https://pwnerguy.github.io/cheatsheets/view/enumeration.html)! I will be actively updating it through commits as needed.


## Enum

| **Nmap**                                                                                                                                                                                                              | **Description**                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Host discovery and scanning**                                                                                                                                                                                       |                                                                                                      |
| `nmap 192.168.0.0/24 -sn -oA tnet \| grep for \| cut -d" " -f5`                                                                                                                                                       | Scan network range saving results                                                                    |
| `nmap -sn -oA tnet -iL hosts \| grep for \| cut -d" " -f5`<br>`nmap -sn -oA tnet 10.129.2.18 10.129.2.19 10.129.2.20 \| grep for \| cut -d" " -f5`<br>`nmap -sn -oA tnet 10.129.2.18-20 \| grep for \| cut -d" " -f5` | Scan specific network rangessaving results                                                           |
| `--packet-trace`                                                                                                                                                                                                      | Show all packets sends and received                                                                  |
| `--reason`                                                                                                                                                                                                            | Show why Nmap says the hosts are alive                                                               |
| `-PE`                                                                                                                                                                                                                 | Use ICMP Echo requests for the scan (but Nmap prioritizes ARP)                                       |
| `--disable-arp-ping`                                                                                                                                                                                                  | Disable ARP ping                                                                                     |
| `nmap -p- --open -sS --min-rate 5000 -vvv -n -Pn 10.10.10.10 -oG allPorts`                                                                                                                                            | Nmap open ports custom scan redirecting the output to allPorts file                                  |
| `nmap -sCV -p21,22,80 10.10.10.10`                                                                                                                                                                                    | Nmap basic recon scripts scan over speccific ports showing service version                           |
| `-Pn`                                                                                                                                                                                                                 | Disable ICMP Echo requests                                                                           |
| `-n`                                                                                                                                                                                                                  | Disable DNS resolution                                                                               |
| `-sS`                                                                                                                                                                                                                 | SYN Sealth Scan (doesn't complete the THW, being faster and sealth)                                  |
| `-sT`                                                                                                                                                                                                                 | TCP Scan (default scan). It uses the TWH to determinate port status (noisy, but polite)              |
| `-sU`                                                                                                                                                                                                                 | UDP scan                                                                                             |
| `--initial-rtt-timeout`<br>`--max-rtt-timeout`                                                                                                                                                                        | Time to receive a response from the scanned port                                                     |
| `--max-retries`                                                                                                                                                                                                       | Max amount of retries Nmap does when scanning ports                                                  |
| `--min-rate`                                                                                                                                                                                                          | Set the amount of packets that are going to simultaneously be sent                                   |
| `-T 0-5`                                                                                                                                                                                                              | Timing templates. T3 is the default one.                                                             |
| **NSE**                                                                                                                                                                                                               |                                                                                                      |
| `auth`                                                                                                                                                                                                                | Auth credentials                                                                                     |
| `broadcast`                                                                                                                                                                                                           | Host discovery by broadcasting and the discovered hosts                                              |
| `brute`                                                                                                                                                                                                               | Log in by brute-forcing with credentials                                                             |
| `default`<br>`sudo nmap <target> -sC`                                                                                                                                                                                 | Basic scripts                                                                                        |
| `discovery`                                                                                                                                                                                                           | Evaluation of accessible services                                                                    |
| `dos`                                                                                                                                                                                                                 | Check if the host is vulnerable to DOS                                                               |
| `exploit`                                                                                                                                                                                                             | Exploit known vulnerabilities for the scanned port                                                   |
| `external`                                                                                                                                                                                                            | Scripts that use external services for further processing                                            |
| `fuzzer`                                                                                                                                                                                                              | Identify vulns and unexpected packet handling by sending different fields, which can take much time  |
| `intrusive`                                                                                                                                                                                                           | Intrusive scripts that could negatively affect the target system                                     |
| `malware`                                                                                                                                                                                                             | Checks if some malware infects the target system                                                     |
| `safe`                                                                                                                                                                                                                | Defensive scripts that do not perform intrusive and destructive access                               |
| `version`                                                                                                                                                                                                             | Extension for service detection                                                                      |
| `vuln`                                                                                                                                                                                                                | Identification of specific vulnerabilities                                                           |
| `nmap 10.10.10.10 --script <category>`                                                                                                                                                                                | Specific scripts category                                                                            |
| `nmap 10.10.10.10 --script <script-name>,<script-name>,...`                                                                                                                                                           | Specific defined scripts                                                                             |
| ``nmap -sV --script=banner -p21,22,80 10.10.10.10``                                                                                                                                                                   | Banner grabbing                                                                                      |
| `locate scripts/<script-name>`                                                                                                                                                                                        | List various available nmap scripts                                                                  |
| `nmap --script-updatedb`                                                                                                                                                                                              | Update NSE DB                                                                                        |
| **Firewall and IDS/IPS evasion**                                                                                                                                                                                      |                                                                                                      |
| `-sA`                                                                                                                                                                                                                 | TCP ACK scan, it sends TCP packets with only the ACK flag, being harder to filter.                   |
| `-D RND:5`                                                                                                                                                                                                            | Decoy scanning method generates various random source IP addresses for the scan                      |
| `-f`                                                                                                                                                                                                                  | Packets fragmentation                                                                                |
| `--mtu`                                                                                                                                                                                                               | MTU is a firewall value used in Nmap to bypass firewalls by adjunsting the size of the packets sent. |
| `--data-length 21`                                                                                                                                                                                                    | Packet size                                                                                          |
| `-S 10.10.10.10`                                                                                                                                                                                                      | Specifies the source IP address for the scan                                                         |
| `--spoof-mac`                                                                                                                                                                                                         | Spoof origin MAC address                                                                             |
| `-g 53`                                                                                                                                                                                                               | Specifies the source port for the scan                                                               |
| `-e tun0`                                                                                                                                                                                                             | Speficies the source interface for the scan                                                          |
| `--dns-server <ns>,<ns>`                                                                                                                                                                                              | Specifies the DNS server used for the scan                                                           |
| `ncat -nv --source-port 53 10.129.2.28 50000`                                                                                                                                                                         | Connect to a port using netcat from port 53/tcp (accepted by the firewall)                           |
| **Output options**                                                                                                                                                                                                    |                                                                                                      |
| `-oN filename`                                                                                                                                                                                                        | Normal format                                                                                        |
| `-oA filename`                                                                                                                                                                                                        | All available formats                                                                                |
| `-oG filename`                                                                                                                                                                                                        | "Grepeable" format                                                                                   |
| `-oX filename`<br>`xsltproc target.xml -o target.html`                                                                                                                                                                | XML format and XML conversion to HTML                                                                |

| **Possible Nmap alternatives**                       |                                                    |
| ---------------------------------------------------- | -------------------------------------------------- |
| `masscan -p21,22,80 -Pn 10.10.10.10/16 --rate=10000` | Valid alternative to nmap                          |
| `arp-scan -I eth0 --localnet --ignoredups`           | ARP scan in the local network.                     |
| `netdiscover`                                        | Util to perform a scan in the local network.       |
| `ping -c 1 10.10.10.10`                              | ICMP packet                                        |
| `echo '' > /dev/tcp/10.10.10.10/80`                  | Communications to /dev/tcp, an alternative to ICMP |

## Web Enum

| **Web Enum**                                                                                                           |                                                                |
| ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `curl -IL https://10.10.10.10`                                                                                         | Grab website banner                                            |
| `whatweb 10.10.10.10`                                                                                                  | List details about the webserver/certificates                  |
| `whatweb --no-errors 10.10.10.10/16`                                                                                   | Web App enumeration across a network                           |
| `ctrl+u`                                                                                                               | View page source code (in Firefox)                             |
| `gobuster dir -u http://10.10.10.10/ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 20` | Run a directory scan on a website using 20 threats             |
| `gobuster dns -d test.local -w /usr/share/SecLists/Discovery/DNS/namelist.txt -t 20`                                   | Run an active domain enumeration on a website using 20 threats |
| `openssl s_client -connect test.local:443`                                                                             | Inspect the site's SSL certificate                             |
| `sslscan test.local`                                                                                                   | Scan to search vulns in a HTTPS site                           |

-------
## FTP

| **Command**                                                    | **Description**                                           |
| -------------------------------------------------------------- | --------------------------------------------------------- |
| `ftp 10.10.10.10`                                              | Connecting to FTP                                         |
| `status`                                                       | Overview server's settings                                |
| `debug`<br>`trace`                                             | Show additional info of the operations                    |
| `ls -R`                                                        | Recursive listing (if it's enabled)                       |
| `get`                                                          | Download a file                                           |
| `wget -m --no-passive ftp://anonymous:anonymous@10.129.14.136` | Download all available files                              |
| `put`                                                          | Upload a file from the current folder                     |
| `openssl s_client -connect 10.129.14.136:21 -starttls ftp`     | Connect to a FTP server that runs with TLS/SSL encryption |

## SMB

| **Command**                                                                                                                                                                           | **Description**                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `smbclient -N -L //10.10.10.10`                                                                                                                                                       | Authentication as 'guest' on SMB                                                                                          |
| `smbclient //10.10.10.10/share -N`                                                                                                                                                    | Authentication as 'guest' on SMB shared resource                                                                          |
| `smbclient //10.10.10.10/share -U user password`                                                                                                                                      | Authentication with valid credentials on SMB shared resource                                                              |
| `get`                                                                                                                                                                                 | Download files                                                                                                            |
| `!command`                                                                                                                                                                            | Execute local system commands                                                                                             |
| `!smbstatus`<br>                                                                                                                                                                      | Info of the connection<br>                                                                                                |
| `rpcclient -U "" 10.10.10.10`<br><br>`srvinfo`<br>`enumdomains`<br>`querydominfo`<br>`netshareenumall`<br>`netsharegetinfo shared_resource`<br>`enumdomusers`<br>`queryuser user_RID` | Interaction with the target using RPC<br><br>[Manual](https://www.samba.org/samba/docs/current/man-html/rpcclient.1.html) |
| `for i in $(seq 500 1100);do rpcclient -N -U "" 10.129.14.128 -c "queryuser 0x$(printf '%x\n' $i)" \| grep "User Name\|user_rid\|group_rid" && echo "";done`                          | Brute force user RIDs                                                                                                     |
| `samrdump 10.10.10.10`                                                                                                                                                                | Username enumeration using Impacket scripts                                                                               |
| `smbmap -H 10.10.10.10`                                                                                                                                                               | Enumerating SMB shares                                                                                                    |
| `crackmapexec smb 10.10.10.10 --shares -u '' -p ''`                                                                                                                                   | Authentication as 'guest' on SMB                                                                                          |
| `enum4linux-ng 10.10.10.10 -A`                                                                                                                                                        | SMB enumeration using enum4linux                                                                                          |

## NFS

| **Command**                                               | **Description**                 |
| --------------------------------------------------------- | ------------------------------- |
| `showmount -e 10.10.10.10`                                | Show available NFS shares       |
| `mount -t nfs 10.10.10.10:/share ./target-NFS/ -o nolock` | Mount a NFS share               |
| `ls -n`                                                   | List contents with UIDs & GUIDs |
| `umount ./target-NFS`                                     | Umount a NFS share              |

## DNS

| **Command**                                                                                                                                                                                                              | **Description**                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| `dig soa www.inlanefreight.com`                                                                                                                                                                                          | Domain SOA record                           |
| `dig ns inlanefreight.com @10.10.10.10`                                                                                                                                                                                  | Domain NS records                           |
| `dig CH TXT version.bind 10.10.10.10`                                                                                                                                                                                    | DNS server's version (if this entry exists) |
| `dig any inlanefreight.com @10.10.10.10`                                                                                                                                                                                 | Domain info (all records)                   |
| `dig axfr internal.inlanefreight.htb @10.10.10.10`                                                                                                                                                                       | Zone's info                                 |
| `for sub in $(cat /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt);do dig $sub.inlanefreight.htb @10.129.14.128 \| grep -v ';\|SOA' \| sed -r '/^\s*$/d' \| grep $sub \| tee -a subdomains.txt;done` | Subdomain bash brute forcing                |
| `dnsenum --dnsserver 10.10.10.10 --enum -p 0 -s 0 -o subdomains.txt -f /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt inlanefreight.htb`                                                            | Subdomain dnsenum brute forcing             |

## SMTP

| **Command**                                              | **Description**                |
| -------------------------------------------------------- | ------------------------------ |
| `snmpwalk -v 2c -c public 10.10.10.10 1.3.6.1.2.1.1.5.0` | Scan SNMP on an IP             |
| `onesixtyone -c dict.txt 10.10.10.10`                    | Brute force SNMP secret string |

<br>

### OSINT Cheat Sheet: https://pwnerguy.github.io/osint-cheatsheet/


### TTL Ripper utility (by pwnerguy): https://github.com/pwnerguy/ttl-ripper

