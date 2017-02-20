const async = require('async');
const firebase = require('firebase');
const graph = require('fbgraph');
const sectionUtils = require('./sections');

const getSlackUsers = (robot, callback) => {
  if (process.env.SLACK_API_TOKEN) {
    const url = `https://slack.com/api/users.list?token=${process.env.SLACK_API_TOKEN}`;
    robot.http(url).get()((err, resp, body) => {
      if (resp.statusCode !== 200) {
        callback(new Error('Failed to retrieve user list from Slack...'));
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
    callback(new Error('Slack API token not set...'));
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
      callback(new Error('Unable to retrieve user...'));
    }
  }, err => callback(err));
};

const getUserKey = (query, callback) => {
  if (query == null || query.length === 0) {
    callback(new Error('_getUserKey_ - Invalid query supplied...'));
    return;
  }

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
      callback(new Error(`No user matching _${query}_ found...`));
    } else {
      callback(new Error('Unable to retrieve user key...'));
    }
  }, err => callback(err));
};

const getUserKeyByName = (name, callback) => {
  if (name == null || name.length === 0) {
    callback(new Error('_getUserKeyByName_ - Invalid name supplied...'));
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
      callback(new Error(`No user name matching _${name}_ found...`));
    } else {
      callback(new Error('Unable to retrieve user key...'));
    }
  }, err => callback(err));
};

const getUserName = (key, callback) => {
  if (key == null || key.length === 0) {
    callback(new Error('_getUserName_ - Invalid key supplied...'));
    return;
  }

  firebase.database().ref(`/users/${key}/name`).on('value', (snapshot) => {
    if (snapshot.exists()) {
      callback(null, snapshot.val());
    } else {
      callback(new Error(`Unable to get name for ${key}...`));
    }
  }, err => callback(err));
};

const getUserNameByName = (query, callback) => {
  if (query == null || query.length === 0) {
    callback(new Error('_getUserNameByName_ - Invalid query supplied...'));
    return;
  }

  async.waterfall([
    cb => getUserKey(query, cb),
    (key, cb) => getUserName(key, cb)
  ], (err, name) => {
    if (err) {
      callback(err);
    } else {
      callback(null, name);
    }
  });
};

const getUserSectionByKey = (key, callback) => {
  if (key == null || key.length === 0) {
    callback(new Error('_getUserSectionByKey_ - Invalid key supplied...'));
    return;
  }

  const name = key.split(':')[0];
  async.waterfall([
    cb => sectionUtils.getSections('', cb)
  ], (err, sections) => {
    if (err) {
      callback(err);
    } else {
      const userSections = [];
      for (const section in sections) {
        if (sections[section].includes(name)) {
          userSections.push(sectionUtils.getSectionNameByProperty(section));
        }
      }

      if (userSections.length === 0) {
        callback(new Error(`Unable to find section of _${name}_...`));
        return;
      }
      callback(null, userSections);
    }
  });
};

const getFacebookID = (key, callback) => {
  if (key == null || key.length === 0) {
    callback(new Error('_getFacebookID_ - Invalid key supplied...'));
    return;
  }

  firebase.database().ref(`/users/${key}`).on('value', (snapshot) => {
    let facebookID;
    if (snapshot.exists()) {
      facebookID = snapshot.val().facebook;
      callback(null, facebookID);
    } else {
      callback(new Error(`No user with key _${key}_ found...`));
    }
  }, err => callback(err));
};

const getFacebookProfilePhoto = (facebookID, callback) => {
  if (facebookID == null || facebookID.length === 0) {
    callback(new Error('_getFacebookProfilePhoto_ - Invalid id supplied...'));
    return;
  }

  graph.get(`${facebookID}/picture?type=large`, (err, resp) => {
    if (err) {
      callback(err);
    } else {
      callback(null, resp.location);
    }
  });
};

const getFacebookProfilePhotoByKey = (key, callback) => {
  async.waterfall([
    cb => getFacebookID(key, cb),
    (facebookID, cb) => getFacebookProfilePhoto(facebookID, cb)
  ], (err, profilePhotoURL) => {
    if (err) {
      callback(err);
    } else {
      callback(null, profilePhotoURL);
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
exports.getUserNameByName = getUserNameByName;
exports.getUserSectionByKey = getUserSectionByKey;
exports.getFacebookID = getFacebookID;
exports.getFacebookProfilePhoto = getFacebookProfilePhoto;
exports.getFacebookProfilePhotoByKey = getFacebookProfilePhotoByKey;
// exports.addRoleToUser = addRoleToUser;
// exports.removeRoleFromUser = removeRoleFromUser;
