# Office IP allowlist (attendance only)

`attendance.teqnowebs.com` is locked to your **office public IP**.  
`teqnowebs.com` stays open worldwide — do not add IP rules to the main site `.htaccess`.

## Where to edit

File: [`public/.htaccess`](public/.htaccess)

```apache
Require ip REPLACE_WITH_OFFICE_PUBLIC_IP
# Require ip SECOND_IP_IF_NEEDED
```

Replace `REPLACE_WITH_OFFICE_PUBLIC_IP` with a real IPv4 address, for example:

```apache
Require ip 203.0.113.10
```

You can edit this:

1. In the repo before `npm run build`, or  
2. Directly on Hostinger in `public_html/attendance/.htaccess` after upload.

## How to find the office public IP

1. Connect a phone or laptop to office Wi‑Fi (`TQwebs` or `TQwebs 5G`).
2. Open [https://whatismyip.com](https://whatismyip.com) (or similar).
3. Copy the IPv4 address shown.
4. Paste it into the `Require ip` line.

Both SSIDs usually share the **same** public IP (same router/ISP). Use a second `Require ip` line only if you confirm a different IP.

## Important

- This is **public IP** access, not “only this SSID name”. Anyone on that office internet connection can open the attendance site (they still need a staff login).
- If the ISP changes your office IP, update `.htaccess` again.
- Staff off-site (home/mobile data) will see the 403 “Office network only” page unless they use an office VPN that exits via the office IP.
