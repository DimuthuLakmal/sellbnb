/**
 * Created by malaka on 11/26/17.
 */

var nodemailer = require('nodemailer');
var Email = require('email-templates');

module.exports.sendEmail = function (data, locals) {
  var ndmlTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'toprankz123@gmail.com',
      pass: 'fucking12sa'
    }
  });
  const email = new Email({
    message: {
      from: 'sellbnb@gmail.com'
    },
    send: true,
    transport: ndmlTransporter,
    views: {
      options: {
        extension: 'ejs'
      }
    }
  });

  email.send({
    template: data.template,
    message: {
      to: data.to,
      subject: data.subject,
    },
    locals: locals
  }).then(function (x) {
    console.log(x);
  }).catch(function (y) {
    console.log(y);
  });
};



