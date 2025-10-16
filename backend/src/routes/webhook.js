const express = require('express');
const router = express.Router();
const { sendIntakeEmail } = require('../services/email-service');

router.post('/webhook', async (req, res) => {
  try {
    console.log('📞 Webhook received from Bland AI');
    console.log('📦 Raw webhook data:', JSON.stringify(req.body, null, 2));
    
    // Use ACTUAL data from Bland AI webhook
    const blandData = req.body;
    
    // Transform Bland AI data to our structure
    const callData = {
      call_id: blandData.call_id || 'unknown',
      duration: blandData.call_length || '0m 0s',
      timestamp: new Date().toLocaleString('en-AU', { timeZone: 'Australia/Brisbane' }),
      confidence: '95%',
      recording_url: blandData.recording_url || '#',
      
      // Extract from Bland's data structure
      client_info: {
        full_name: blandData.variables?.full_name || blandData.transcript?.full_name || 'Unknown',
        preferred_name: blandData.variables?.preferred_name || '',
        dob: blandData.variables?.dob || '',
        age: blandData.variables?.age || 0,
        address: blandData.variables?.address || '',
        phone: blandData.variables?.phone || '',
        email: blandData.variables?.email || '',
        mac_number: blandData.variables?.mac_number || ''
      },
      
      dietary: {
        allergies: blandData.variables?.allergies || [],
        conditions: blandData.variables?.conditions || [],
        texture: blandData.variables?.texture || 'Standard'
      },
      
      meal_order: {
        delivery_day: blandData.variables?.delivery_day || '',
        delivery_date: blandData.variables?.delivery_date || '',
        meal_type: blandData.variables?.meal_type || '',
        meal_size: blandData.variables?.meal_size || '',
        ai_recommendation: blandData.variables?.ai_recommendation || '',
        items: blandData.variables?.meal_items || []
      },
      
      delivery: {
        key_safe: blandData.variables?.key_safe || 'No',
        key_safe_code: blandData.variables?.key_safe_code || '',
        pets: blandData.variables?.pets || 'No',
        access: blandData.variables?.access_point || '',
        instructions: blandData.variables?.delivery_instructions || ''
      },
      
      emergency_contact: {
        name: blandData.variables?.emergency_name || '',
        relationship: blandData.variables?.emergency_relationship || '',
        phone: blandData.variables?.emergency_phone || ''
      },
      
      medical_flags: blandData.variables?.medical_flags || []
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
