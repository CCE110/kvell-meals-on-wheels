const express = require('express');
const router = express.Router();
const { sendIntakeEmail } = require('../services/email-service');
const { parseTranscript, calculateAge } = require('../services/transcript-parser');

router.post('/webhook', async (req, res) => {
  try {
    console.log('📞 Webhook received from Bland AI');
    
    const payload = req.body;
    const callId = payload.call_id;
    const status = payload.status;
    
    // Only process completed calls
    if (status !== 'completed') {
      console.log('⏭️  Skipping - call not completed yet');
      return res.json({ success: true, message: 'Webhook received' });
    }
    
    console.log('🎉 CALL COMPLETED! Processing...');
    console.log('📋 Full payload:', JSON.stringify(payload, null, 2));
    
    // Parse data from transcript
    const transcript = payload.concatenated_transcript;
    const parsedData = parseTranscript(transcript);
    
    if (!parsedData) {
      console.log('⚠️  Could not parse transcript - using fallback data');
    }
    
    console.log('✅ Parsed data:', JSON.stringify(parsedData, null, 2));
    
    // Transform to our email format
    const callData = {
      call_id: callId,
      duration: `${Math.round(payload.call_length || 0)} minutes`,
      timestamp: new Date().toLocaleString('en-AU', { timeZone: 'Australia/Brisbane' }),
      confidence: '95%',
      recording_url: payload.recording_url || '#',
      
      client_info: {
        full_name: parsedData?.full_name || 'Unknown',
        preferred_name: parsedData?.preferred_name || '',
        dob: parsedData?.dob || '',
        age: parsedData?.dob ? calculateAge(parsedData.dob) : 0,
        address: parsedData?.address || '',
        phone: parsedData?.phone?.replace(/\s+/g, '') || '',
        email: parsedData?.email || '',
        mac_number: parsedData?.mac_number?.replace(/\s+/g, '') || ''
      },
      
      dietary: {
        allergies: parsedData?.allergies || [],
        allergiesCritical: (parsedData?.allergies?.length || 0) > 0,
        conditions: parsedData?.dietary_needs || [],
        texture: parsedData?.dietary_needs?.includes('Texture Modified') ? 'Modified' : 'Standard'
      },
      
      meal_order: {
        delivery_day: parsedData?.delivery_day || 'Wednesday',
        delivery_date: '',
        meal_type: 'Chilled',
        meal_size: parsedData?.meal_size || 'Regular',
        items: [
          parsedData?.main_meal ? { name: parsedData.main_meal, tags: [] } : null,
          parsedData?.salad ? { name: parsedData.salad, tags: [] } : null,
          parsedData?.juice ? { name: `${parsedData.juice} juice`, tags: [] } : null,
          parsedData?.snack_pack ? { name: `Snack Pack ${parsedData.snack_pack}`, tags: [] } : null
        ].filter(Boolean)
      },
      
      delivery: {
        key_safe: parsedData?.key_safe_code ? 'Yes' : 'No',
        key_safe_code: parsedData?.key_safe_code?.replace(/\s+/g, '') || '',
        pets: parsedData?.pets || 'No',
        accessPoint: 'Front door',
        instructions: parsedData?.delivery_location ? `Leave at ${parsedData.delivery_location}` : ''
      },
      
      emergency_contact: {
        name: parsedData?.emergency_name || '',
        relationship: parsedData?.emergency_relationship || '',
        phone: parsedData?.emergency_phone?.replace(/\s+/g, '') || ''
      },
      
      medical_flags: []
    };
    
    console.log('📧 Generating email with parsed data...');
    const result = await sendIntakeEmail(callData);
    console.log('✅ Email generated successfully!');
    
    res.json({ 
      success: true, 
      message: 'Intake processed from transcript'
    });
    
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
