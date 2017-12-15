/**
 * Created by malaka on 11/26/17.
 */

let nodemailer = require('nodemailer');
let Email = require('email-templates');

module.exports.sendEmail = function (data, locals) {
  let ndmlTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'toprankz123@gmail.com',
      pass: 'fucking12sa'
    }
  });
  const email = new Email({
    message: {
      from: 'antcommodity@gmail.com'
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



