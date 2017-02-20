// Description:
//  Find out who the guardian of the key is
//
// Commands:
//  hubot guardian - keeper of the key
//  hubot guardian reset - dethrone keeper of the key
//  hubot guardian set <name> - crown the keeper of the key
//
// Dependencies:
//  "async": "^2.1.4"
//
// Author:
//  jonathan

const async = require('async');
const auth = require('./utils/auth');
const userUtils = require('./utils/users');

const REDIS_GUARDIAN_KEY = 'guardian';

module.exports = (robot) => {
  robot.respond(/\bguardian ?(.*)?/i, (res) => {
    const args = res.match[0].trim().split(' ');
    const cmd = args[2] ? args[2].toLowerCase() : '';
    const name = args[3] ? args.slice(3).join(' ').toLowerCase() : '';

    if (cmd) {
      switch (cmd) {
        // hubot guardian reset - dethrone keeper of the key
        case 'reset':
          robot.brain.remove(REDIS_GUARDIAN_KEY);
          res.send('Keeper of keys *dethroned!*');
          break;
        // hubot guardian set <name> - crown the keeper of the key
        case 'set':
          if (name) {
            async.waterfall([
              cb => auth.authenticateFirebase(cb),
              cb => userUtils.getUserKey(name, cb),
              (key, cb) => userUtils.getUserName(key, cb)
            ], (err, userName) => {
              if (err) {
                res.send(`Error: ${err.message}`);
              } else {
                robot.brain.set(REDIS_GUARDIAN_KEY, userName);
                res.send(`*${userName}* is now the keeper of the key!`);
              }
            });
          } else {
            res.send('I\'m not sure who you are trying to set...');
          }
          break;
        default:
          break;
      }
    // hubot guardian - keeper of the key
    } else {
      const guardian = robot.brain.get('guardian');
      if (!guardian) {
        res.send('Keeper of key unknown...');
        return;
      }

      async.waterfall([
        cb => auth.authenticateFirebaseAndFacebook(robot, cb),
        cb => userUtils.getUserKeyByName(guardian, cb),
        (key, cb) => userUtils.getFacebookProfilePhotoByKey(key, cb),
        (profilePhotoURL, cb) => prepareGuardianDeclaration(guardian, profilePhotoURL, cb)
      ], (err, msg) => {
        if (err) {
          res.send(`Error: ${err.message}`);
        } else {
          res.send(msg);
        }
      });
    }
  });

  let prepareGuardianDeclaration = (name, profilePhotoURL, callback) => {
    const msg = {
      text: '*Accord\u00E9 Guitar Ensemble - The Guardian*',
      attachments: [{
        fallback: `Keeper of the key is ${name}`,
        text: `Keeper of the key... :key::key::key: is *${name}*!`,
        color: '#f4e842',
        mrkdwn_in: ['text']
      }]
    };

    if (profilePhotoURL) {
      msg.attachments[0].image_url = profilePhotoURL;
    }

    callback(null, msg);
  };
};
