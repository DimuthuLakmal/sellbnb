/**
 * Created by malaka on 11/26/17.
 */

let nodemailer = require('nodemailer');
let Email = require('email-templates');

module.exports.sendEmail = function (data, locals) {
  let ndmlTransporter = nodemailer.createTransport({
    // service: 'gmail',
    name: 'bluehost',
    port: '465',
    host: 'box802.bluehost.com',
    secure: true,
    auth: {
      user: 'support@antcommodity.com',
      pass: '|ZLOT07,Q+Iu('
    }
  });
  const email = new Email({
    message: {
      from: 'support@antcommodity.com'
    },
    send: true,
    transport: ndmlTransporter,
    views: {
      options: {
        extension: 'ejs'
      }
    }
  });
  const msg = {
    to: data.to,
    subject: data.subject
  };
  if(data.attachments) {
    msg.attachments = data.attachments;
    console.log('Attatched - ', data.attachments.length);
  }
  email.send({
    template: data.template,
    message: msg,
    locals: locals
  }).then(function (x) {
    console.log('========= Email success', x);
  }).catch(function (y) {
    console.log('========= Email failed', y);
  });
};



