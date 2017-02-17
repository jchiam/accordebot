// Description:
//  User-related queries
//
// Commands:
//  hubot user(s) - returns a mapping of all slack users and respective id
//  hubot alias(es) - returns a list of the aliases of all slack users
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
