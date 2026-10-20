# DERA ZONE Website — Complete Customization Guide
### A step-by-step tutorial for beginners

---

> **How to open and edit files:**
> Use any code editor. The best free option is **VS Code** (Visual Studio Code).
> Download it free from: https://code.visualstudio.com
> Once installed: File → Open Folder → select your project folder.
> Every file mentioned below will appear in the left sidebar. Click to open.

---

## PART 1 — Connect Your WhatsApp Number

**File to open:** `js/whatsapp-config.js`

This file controls your WhatsApp button, social media links, and contact information across the ENTIRE website. You only edit this ONE file and it updates everywhere automatically.

---

### Step 1.1 — Add Your WhatsApp Number

Open `js/whatsapp-config.js` and update your phone number:

```javascript
number:  '923294551652',
```

**How to write your number correctly:**
- Start with your country code (Pakistan = 92)
- Then write your number WITHOUT the leading zero
- NO spaces, NO dashes, NO plus sign (+)

---

### Step 1.2 — Change the WhatsApp Welcome Message

```javascript
message: 'Hello DERA ZONE, I have an inquiry.',
```

---

## PART 2 — Connect Your Social Links & Contact Details

Still in `js/whatsapp-config.js`:

```javascript
instagram: 'https://www.instagram.com/derazone.pk',
facebook:  'https://www.facebook.com/derazone',
email:     'info@derazone.com',
phone:     '+92 329 4551652',
location:  'Pakistan',
hours:     'Monday – Saturday: 10:00am – 8:00pm',
```

---

## PART 3 — Running the Server & Admin Dashboard

### Local Development:
```bash
# Start server
node backend/server.js
```
- Storefront: `http://localhost:3001`
- Admin Dashboard: `http://localhost:3001/admin`

---

*Made for DERA ZONE — Shop Smart. Live Better.*
