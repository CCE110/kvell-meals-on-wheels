const express = require('express');
const router = express.Router();
const { sendIntakeEmail } = require('../services/email-service');

router.post('/web-form', async (req, res) => {
  try {
    console.log('📝 Web form submission received');
    
    const formData = req.body;
    
    const emailData = {
      full_name: formData.full_name || 'Web Form Submission',
      preferred_name: formData.preferred_name || '',
      dob: formData.dob || '',
      address: formData.address || '',
      phone: formData.phone || '',
      email: formData.email || '',
      mac_number: '',
      allergies: formData.allergies || [],
      dietary_needs: formData.dietary_needs || [],
      delivery_day: formData.delivery_day || '',
      main_meal: formData.main_meal || '',
      meal_size: formData.meal_size || '',
      delivery_location: formData.delivery_location || '',
      key_safe_code: formData.key_safe_code || '',
      pets: formData.pets || '',
      emergency_name: '',
      emergency_relationship: '',
      emergency_phone: '',
      age: 0,
      call_duration: 0,
      timestamp: new Date().toISOString(),
      recording_url: null
    };
    
    await sendIntakeEmail(emailData);
    
    res.json({ 
      success: true, 
      message: 'Form submitted successfully' 
    });
    
  } catch (error) {
    console.error('❌ Error processing web form:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
