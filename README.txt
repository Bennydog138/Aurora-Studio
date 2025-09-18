Premium Static Service Order Portal (animated gradient + Kanban)

Files:
- index.html    -> Public site for clients
- admin.html    -> Admin Kanban dashboard (drag & drop)
- styles.css    -> Premium styling & animated gradient
- app.js        -> Client-side order logic (localStorage)
- admin.js      -> Admin logic + drag & drop (localStorage)
- README.txt    -> This file

How to use:
1. Extract and open index.html in a modern browser.
2. Place orders from the public site. Orders are saved in localStorage under key 'sop_orders_premium'.
3. Open admin.html and enter password when prompted: admin123 (change it in admin.js for production).
4. Drag cards between Pending / In Progress / Complete to update status. Export CSV from the left panel.

Security note:
This demo uses client-side storage and client-side auth (prompt + localStorage). For production, implement a secure backend and server-side auth.