const sgMail = require('@sendgrid/mail');
const ejs = require('ejs');
const fs = require('fs').promises;
const path = require('path');

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Helper function to safely get nested values with multiple fallback paths
function safeGet(obj, ...args) {
  // Last argument might be a default value (not a path)
  const defaultValue = args[args.length - 1];
  const paths = typeof defaultValue === 'string' && defaultValue.includes('.') 
    ? args 
    : args.slice(0, -1);
  
  for (const path of paths) {
    if (typeof path !== 'string') continue;
    
    const keys = path.split('.');
    let value = obj;
    let found = true;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        found = false;
        break;
      }
    }
    
    if (found && value !== undefined && value !== null) {
      return value;
    }
  }
  
  // Return default value
  return typeof defaultValue === 'string' && defaultValue.includes('.') ? '' : defaultValue;
}

async function sendIntakeEmail(callData) {
  try {
    console.log('📧 Generating intake email HTML...');
    console.log('📊 Received data structure:', JSON.stringify(callData, null, 2));
    
    // ROBUST DATA MAPPING - handles ANY structure
    const templateData = {
      callInfo: {
        duration: safeGet(callData, 'call_duration', 'callInfo.duration', 'call.duration', 0),
        timestamp: safeGet(callData, 'timestamp', 'callInfo.timestamp', 'call.timestamp', new Date().toISOString()),
        confidence: safeGet(callData, 'confidence', 'callInfo.confidence', 'call.confidence', 95),
        recordingUrl: safeGet(callData, 'recording_url', 'callInfo.recordingUrl', 'call.recordingUrl', '#')
      },
      clientInfo: {
        fullName: safeGet(callData, 'full_name', 'clientInfo.fullName', 'client.fullName', 'Unknown'),
        preferredName: safeGet(callData, 'preferred_name', 'clientInfo.preferredName', 'client.preferredName', ''),
        dob: safeGet(callData, 'dob', 'clientInfo.dob', 'client.dob', ''),
        age: safeGet(callData, 'age', 'clientInfo.age', 'client.age', 0),
        address: safeGet(callData, 'address', 'clientInfo.address', 'client.address', ''),
        phone: safeGet(callData, 'phone', 'clientInfo.phone', 'client.phone', ''),
        email: safeGet(callData, 'email', 'clientInfo.email', 'client.email', 'N/A'),
        macNumber: safeGet(callData, 'mac_number', 'clientInfo.macNumber', 'client.macNumber', '')
      },
      dietary: {
        texture: safeGet(callData, 'texture', 'dietary.texture', 'dietaryRequirements.texture', 'Standard'),
        allergies: safeGet(callData, 'allergies', 'dietary.allergies', 'dietaryRequirements.allergies', []),
        conditions: safeGet(callData, 'dietary_needs', 'dietary.conditions', 'dietaryRequirements.needs', []),
        needs: safeGet(callData, 'dietary_needs', 'dietary.needs', 'dietaryRequirements.needs', []),
        notes: safeGet(callData, 'dietary_notes', 'dietary.notes', '')
      },
      mealOrder: {
        deliveryDay: safeGet(callData, 'delivery_day', 'mealOrder.deliveryDay', 'meal.deliveryDay', ''),
        deliveryDate: safeGet(callData, 'delivery_date', 'mealOrder.deliveryDate', 'meal.deliveryDate', ''),
        mealType: safeGet(callData, 'meal_type', 'mealOrder.mealType', 'meal.mealType', 'Chilled'),
        mealSize: safeGet(callData, 'meal_size', 'mealOrder.mealSize', 'meal.mealSize', ''),
        aiRecommendation: safeGet(callData, 'main_meal', 'mealOrder.aiRecommendation', 'meal.mainMeal', ''),
        items: safeGet(callData, 'meal_items', 'mealOrder.items', 'meal.items', [])
      },
      delivery: {
        keySafe: safeGet(callData, 'key_safe_code', 'delivery.keySafeCode', '') ? 'Yes' : 'No',
        keySafeCode: safeGet(callData, 'key_safe_code', 'delivery.keySafeCode', ''),
        pets: safeGet(callData, 'pets', 'delivery.pets', 'No'),
        access: safeGet(callData, 'delivery_location', 'delivery.access', 'delivery.accessPoint', ''),
        instructions: safeGet(callData, 'delivery_instructions', 'delivery.instructions', '')
      },
      emergencyContact: {
        name: safeGet(callData, 'emergency_name', 'emergencyContact.name', 'emergency.name', ''),
        relationship: safeGet(callData, 'emergency_relationship', 'emergencyContact.relationship', 'emergency.relationship', ''),
        phone: safeGet(callData, 'emergency_phone', 'emergencyContact.phone', 'emergency.phone', '')
      },
      medicalFlags: safeGet(callData, 'medical_flags', 'medicalFlags', []),
      attachments: safeGet(callData, 'attachments', [])
    };
    
    console.log('📧 Template data prepared:', JSON.stringify(templateData, null, 2));
    
    const templatePath = path.join(__dirname, '../templates/intake-email.ejs');
    const template = await fs.readFile(templatePath, 'utf-8');
    const html = ejs.render(template, templateData);
    
    const outputDir = path.join(__dirname, '../../output');
    await fs.mkdir(outputDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const clientName = (templateData.clientInfo.fullName || 'Client').replace(/\s+/g, '_');
    const filename = `intake-${clientName}-${timestamp}.html`;
    const filepath = path.join(outputDir, filename);
    
    await fs.writeFile(filepath, html, 'utf-8');
    console.log(`✅ Email HTML saved to: ${filepath}`);
    
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
