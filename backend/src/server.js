require('dotenv').config();
const express = require('express');
const path = require('path');
const webhookRoutes = require('./routes/webhook');
const webFormRoutes = require('./routes/web-form');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/output', express.static(path.join(__dirname, '../output')));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/api', webhookRoutes);
app.use('/api', webFormRoutes);

app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Kvell MOW API is running',
    endpoints: {
      webhook: '/api/webhook',
      webForm: '/api/web-form',
      output: '/output'
    }
  });
});

const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

app.listen(PORT, host, () => {
  console.log('🚀 Kvell Meals on Wheels Server Started');
  console.log(`📍 Running on port ${PORT}`);
  console.log(`🌐 Listening on ${host}:${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📧 SendGrid: ${process.env.SENDGRID_API_KEY ? 'YES' : 'NO'}`);
  console.log(`📞 Bland: ${process.env.BLAND_API_KEY ? 'YES' : 'NO'}`);
  console.log(`💌 Email To: ${process.env.EMAIL_TO || 'not set'}`);
});

module.exports = app;

// Debug route to check public folder
app.get('/debug-public', (req, res) => {
  const fs = require('fs');
  const publicPath = path.join(__dirname, '../public');
  fs.readdir(publicPath, (err, files) => {
    if (err) {
      res.json({ error: err.message, path: publicPath });
    } else {
      res.json({ files, path: publicPath });
    }
  });
});

// Explicit route for meal form
app.get('/meal-form.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/meal-form.html'));
});
