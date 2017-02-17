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

const REDIS_GUARDIAN_KEY = 'guardian';
const FIREBASE_CONFIG = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DB_URL
};
firebase.initializeApp(FIREBASE_CONFIG);

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
        cb => authenticateFirebase(cb),
        cb => getFacebookAccessToken(cb),
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

  let authenticateFirebase = (callback) => {
    firebase
      .auth()
      .signInWithEmailAndPassword(process.env.FIREBASE_EMAIL, process.env.FIREBASE_EMAIL_PW)
      .catch(error => callback(error));
    callback(null);
  };

  let getFacebookAccessToken = (callback) => {
    const url = `https://graph.facebook.com/oauth/access_token?client_id=${process.env.FB_CLIENT_ID}&client_secret=${process.env.FB_CLIENT_SECRET}&grant_type=client_credentials`;

    robot.http(url).get()((err, resp) => {
      if (resp.statusCode !== 200) {
        callback(new Error(`Facebook auth failed...${process.env.FB_CLIENT_ID}`));
      } else {
        // graph.setAccessToken(body.split('='[1]));
        callback(null);
      }
    });
  };

  let getFacebookID = (name, callback) => {
    firebase.database().ref('/facebook').on('value', (snapshot) => {
      const facebookID = snapshot.val()[name];
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
