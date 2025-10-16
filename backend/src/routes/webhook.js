const express = require('express');
const router = express.Router();
const { sendIntakeEmail } = require('../services/email-service');
const { getCallDetails } = require('../services/bland-service');

router.post('/webhook', async (req, res) => {
  try {
    console.log('📞 Webhook received from Bland AI');
    console.log('📦 Webhook payload:', JSON.stringify(req.body, null, 2));
    
    const callId = req.body.call_id;
    
    if (!callId) {
      throw new Error('No call_id in webhook');
    }
    
    // Fetch full call details from Bland API
    console.log('🔍 Fetching call details from Bland...');
    const callDetails = await getCallDetails(callId);
    console.log('📋 Call details received:', JSON.stringify(callDetails, null, 2));
    
    // Extract data from call transcript/variables
    const callData = {
      call_id: callId,
      duration: callDetails.call_length || '0m 0s',
      timestamp: new Date().toLocaleString('en-AU', { timeZone: 'Australia/Brisbane' }),
      confidence: '95%',
      recording_url: callDetails.recording_url || '#',
      
      client_info: {
        full_name: callDetails.variables?.full_name || 'Unknown',
        preferred_name: callDetails.variables?.preferred_name || '',
        dob: callDetails.variables?.dob || '',
        age: callDetails.variables?.age || 0,
        address: callDetails.variables?.address || '',
        phone: callDetails.variables?.phone || '',
        email: callDetails.variables?.email || '',
        mac_number: callDetails.variables?.mac_number || ''
      },
      
      dietary: {
        allergies: callDetails.variables?.allergies || [],
        conditions: callDetails.variables?.conditions || [],
        texture: callDetails.variables?.texture || 'Standard'
      },
      
      meal_order: {
        delivery_day: callDetails.variables?.delivery_day || '',
        delivery_date: callDetails.variables?.delivery_date || '',
        meal_type: callDetails.variables?.meal_type || '',
        meal_size: callDetails.variables?.meal_size || '',
        items: callDetails.variables?.meal_items || []
      },
      
      delivery: {
        key_safe: callDetails.variables?.key_safe || 'No',
        key_safe_code: callDetails.variables?.key_safe_code || '',
        pets: callDetails.variables?.pets || 'No',
        access: callDetails.variables?.access_point || '',
        instructions: callDetails.variables?.delivery_instructions || ''
      },
      
      emergency_contact: {
        name: callDetails.variables?.emergency_name || '',
        relationship: callDetails.variables?.emergency_relationship || '',
        phone: callDetails.variables?.emergency_phone || ''
      },
      
      medical_flags: callDetails.variables?.medical_flags || []
    };
    
    const result = await sendIntakeEmail(callData);
    console.log('✅ Files saved successfully');
    
    res.json({ 
      success: true, 
      message: 'Intake processed'
    });
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
