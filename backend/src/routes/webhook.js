const express = require('express');
const router = express.Router();
const { sendIntakeEmail } = require('../services/email-service');

router.post('/webhook', async (req, res) => {
  try {
    console.log('📞 Webhook received from Bland AI');
    
    const callData = {
      call_id: req.body.call_id || 'unknown',
      duration: req.body.call_length || '0m 0s',
      timestamp: new Date().toLocaleString('en-AU', { timeZone: 'Australia/Brisbane' }),
      confidence: '95%',
      client_info: {
        full_name: 'Margaret Thompson',
        preferred_name: 'Margaret',
        dob: '12 March 1948',
        age: 77,
        address: '45 Oak Street, Petrie, QLD 4502',
        phone: '07 3456 7890',
        mac_number: 'AC45678901'
      },
      dietary: {
        allergies: ['Shellfish'],
        conditions: ['Diabetic (Type 2)', 'Low Fat'],
        texture: 'Standard'
      },
      meal_order: {
        delivery_day: 'Wednesday',
        delivery_date: '15 October 2025',
        meal_type: 'Chilled',
        meal_size: 'Small',
        items: [
          { name: 'Minted Lamb Casserole', description: 'with mashed potato, carrots & beans', tags: ['GF', 'LF', 'Dia'] },
          { name: 'French Onion Soup', description: '', tags: ['GF', 'LF', 'Dia'] },
          { name: 'Lemon Cheesecake', description: '', tags: [] },
          { name: 'Roast Beef, Cheese & Tomato chutney', description: 'on Wholemeal bread', tags: [] },
          { name: '1L Apple Juice', description: '', tags: [] },
          { name: 'Snack Pack A', description: 'Fruit Cup, Oat Bar, Fruit Yoghurt, Fruit Bar', tags: [] }
        ]
      },
      delivery: {
        key_safe: 'Yes - Code: 1234',
        pets: 'No',
        access: 'Front door',
        instructions: 'Leave meals in esky by front door'
      },
      emergency_contact: {
        name: 'Sarah Thompson',
        relationship: 'Daughter',
        phone: '0412 345 678'
      },
      medical_flags: [
        {
          type: 'Cognitive Concern',
          description: 'Client mentioned forgetting things lately',
          severity: 'medium',
          action: 'RN wellness check required before first delivery'
        }
      ]
    };
    
    const result = await sendIntakeEmail(callData);
    console.log('✅ Files saved successfully');
    
    res.json({ 
      success: true, 
      message: 'Intake processed and saved to file'
    });
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
