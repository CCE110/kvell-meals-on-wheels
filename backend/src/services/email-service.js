const fs = require('fs').promises;
const path = require('path');
const open = require('open');
const ejs = require('ejs');

async function sendIntakeEmail(callData) {
  try {
    console.log('📧 Generating intake email HTML...');
    
    // Read the EJS template
    const templatePath = path.join(__dirname, '../templates/intake-email.ejs');
    const template = await fs.readFile(templatePath, 'utf-8');
    
    // Render the template with data
    const html = ejs.render(template, { callData });
    
    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, '../../output');
    await fs.mkdir(outputDir, { recursive: true });
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `intake-${callData.client_info.full_name.replace(/\s+/g, '_')}-${timestamp}.html`;
    const filepath = path.join(outputDir, filename);
    
    // Write HTML to file
    await fs.writeFile(filepath, html, 'utf-8');
    
    console.log(`✅ Email HTML saved to: ${filepath}`);
    
    // Open the file in default browser
    await open(filepath);
    
    console.log('🌐 Opened in browser!');
    
    // Also save JSON data
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
