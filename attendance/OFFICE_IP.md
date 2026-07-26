# Office access (LAN) + admin from anywhere

## Problem: router gets a new public IP

After the office router turns off/on, the **ISP public IP** often changes. Allowlisting that public IP means attendance breaks until you update the list.

## Solution (chosen): host on the office LAN

Run the attendance app on a PC/server **inside the office**. Staff open:

`http://192.168.x.x:3001/` (example)

The server sees private IPs like `192.168.1.50`, not the ISP IP — **reboot-safe**.

Shipped [`public/.htaccess`](public/.htaccess) allows:

- `192.168.0.0/16`
- `10.0.0.0/8`
- `172.16.0.0/12`
- `127.0.0.1` (local test)

## Admin from anywhere

Same `.htaccess` also allows **from the public internet**:

- `/admin/`
- `/login/`
- `/_next/` (assets)

Staff `/dashboard/` stays **LAN-only**. Off-network staff get the 403 page.

## Optional: still use a public IP

Only if you host on Hostinger (public internet) instead of an office PC — then add `Require ip YOUR_PUBLIC_IP` and update it when the ISP changes. Prefer LAN hosting.

## See also

[`ARCHITECTURE.md`](ARCHITECTURE.md)
