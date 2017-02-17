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
// Configuration:
//  FB_CLIENT_ID
//  FB_CLIENT_SECRET
//  FIREBASE_EMAIL
//  FIREBASE_EMAIL_PW
//  FIREBASE_API_KEY
//  FIREBASE_AUTH_DOMAIN
//  FIRE_DB_URL
//
// Author:
//  jonathan

const graph = require('fbgraph');
const firebase = require('firebase');
const async = require('async');
const auth = require('./utils/auth');

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
            robot.brain.set(REDIS_GUARDIAN_KEY, name);
            res.send(`*${name}* is now the keeper of the key!`);
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
        cb => auth.authenticateFirebase(cb),
        cb => auth.getFacebookAccessToken(robot, cb),
        cb => getFacebookID(guardian, cb),
        (facebookID, cb) => getFacebookProfilePhoto(facebookID, cb),
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

  let getFacebookID = (name, callback) => {
    firebase.database().ref('/facebook').child(name).on('value', (snapshot) => {
      let facebookID;
      if (snapshot.exists()) {
        facebookID = snapshot.val();
      }
      callback(null, facebookID);
    }, err => callback(err, null));
  };

  let getFacebookProfilePhoto = (facebookID, callback) => {
    graph.get(`${facebookID}/picture?type=large`, (err, resp) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, resp.location);
      }
    });
  };

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
      msg.image_url = profilePhotoURL;
    }

    callback(null, msg);
  };
};
