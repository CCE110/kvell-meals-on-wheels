require('dotenv').config();
const express = require('express');
const path = require('path');
const webhookRoutes = require('./routes/webhook');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static output files
app.use('/output', express.static(path.join(__dirname, '../output')));

// API routes
app.use('/api', webhookRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Kvell MOW API is running',
    endpoints: {
      webhook: '/api/webhook',
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
