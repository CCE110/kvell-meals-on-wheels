const express = require('express');
const router = express.Router();
const { parseTranscript } = require('../services/transcript-parser');
const { sendIntakeEmail } = require('../services/email-service');

router.post('/webhook', async (req, res) => {
  try {
    console.log('📞 Webhook received from Bland AI');
    
    const { status, call_id, concatenated_transcript } = req.body;
    
    if (status !== 'completed') {
      console.log('⏭️  Skipping - call not completed yet');
      return res.json({ success: true, message: 'Acknowledged' });
    }
    
    console.log('🎉 CALL COMPLETED! Processing...');
    console.log('📋 Full payload:', JSON.stringify(req.body, null, 2));
    
    const parsedData = parseTranscript(concatenated_transcript);
    
    if (!parsedData) {
      console.log('⚠️  Could not parse transcript - using fallback data');
      await sendIntakeEmail({
        full_name: 'Unknown',
        preferred_name: '',
        dob: '',
        age: 0,
        address: '',
        phone: '',
        email: '',
        mac_number: '',
        allergies: [],
        dietary_needs: [],
        delivery_day: '',
        main_meal: '',
        meal_size: '',
        delivery_location: '',
        key_safe_code: '',
        pets: '',
        emergency_name: '',
        emergency_relationship: '',
        emergency_phone: '',
        call_duration: req.body.call_length || 0,
        timestamp: new Date().toISOString()
      });
      return res.json({ success: true });
    }
    
    console.log('✅ Parsed data:', JSON.stringify(parsedData, null, 2));
    
    const emailData = {
      ...parsedData,
      age: 0, // Remove age calculation for now
      call_duration: req.body.call_length || 0,
      timestamp: new Date().toISOString(),
      recording_url: req.body.recording_url || null
    };
    
    console.log('📧 Generating email with parsed data...');
    await sendIntakeEmail(emailData);
    console.log('✅ Email generated successfully!');
    
    res.json({ 
      success: true, 
      message: 'Call processed',
      call_id: call_id
    });
    
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
