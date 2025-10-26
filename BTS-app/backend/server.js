
const express = require('express');
const cors = require('cors');
const data = require('./db.json');

const app = express();
const port = 3001;

app.use(cors());

app.get('/api/members', (req, res) => {
  res.json(data.members);
});

app.get('/api/members/:id', (req, res) => {
  const member = data.members.find(m => m.id === parseInt(req.params.id));
  if (member) {
    res.json(member);
  } else {
    res.status(404).json({ message: 'Member not found' });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
