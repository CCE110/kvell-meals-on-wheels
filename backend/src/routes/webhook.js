const express = require('express');
const router = express.Router();
const EmailService = require('../services/email-service');

const emailService = new EmailService();

router.post('/webhook', async (req, res) => {
  try {
    console.log('📞 Webhook received from Bland AI');
    const callData = req.body;
    const intakeData = transformCallData(callData);
    await emailService.sendIntakeEmail(intakeData);
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

function transformCallData(callData) {
  return {
    callInfo: {
      duration: callData.call_length || '6m 32s',
      timestamp: new Date().toLocaleString('en-AU'),
      confidence: '95',
      recordingUrl: callData.recording_url || '#'
    },
    clientInfo: {
      fullName: callData.variables?.full_name || 'Margaret Thompson',
      preferredName: callData.variables?.preferred_name || 'Margaret',
      dob: callData.variables?.dob || '12 March 1948',
      age: callData.variables?.age || '77',
      address: callData.variables?.address || '45 Oak Street, Petrie, QLD 4502',
      phone: callData.variables?.phone || '07 3456 7890',
      email: callData.variables?.email || null,
      macNumber: callData.variables?.mac_number || 'AC45678901'
    },
    dietary: {
      allergies: callData.variables?.allergies || ['Shellfish'],
      conditions: callData.variables?.conditions || ['Diabetic (Type 2)', 'Low Fat'],
      texture: callData.variables?.texture || 'Standard',
      notes: callData.variables?.dietary_notes || null
    },
    mealOrder: {
      deliveryDay: callData.variables?.delivery_day || 'Wednesday',
      date: callData.variables?.delivery_date || '15 October 2025',
      size: callData.variables?.meal_size || 'Small',
      aiRecommendation: 'Small portion recommended based on age',
      items: callData.variables?.meal_items || [
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
      name: callData.variables?.emergency_name || 'Sarah Thompson',
      relationship: callData.variables?.emergency_relationship || 'Daughter',
      phone: callData.variables?.emergency_phone || '0412 345 678'
    },
    medicalFlags: callData.variables?.medical_flags || [
      {
        type: 'Cognitive Concern',
        description: 'Client mentioned forgetting things lately',
        action: 'RN wellness check required before first delivery'
      }
    ],
    attachments: { jsonUrl: '#' }
  };
}

module.exports = router;
