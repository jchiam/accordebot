// Description:
//  Manage user roles and bot access
//
// Commands:
//  hubot roles - list available roles and their respsective users
//
// Dependencies:
//  "async": "^2.1.4"
//
// Author:
//  jonathan

const async = require('async');
const utils = require('./utils/utils');
const auth = require('./utils/auth');
const roleUtils = require('./utils/roles');

module.exports = (robot) => {
  // hubot roles - list available roles and their respsective users
  robot.respond(/\broles?/i, (res) => {
    async.waterfall([
      cb => auth.authenticateFirebase(cb),
      cb => roleUtils.getRoles(cb),
      (roles, cb) => prepareRolesMsg(roles, cb)
    ], (err, msg) => {
      if (err) {
        res.send(`Error: ${err.message}`);
      } else {
        res.send(msg);
      }
    });
  });

  let prepareRolesMsg = (roles, callback) => {
    const fields = [];
    // show admin first
    fields.push({
      title: utils.capitalizeFirstChar(roleUtils.ADMIN),
      value: roles[roleUtils.ADMIN].join(', ')
    });
    for (const role in roles) {
      if (role !== roleUtils.ADMIN) {
        fields.push({
          title: utils.capitalizeFirstChar(role),
          value: roles[role].join(', ')
        });
      }
    }
    const msg = {
      text: '*Accord\u00E9 Guitar Ensemble - Roles*',
      attachments: [{
        fallback: '*Accord\u00E9 Guitar Ensemble - Roles*',
        fields,
        color: '#d2691e'
      }]
    };

    callback(null, msg);
  };
};
