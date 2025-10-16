// Only load .env in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const bodyParser = require('body-parser');
const webhookRouter = require('./routes/webhook');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api', webhookRouter);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Kvell Meals on Wheels API',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log('🚀 Kvell Meals on Wheels Server Started');
  console.log(`📍 Running on port ${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📧 SendGrid: ${process.env.SENDGRID_API_KEY ? 'YES' : 'NO'}`);
  console.log(`📞 Bland: ${process.env.BLAND_API_KEY ? 'YES' : 'NO'}`);
  console.log(`💌 Email To: ${process.env.EMAIL_TO || 'NOT SET'}`);
});
