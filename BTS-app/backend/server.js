
const express = require('express');
const cors = require('cors');
const data = require('./db.json');

const app = express();
const port = 3001;

app.use(cors());

app.get('/api/members', (req, res) => {
  res.json(data.members);
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
