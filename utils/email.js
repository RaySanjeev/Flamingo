const nodemailer = require('nodemailer');
const HtmlToText = require('html-to-text');
const pug = require('pug');
// const mailGun = require('nodemailer-mailgun-transport');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.from = `Sanjeev Ray <${process.env.EMAIL_FROM}>`;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'Mailgun',
        auth: {
          user: process.env.MAILGUN_USER,
          pass: process.env.MAILGUN_PASS,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    // Render HTML based on pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );

    // Define EMAIL options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: HtmlToText.fromString(html),
    };

    // Create a Transport and send EMAIL
    await this.newTransport().sendMail(mailOptions, function (err, response) {
      if (err) console.log(err);
      if (response) {
        console.log('Email sent successfully!!!');
        console.log(response);
      }
    });
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the MyOwn family.');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset link (validity: 10min)'
    );
  }
};
