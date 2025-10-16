const fs = require('fs').promises;
const path = require('path');
const open = require('open');
const ejs = require('ejs');

async function generateLocalEmail() {
  const templateData = {
    callInfo: {
      duration: '6m 32s',
      timestamp: new Date().toLocaleString('en-AU', { timeZone: 'Australia/Brisbane' }),
      confidence: '95%',
      recordingUrl: '#'
    },
    
    clientInfo: {
      fullName: 'Margaret Thompson',
      preferredName: 'Margaret',
      dob: '12 March 1948',
      age: 77,
      address: '45 Oak Street, Petrie, QLD 4502',
      phone: '07 3456 7890',
      email: 'N/A',
      macNumber: 'AC45678901',
      macVerified: true
    },
    
    dietary: {
      allergies: ['Shellfish'],
      allergiesCritical: true,
      conditions: ['Diabetic (Type 2)', 'Low Fat'],
      texture: 'Standard'
    },
    
    mealOrder: {
      deliveryDay: 'Wednesday',
      deliveryDate: '15 October 2025',
      mealType: 'Chilled',
      mealSize: 'Small',
      aiRecommendation: 'Small portion recommended based on age',
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
      keySafe: 'Yes',
      keySafeCode: '1234',
      pets: 'No',
      accessPoint: 'Front door',
      instructions: 'Leave meals in esky by front door'
    },
    
    emergencyContact: {
      name: 'Sarah Thompson',
      relationship: 'Daughter',
      phone: '0412 345 678'
    },
    
    medicalFlags: [
      {
        type: 'Cognitive Concern',
        description: 'Client mentioned forgetting things lately',
        severity: 'medium',
        action: 'RN wellness check required before first delivery'
      }
    ],
    
    attachments: []
  };

  const templatePath = path.join(__dirname, 'src/templates/intake-email.ejs');
  const template = await fs.readFile(templatePath, 'utf-8');
  const html = ejs.render(template, templateData);
  
  const outputDir = path.join(__dirname, 'output');
  await fs.mkdir(outputDir, { recursive: true });
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `intake-Margaret_Thompson-${timestamp}.html`;
  const filepath = path.join(outputDir, filename);
  
  await fs.writeFile(filepath, html, 'utf-8');
  console.log(`✅ Email HTML saved to: ${filepath}`);
  
  await open(filepath);
  console.log('🌐 Opened in browser!');
}

generateLocalEmail().catch(console.error);
