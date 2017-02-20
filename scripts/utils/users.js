const firebase = require('firebase');
const graph = require('fbgraph');

const getSlackUsers = (robot, callback) => {
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

const getUserAliases = (callback) => {
  firebase.database().ref('/users').on('value', (snapshot) => {
    if (snapshot.exists()) {
      const users = snapshot.val();
      const list = [];
      for (const user in users) {
        let alias = [];
        if (users[user].alias) {
          alias = users[user].alias;
        }
        list.push({ name: users[user].name, alias });
      }
      callback(null, list);
    } else {
      callback(new Error('Unable to retrieve user...'), null);
    }
  }, err => callback(err, null));
};

const getUserKey = (query, callback) => {
  firebase.database().ref('/users').on('value', (snapshot) => {
    const name = query.toLowerCase();
    if (snapshot.exists()) {
      const users = snapshot.val();
      for (const user in users) {
        if (user.split(':')[0] === name || (users[user].alias && users[user].alias.includes(name))) {
          callback(null, user);
          return;
        }
      }
      callback(new Error(`No user matching _${query}_ found...`), null);
    } else {
      callback(new Error('Unable to retrieve user key...'));
    }
  });
const getUserKeyByName = (name, callback) => {
  if (name == null || name.length === 0) {
    callback(new Error('_getUserKeyByName_ - Invalid name supplied...'), null);
    return;
  }

  firebase.database().ref('/users').on('value', (snapshot) => {
    if (snapshot.exists()) {
      const users = snapshot.val();
      for (const user in users) {
        if (users[user].name === name) {
          callback(null, user);
          return;
        }
      }
      callback(new Error(`No user name matching _${name}_ found...`), null);
    } else {
      callback(new Error('Unable to retrieve user key...'), null);
    }
  }, err => callback(err, null));
};

const getUserName = (key, callback) => {
  firebase.database().ref(`/users/${key}/name`).on('value', (snapshot) => {
    if (snapshot.exists()) {
      callback(null, snapshot.val());
    } else {
      callback(new Error(`Unable to get name for ${key}...`), null);
    }
  });
};

const getFacebookID = (name, callback) => {
  firebase.database().ref('/facebook').child(name).on('value', (snapshot) => {
    let facebookID;
    if (snapshot.exists()) {
      facebookID = snapshot.val();
    }
    callback(null, facebookID);
  }, err => callback(err, null));
};

const getFacebookProfilePhoto = (facebookID, callback) => {
  graph.get(`${facebookID}/picture?type=large`, (err, resp) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, resp.location);
    }
  });
};

// const addRoleToUser = (robot, name, role) => {
//   const user = robot.brain.userForName(name);
//   if (user) {
//     if (user.roles == null || user.roles === undefined) {
//       user.roles = [];
//     }
//     user.roles.push(role);
//     return true;
//   }
//   return false;
// };
//
// const removeRoleFromUser = (robot, name, role) => {
//   const user = robot.brain.userForName(name);
//   if (user) {
//     if (user.roles != null && user.roles !== undefined) {
//       const index = user.roles.indexOf(role);
//       if (index > -1) {
//         user.roles.splice(index, 1);
//       }
//     }
//     return true;
//   }
//   return false;
// };

exports.getSlackUsers = getSlackUsers;
exports.getUserAliases = getUserAliases;
exports.getUserKey = getUserKey;
exports.getUserKeyByName = getUserKeyByName;
exports.getUserName = getUserName;
exports.getFacebookID = getFacebookID;
exports.getFacebookProfilePhoto = getFacebookProfilePhoto;
// exports.addRoleToUser = addRoleToUser;
// exports.removeRoleFromUser = removeRoleFromUser;
