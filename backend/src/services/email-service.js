const fs = require('fs').promises;
const path = require('path');
const ejs = require('ejs');

async function sendIntakeEmail(callData) {
  try {
    console.log('📧 Generating intake email HTML...');
    
    // Transform callData to match template expectations
    const templateData = {
      callInfo: {
        duration: callData.duration || '0m 0s',
        timestamp: callData.timestamp || new Date().toLocaleString('en-AU'),
        confidence: callData.confidence || '95%',
        recordingUrl: callData.recording_url || '#'
      },
      
      clientInfo: {
        fullName: callData.client_info?.full_name || 'Unknown',
        preferredName: callData.client_info?.preferred_name || '',
        dob: callData.client_info?.dob || '',
        age: callData.client_info?.age || 0,
        address: callData.client_info?.address || '',
        phone: callData.client_info?.phone || '',
        email: callData.client_info?.email || 'N/A',
        macNumber: callData.client_info?.mac_number || '',
        macVerified: !!callData.client_info?.mac_number
      },
      
      dietary: {
        allergies: callData.dietary?.allergies || [],
        allergiesCritical: (callData.dietary?.allergies?.length || 0) > 0,
        conditions: callData.dietary?.conditions || [],
        texture: callData.dietary?.texture || 'Standard'
      },
      
      mealOrder: {
        deliveryDay: callData.meal_order?.delivery_day || '',
        deliveryDate: callData.meal_order?.delivery_date || '',
        mealType: callData.meal_order?.meal_type || '',
        mealSize: callData.meal_order?.meal_size || '',
        aiRecommendation: callData.meal_order?.ai_recommendation || '',
        items: callData.meal_order?.items || []
      },
      
      delivery: {
        keySafe: callData.delivery?.key_safe || 'No',
        keySafeCode: callData.delivery?.key_safe_code || '',
        pets: callData.delivery?.pets || 'No',
        accessPoint: callData.delivery?.access || '',
        instructions: callData.delivery?.instructions || ''
      },
      
      emergencyContact: {
        name: callData.emergency_contact?.name || '',
        relationship: callData.emergency_contact?.relationship || '',
        phone: callData.emergency_contact?.phone || ''
      },
      
      medicalFlags: callData.medical_flags || [],
      
      attachments: []
    };
    
    const templatePath = path.join(__dirname, '../templates/intake-email.ejs');
    const template = await fs.readFile(templatePath, 'utf-8');
    const html = ejs.render(template, templateData);
    
    const outputDir = path.join(__dirname, '../../output');
    await fs.mkdir(outputDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const clientName = (callData.client_info?.full_name || 'Client').replace(/\s+/g, '_');
    const filename = `intake-${clientName}-${timestamp}.html`;
    const filepath = path.join(outputDir, filename);
    
    await fs.writeFile(filepath, html, 'utf-8');
    console.log(`✅ Email HTML saved to: ${filepath}`);
    
    const jsonFilename = filename.replace('.html', '.json');
    const jsonFilepath = path.join(outputDir, jsonFilename);
    await fs.writeFile(jsonFilepath, JSON.stringify(callData, null, 2), 'utf-8');
    console.log(`💾 JSON data saved to: ${jsonFilepath}`);
    
    return { success: true, filepath, jsonFilepath };
  } catch (error) {
    console.error('❌ Error generating email:', error);
    throw error;
  }
}

module.exports = { sendIntakeEmail };
