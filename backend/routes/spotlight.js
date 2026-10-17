
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/spotlight.json');

router.get('/', (req, res) => {
  if (!fs.existsSync(dataPath)) {
    return res.json({ spotlight: [] });
  }
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  res.json(data);
});

router.post('/', (req, res) => {
  const { spotlight } = req.body;
  fs.writeFileSync(dataPath, JSON.stringify({ spotlight }, null, 2));
  res.json({ message: 'Spotlight updated' });
});

module.exports = router;

