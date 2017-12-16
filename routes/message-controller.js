/**
 * Created by malaka on 12/15/17.
 */
let models = require('./../models');
let sequelize = models.sequelize;

module.exports.saveNewMessage = function (data, cb) {
  let fileNameArr = [];
  data.att.forEach(function (f) {
    fileNameArr.push(f.filename);
  });

  sequelize.sync().then(
    function () {
      let Message = models.Message;
      Message.create({
        subject: data.subject,
        message: data.message,
        att: JSON.stringify(fileNameArr),
        senderUserIdFk: data.senderUserId,
        receiverUserIdFk: data.receiverUserId
      }).then(function (insertedMessage) {
        // Send an emails
        models.User.findAll({
          where: {
            '$User.id$': data.receiverUserId
          },
          include: [models.Email]
        }).then(function (recievedUser) {
          models.User.findAll({
            where: {
              '$User.id$': data.senderUserId
            },
            include: [models.Email, models.PhoneNumber]
          }).then(function (sendUser) {
            let emailList = [];
            let numList = [];
            sendUser[0].Emails.forEach(function (e) {
              emailList.push(e.dataValues.email);
            });
            sendUser[0].PhoneNumbers.forEach(function (e) {
              numList.push(e.dataValues.number);
            });
            let emailData = {
              template: 'user-message',
              to: recievedUser[0].Emails[0].dataValues.email,
              subject: '[SellBnb] ' + (sendUser[0].dataValues.full_name || sendUser[0].dataValues.company_name || sendUser[0].dataValues.username) + ' send you a new message'
            };
            if (data.att.length > 0) {
              emailData.attachments = data.att;
            }
            require('./email-controller').sendEmail(emailData, {
              senderName: sendUser[0].dataValues.full_name || sendUser[0].dataValues.company_name || sendUser[0].dataValues.username,
              fullName: sendUser[0].dataValues.full_name,
              telephones: numList.join(', '),
              emails: emailList.join(', '),
              subject: data.subject,
              message: data.message,
              replyUrl: data.origin + '/user/messages/id/' + insertedMessage.id + '?expUsr=' + recievedUser[0].username,
            });

            saveAtts({att : data.att}, insertedMessage.id);

            cb();
          });
        });
      });
    }
  ).catch(function (error) {
    cb(error);
  });
};

module.exports.saveNewReplay = function (msgId, userId, data, cb) {
  let fileNameArr = [];

  data.att.forEach(function (f) {
    fileNameArr.push(f.filename);
  });

  sequelize.sync().then(
    function () {
      let MessageReply = models.MessageReply;
      let Message = models.Message;
      MessageReply.create({
        message: data.reply,
        MessageId: msgId,
        UserId: data.userId,
        att: JSON.stringify(fileNameArr)
      }).then(function (insertedMessageReply) {
        Message.findAll({
          where: {'$Message.id$': msgId}
        }).then(function (msg) {
          msg = msg[0].dataValues;
          models.User.findAll({
            where: {
              '$User.id$': msg.receiverUserIdFk
            },
            include: [models.Email]
          }).then(function (user1) {
            user1 = user1[0].dataValues;
            models.User.findAll({
              where: {
                '$User.id$': msg.senderUserIdFk
              },
              include: [models.Email]
            }).then(function (user2) {
              user2 = user2[0].dataValues;
              let emailData = {
                template: 'msg-reply',
              };
              if (data.att.length > 0) {
                emailData.attachments = data.att;
              }

              if(user2.id === parseInt(userId)){
                emailData.to = user1.Emails[0].dataValues.email;
                emailData.subject = '[SellBnb] You and ' + user2.username + ' conversation got a reply';
                require('./email-controller').sendEmail(emailData, {
                  message: data.reply,
                  senderName: user2.username,
                  replyUrl: data.origin + '/user/messages/id/' + msgId + '?expUsr=' + user1.username,
                });
              } else {
                emailData.to = user2.Emails[0].dataValues.email;
                emailData.subject = '[SellBnb] You and ' + user1.username + ' conversation got a reply';
                require('./email-controller').sendEmail(emailData, {
                  message: data.reply,
                  senderName: user1.username,
                  replyUrl: data.origin + '/user/messages/id/' + msgId + '?expUsr=' + user2.username,
                });
              }
              saveAtts({att : data.att}, msgId);
              cb();
            });
          });
        });

        // res.redirect('/user/messages/id/' + messageId);
      });
    }
  ).catch(function (error) {
    console.log(error);
  });
};

module.exports.getInboxList = function (userId, cb) {
  models.Message.findAll({
    where: {
      '$Message.receiverUserIdFk$': userId
    },
    include: [{
      model: models.User,
      as: 'senderUserId'
    }]
  }).then(function (msgs) {
    cb(msgs);
  })
};

module.exports.getSentList = function (userId, cb) {
  models.Message.findAll({
    where: {
      '$Message.senderUserIdFk$': userId
    },
    include: [{
      model: models.User,
      as: 'receiverUserId'
    }]
  }).then(function (msgs) {
    cb(msgs);
  })
};

module.exports.getMsgById = function (msgId, userId, cb) {
  models.Message.findAll({
    where: {
      $and: [
        {'$Message.id$': msgId},
        {
          $or: [
            {'$Message.senderUserIdFk$': userId},
            {'$Message.receiverUserIdFk$': userId}
          ]
        }
      ]
    },
    include: [{
      model: models.User,
      as: 'receiverUserId'
    },{
      model: models.User,
      as: 'senderUserId'
    }]
  }).then(function (msg) {
    if (msg[0]) {
      models.MessageReply.findAll({
        where: {MessageId: msg[0].dataValues.id},
        include: [models.User],
        order: [['updatedAt']]
      }).then(function (MessageReplies) {
        msg[0]['messageReplies'] = MessageReplies;
        cb(msg);
      });
    } else {
      cb(msg);
    }
  })
};

module.exports.getUserNameByMsgId = function (msgId, cb) {
  models.Message.findAll({
    where: {
      $and: [
        {'$Message.id$': msgId},
      ]
    },
    include: [{
      model: models.User,
      as: 'receiverUserId'
    },{
      model: models.User,
      as: 'senderUserId'
    }]
  }).then(function (msg) {
    if (msg[0]) {
      models.MessageReply.findAll({
        where: {MessageId: msg[0].dataValues.id},
        include: [models.User]
      }).then(function (MessageReplies) {
        msg[0]['messageReplies'] = MessageReplies;
        cb(msg);
      });
    } else {
      cb(msg);
    }
  })
};

function saveAtts(data, msgId) {
  let fs = require("fs");
  function saveFiles() {
    data.att.forEach(function (f) {
      let b64 = f.path.replace(/^data:image\/png;base64,/, "")
        .replace(/^data:image\/jpg;base64,/, "")
        .replace(/^data:image\/jpeg;base64,/, "")
        .replace(/^data:application\/pdf;base64,/, "");
      fs.writeFile('./public/uploads/messages/' + msgId +'/' + f.filename, b64, 'base64', function(err) {
        if(err) {
          console.log(err);
        } else {
          console.log('save ', f.filename);
        }
      });
    });
  }
  fs.exists('./public/uploads/messages/' + msgId, function (e) {
    if(!e) {
      fs.mkdir('./public/uploads/messages/' + msgId, function (err, result) {
        console.log('create dir', msgId);
        saveFiles();
      })
    }else {
      saveFiles();
    }
  });
}
