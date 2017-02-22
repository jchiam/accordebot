const firebase = require('firebase');
const userUtils = require('./users');

const ADMIN = 'admin';
const GUARDIAN = 'guardian';

const getRoles = (callback) => {
  firebase.database().ref('/roles').on('value', (snapshot) => {
    if (snapshot.exists()) {
      callback(null, snapshot.val());
    } else {
      callback(new Error('Failed to retrieve roles...'));
    }
  });
};

const getUserRoles = (key, callback) => {
  const userRoles = [];
  const name = userUtils.getKeyNameFromKey(key);

  firebase.database().ref('/roles').on('value', (snapshot) => {
    if (snapshot.exists()) {
      const roles = snapshot.val();
      for (const role in roles) {
        if (roles[role].includes(name)) {
          userRoles.push(role);
        }
      }
      callback(null, userRoles);
    } else {
      callback(new Error('Failed to retrieve roles...'));
    }
  });
};

const isUserRole = (key, role, callback) => {
  const name = userUtils.getKeyNameFromKey(key);
  firebase.database().ref(`/roles/${role}`).on('value', (snapshot) => {
    if (snapshot.exists()) {
      callback(null, snapshot.val().includes(name));
    } else {
      callback(new Error(`Invalid role ${role} supplied...`));
    }
  });
};

exports.ADMIN = ADMIN;
exports.GUARDIAN = GUARDIAN;
exports.getRoles = getRoles;
exports.getUserRoles = getUserRoles;
exports.isUserRole = isUserRole;
