const sgMail = require('@sendgrid/mail');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs').promises;

class EmailService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    this.templatePath = path.join(__dirname, '../templates/intake-email.ejs');
  }

  async sendIntakeEmail(intakeData) {
    try {
      const template = await fs.readFile(this.templatePath, 'utf-8');
      const html = ejs.render(template, intakeData);

      const msg = {
        to: process.env.EMAIL_TO,
        from: process.env.EMAIL_FROM,
        subject: `New Client Intake - ${intakeData.clientInfo.fullName}`,
        html: html,
        attachments: [
          {
            content: Buffer.from(JSON.stringify(intakeData, null, 2)).toString('base64'),
            filename: `intake-${intakeData.clientInfo.fullName.replace(/\s+/g, '-')}-${Date.now()}.json`,
            type: 'application/json',
            disposition: 'attachment'
          }
        ]
      };

      await sgMail.send(msg);
      console.log('✅ Email sent successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Email error:', error);
      throw error;
    }
  }
}

module.exports = EmailService;
