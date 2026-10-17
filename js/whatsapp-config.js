/* ============================================================
   DERA ZONE — Site Configuration
   ============================================================ */
const DERAZONE_CONFIG = {
  /* ── WhatsApp ── */
  whatsapp: {
    number:  '923294551652',
    message: 'Hi! I found you on DERA ZONE and I have a question.',
  },
  /* ── Social Media ── */
  social: {
    instagram: 'https://www.instagram.com/derazone01?stkn=MXVnNnd3cTJyNHEydw==',
    facebook:  'https://www.facebook.com/share/1KD2yz1GPn/',
    tiktok:    'https://www.tiktok.com/@derazone001?_r=1&_t=ZS-99wDO848b7x',
    whatsapp:  '',
  },
  /* ── Contact ── */
  contact: {
    email:    'derazone001@gmail.com',
    phone:    '+92 329 4551652',
    location: 'Pakistan',
    hours:    'Monday – Saturday: 10am – 7pm',
  },
  /* ── Banking Info ── */
  bank: {
    bankName: 'Meezan Bank',
    accountTitle: 'DERA ZONE',
    accountNumber: '02260116195736',
    iban: 'PK05MEZN0002260116195736'
  }
};

/* Auto-build WhatsApp URL */
DERAZONE_CONFIG.social.whatsapp =
  `https://wa.me/${DERAZONE_CONFIG.whatsapp.number}` +
  `?text=${encodeURIComponent(DERAZONE_CONFIG.whatsapp.message)}`;

/* Make globally available */
window.DERAZONE_CONFIG = DERAZONE_CONFIG;
window.derazone_CONFIG = DERAZONE_CONFIG; // backwards compatibility

function applyContactInfo(root) {
  root = root || document;
  const c = DERAZONE_CONFIG.contact;
  root.querySelectorAll('[data-contact="email"]').forEach(el => {
    el.textContent = c.email;
    if (el.tagName === 'A') el.href = `mailto:${c.email}`;
  });
  root.querySelectorAll('[data-contact="phone"]').forEach(el => {
    el.textContent = c.phone;
    if (el.tagName === 'A') el.href = `tel:${c.phone.replace(/\s+/g, '')}`;
  });
}
document.addEventListener('DOMContentLoaded', () => applyContactInfo());
window.applyContactInfo = applyContactInfo;

