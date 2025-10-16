require('dotenv').config();
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
  console.log(`🔗 Webhook: http://localhost:${PORT}/api/webhook`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
});
