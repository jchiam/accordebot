// Description:
//  User-related queries
//
// Commands:
//  hubot who( )is <name> - returns relevant information and facebook picture of queries name
//  hubot user(s) - returns a mapping of all slack users and respective id
//  hubot alias(es) - returns a list of the aliases of all slack users
//  hubot key <name> - returns the NoSQL key of the query name
//
// Dependencies:
//  "async": "^2.1.4"
//
// Configuration:
//  SLACK_API_TOKEN
//
// Author:
//  jonathan

const async = require('async');
const auth = require('./utils/auth');
const userUtils = require('./utils/users');

module.exports = (robot) => {
  // hubot who( )is <name> - returns relevant information and facebook picture of queries name
  robot.respond(/\bwho ?is(.*)/i, (res) => {
    const name = res.match[1].trim();
    if (name) {
      async.waterfall([
        cb => auth.authenticateFirebaseAndFacebook(robot, cb),
        cb => userUtils.getUserKey(name, cb),
        (key, cb) => async.parallel({
          name: callback => userUtils.getUserName(key, callback),
          section: callback => userUtils.getUserSectionByKey(key, callback),
          photo: callback => userUtils.getFacebookProfilePhotoByKey(key, callback)
        }, (err, profile) => {
          if (err) {
            cb(err);
          } else {
            cb(null, profile);
          }
        }),
        (profile, cb) => prepareProfileMsg(profile, cb)
      ], (err, msg) => {
        if (err) {
          res.send(`Error: ${err.message}`);
        } else {
          res.send(msg);
        }
      });
    } else {
      res.send('I\'m not sure who you are trying query...');
    }
  });

  // hubot user(s) - returns a mapping of all slack users and respective id
  robot.respond(/\busers?/i, (res) => {
    async.waterfall([
      cb => userUtils.getSlackUsers(robot, cb),
      (users, cb) => prepareUsersMsg(users, cb)
    ], (err, msg) => {
      if (err) {
        res.send(`Error: ${err.message}`);
      } else {
        res.send(msg);
      }
    });
  });

  // hubot alias(es) - returns a list of the aliases of all slack users
  robot.respond(/\balias(es)?/i, (res) => {
    async.waterfall([
      cb => auth.authenticateFirebase(cb),
      cb => userUtils.getUserAliases(cb),
      (aliases, cb) => prepareAliasesMsg(aliases, cb)
    ], (err, msg) => {
      if (err) {
        res.send(`Error: ${err.message}`);
      } else {
        res.send(msg);
      }
    });
  });

  // hubot key <name> - returns the NoSQL key of the query name
  robot.respond(/\bkey(.*)/i, (res) => {
    const query = res.match[1].trim().toLowerCase();
    async.waterfall([
      cb => auth.authenticateFirebase(cb),
      cb => userUtils.getUserKey(query, cb)
    ], (err, key) => {
      if (err) {
        res.send(`Error: ${err.message}`);
      } else {
        res.send(key);
      }
    });
  });

  let prepareProfileMsg = (profile, callback) => {
    const msg = {
      text: `*Accord\u00E9 Guitar Ensemble - ${profile.name}*`,
      attachments: [{
        fallback: `Accord\u00E9 Guitar Ensemble - ${profile.name}`,
        color: '#1479DE',
        fields: [{
          value: `*Section(s):* ${profile.section.join(', ')}`,
          short: false
        }],
        mrkdwn_in: ['fields']
      }]
    };

    if (profile.photo) {
      msg.attachments[0].image_url = profile.photo;
    }

    callback(null, msg);
  };

  let prepareUsersMsg = (users, callback) => {
    const fields = [];
    users.forEach((user) => {
      fields.push({
        value: `*${user.name}*: _${user.id}_`,
        short: true
      });
    });

    callback(null, {
      text: '*Accord\u00E9 Guitar Ensemble - Users*',
      attachments: [{
        fallback: 'Accord\u00E9 Guitar Ensemble - Users',
        color: '#1479DE',
        fields,
        footer: 'Brought to you by Accord\u00E9Bot',
        mrkdwn_in: ['fields']
      }]
    });
  };

  let prepareAliasesMsg = (aliases, callback) => {
    const fields = [];
    aliases.forEach((user) => {
      fields.push({
        title: user.name,
        value: user.alias.join(', '),
        short: true
      });
    });

    callback(null, {
      text: '*Accord\u00E9 Guitar Ensemble - User Aliases*',
      attachments: [{
        fallback: 'Accord\u00E9 Guitar Ensemble - Users Aliases',
        color: '#1479DE',
        fields,
        footer: 'Brought to you by Accord\u00E9Bot'
      }]
    });
  };
};
