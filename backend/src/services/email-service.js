const sgMail = require('@sendgrid/mail');
const ejs = require('ejs');
const fs = require('fs').promises;
const path = require('path');

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

async function sendIntakeEmail(callData) {
  try {
    console.log('📧 Generating intake email HTML...');
    
    // Map flat parser data to template structure
    const templateData = {
      callInfo: {
        duration: callData.call_duration || 0,
        timestamp: callData.timestamp || new Date().toISOString(),
        confidence: 95,
        recordingUrl: callData.recording_url || null
      },
      clientInfo: {
        fullName: callData.full_name || 'Unknown',
        preferredName: callData.preferred_name || '',
        dob: callData.dob || '',
        age: callData.age || 0,
        address: callData.address || '',
        phone: callData.phone || '',
        email: callData.email || 'N/A',
        macNumber: callData.mac_number || ''
      },
      dietaryRequirements: {
        texture: 'Standard',
        allergies: callData.allergies || [],
        needs: callData.dietary_needs || []
      },
      mealOrder: {
        deliveryDay: callData.delivery_day || '',
        deliveryDate: '',
        mealType: 'Chilled',
        mealSize: callData.meal_size || '',
        aiRecommendation: callData.main_meal || '',
        items: []
      },
      delivery: {
        keySafe: callData.key_safe_code ? 'Yes' : 'No',
        keySafeCode: callData.key_safe_code || '',
        pets: callData.pets || 'No',
        accessPoint: callData.delivery_location || '',
        instructions: ''
      },
      emergencyContact: {
        name: callData.emergency_name || '',
        relationship: callData.emergency_relationship || '',
        phone: callData.emergency_phone || ''
      },
      medicalFlags: [],
      attachments: []
    };
    
    const templatePath = path.join(__dirname, '../templates/intake-email.ejs');
    const template = await fs.readFile(templatePath, 'utf-8');
    const html = ejs.render(template, templateData);
    
    // Save to file as backup
    const outputDir = path.join(__dirname, '../../output');
    await fs.mkdir(outputDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const clientName = (callData.full_name || 'Client').replace(/\s+/g, '_');
    const filename = `intake-${clientName}-${timestamp}.html`;
    const filepath = path.join(outputDir, filename);
    
    await fs.writeFile(filepath, html, 'utf-8');
    console.log(`✅ Email HTML saved to: ${filepath}`);
    
    // Send via SendGrid
    if (process.env.SENDGRID_API_KEY && process.env.EMAIL_TO) {
      const msg = {
        to: process.env.EMAIL_TO,
        from: process.env.EMAIL_FROM || 'intake@kvell.ai',
        subject: `New Client Intake - ${templateData.clientInfo.fullName}`,
        html: html,
        attachments: [
          {
            content: Buffer.from(JSON.stringify(callData, null, 2)).toString('base64'),
            filename: `intake-${clientName}-${timestamp}.json`,
            type: 'application/json',
            disposition: 'attachment'
          }
        ]
      };
      
      await sgMail.send(msg);
      console.log(`📧 Email sent to: ${process.env.EMAIL_TO}`);
    } else {
      console.log('⚠️  SendGrid not configured - email not sent');
    }
    
    return { success: true, filepath };
  } catch (error) {
    console.error('❌ Error generating/sending email:', error);
    throw error;
  }
}

module.exports = { sendIntakeEmail };
