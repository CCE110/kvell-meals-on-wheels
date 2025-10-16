require('dotenv').config();
const EmailService = require('../services/email-service');

const emailService = new EmailService();

const testData = {
  callInfo: {
    duration: '6m 32s',
    timestamp: new Date().toLocaleString('en-AU'),
    confidence: '95',
    recordingUrl: 'https://bland.ai/recordings/demo'
  },
  clientInfo: {
    fullName: 'Margaret Thompson',
    preferredName: 'Margaret',
    dob: '12 March 1948',
    age: '77',
    address: '45 Oak Street, Petrie, QLD 4502',
    phone: '07 3456 7890',
    email: null,
    macNumber: 'AC45678901'
  },
  dietary: {
    allergies: ['Shellfish'],
    conditions: ['Diabetic (Type 2)', 'Low Fat'],
    texture: 'Standard',
    notes: null
  },
  mealOrder: {
    deliveryDay: 'Wednesday',
    date: '15 October 2025',
    size: 'Small',
    aiRecommendation: 'Small portion recommended based on age',
    items: [
      { name: 'Minted Lamb Casserole', description: 'with mashed potato, carrots & beans', tags: ['GF', 'LF', 'Dia'] },
      { name: 'French Onion Soup', tags: ['GF', 'LF', 'Dia'] },
      { name: 'Lemon Cheesecake' },
      { name: 'Roast Beef, Cheese & Tomato chutney', description: 'on Wholemeal bread' },
      { name: '1L Apple Juice' },
      { name: 'Snack Pack A', description: 'Fruit Cup, Oat Bar, Fruit Yoghurt, Fruit Bar' }
    ]
  },
  delivery: {
    keySafe: true,
    keySafeCode: '1234',
    pets: 'No',
    accessPoint: 'Front door',
    instructions: 'Leave meals in esky by front door'
  },
  emergencyContact: {
    name: 'Sarah Thompson',
    relationship: 'Daughter',
    phone: '0412 345 678'
  },
  medicalFlags: [
    {
      type: 'Cognitive Concern',
      description: 'Client mentioned forgetting things lately',
      action: 'RN wellness check required before first delivery'
    }
  ],
  attachments: { jsonUrl: '#' }
};

console.log('🧪 Testing email system...');
console.log('📧 Sending test email to:', process.env.EMAIL_TO);

emailService.sendIntakeEmail(testData)
  .then(() => {
    console.log('✅ Test email sent successfully!');
    console.log('📬 Check your inbox at:', process.env.EMAIL_TO);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  });
