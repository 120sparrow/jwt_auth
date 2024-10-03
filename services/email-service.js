const nodemailer = require('nodemailer');

class EmailService {

  constructor() {
    const options = {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user:  process.env.SMTP_USER,
        pass:  process.env.SMTP_PASSWORD,
      }
    };
    this.transporter = nodemailer.createTransport(options);
  }

  async sendActivationEmail(email, link) {
    const data = {
      from: process.env.SMTP_USER,
      to: email,
      subject: `Account activation on ${process.env.API_URL}`,
      text: '',
      html:
        `
      <div>
        <h1>To activate, follow the link</h1>
        <a href="${link}" target="_blank">${link}</a>
      </div>
      `
    };
    await this.transporter.sendMail(data);
  }
}

module.exports = new EmailService();
