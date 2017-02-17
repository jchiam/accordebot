// Description:
//  User-related queries
//
// Commands:
//  hubot user(s) - returns a mapping of all slack users and respective id
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

module.exports = (robot) => {
  robot.respond(/\busers?/i, (res) => {
    async.waterfall([
      cb => getUsers(cb)
    ], (err, users) => {
      if (err) {
        res.send(`Error: ${err.message}`);
      } else {
        const fields = [];
        users.forEach((user) => {
          fields.push({
            value: `*${user.name}*: _${user.id}_`,
            short: true
          });
        });

        res.send({
          text: '*Accord\u00E9 Guitar Ensemble - Users*',
          attachments: [{
            fallback: 'Accord\u00E9 Guitar Ensemble - Users',
            color: '#1479DE',
            fields,
            footer: 'Brought to you by Accord\u00E9Bot',
            mrkdwn_in: ['fields']
          }]
        });
      }
    });
  });

  let getUsers = (callback) => {
    if (process.env.SLACK_API_TOKEN) {
      const url = `https://slack.com/api/users.list?token=${process.env.SLACK_API_TOKEN}`;
      robot.http(url).get()((err, resp, body) => {
        if (resp.statusCode !== 200) {
          callback(new Error('Failed to retrieve user list from Slack...'), null);
        } else {
          const userDetails = JSON.parse(body).members;
          const users = [];
          userDetails.forEach((userDetail) => {
            if (!userDetail.is_bot && userDetail.id !== 'USLACKBOT') {
              users.push({ name: userDetail.name, id: userDetail.id });
            }
          });

          callback(null, users);
        }
      });
    } else {
      callback(new Error('Slack API token not set...'), null);
    }
  };
};
