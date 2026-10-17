const express = require('express');
const router = express.Router();
const { getDB } = require('../utils/firebase');

const requireAdmin = (req, res, next) => next();

function isFirebaseAvailable() {
  try { return !!getDB(); } catch { return false; }
}

router.get('/', async (req, res) => {
  try {
    if (isFirebaseAvailable()) {
      const snap = await getDB().collection('reviewImages').get();
      const images = snap.docs.map(d => ({ ...d.data(), id: d.id }))
                              .filter(v => v.active !== false)
                              .sort((a, b) => (a.order || 0) - (b.order || 0));
      return res.json({ success: true, images }); // Notice it returns images
    }
    res.json({ success: true, images: [] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch' });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  const { url, label, order } = req.body;
  if (!url) return res.status(400).json({ success: false, message: 'URL is required' });
  
  try {
    const newImg = { url, label: label || '', order: Number(order) || 0, active: true, createdAt: new Date().toISOString() };
    if (isFirebaseAvailable()) {
      const docRef = await getDB().collection('reviewImages').add(newImg);
      newImg.id = docRef.id;
      return res.json({ success: true, image: newImg });
    }
    res.status(500).json({ success: false, message: 'Firebase not available' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    if (isFirebaseAvailable()) {
      await getDB().collection('reviewImages').doc(req.params.id).delete();
      return res.json({ success: true, message: 'Deleted' });
    }
    res.status(500).json({ success: false, message: 'Firebase not available' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete' });
  }
});

module.exports = router;

