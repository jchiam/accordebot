const async = require('async');
const firebase = require('firebase');
const userUtils = require('./users');

const ADMIN = 'admin';
const GUARDIAN = 'guardian';

const rolesRef = firebase.database().ref('/roles');

const getRoles = (callback) => {
  rolesRef.once('value', (snapshot) => {
    if (snapshot.exists()) {
      callback(null, snapshot.val());
    } else {
      callback(new Error('Failed to retrieve roles...'));
    }
  }, err => callback(err));
};

const getRole = (role, callback) => {
  rolesRef.child(role).once('value', (snapshot) => {
    if (snapshot.exists()) {
      callback(null, snapshot.val());
    } else {
      callback(new Error(`Failed to retrieve _${role}_ role...`));
    }
  }, err => callback(err));
};

const setRole = (names, role, callback) => {
  let err;
  if (names.length > 0) {
    const newRole = {};
    newRole[role] = names;
    rolesRef.update(newRole, (updateErr) => {
      if (updateErr) {
        err = updateErr;
      }
    });
  } else {
    rolesRef.child(role).remove((removeErr) => {
      if (removeErr) {
        err = removeErr;
      }
    });
  }

  if (err) {
    callback(new Error(`Failed to set users for _${role}_ role...`));
  } else {
    callback();
  }
};

const getUserRoles = (key, callback) => {
  const userRoles = [];
  const name = userUtils.getKeyNameFromKey(key);

  rolesRef.once('value', (snapshot) => {
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
  }, err => callback(err));
};

const setUserRole = (name, role, callback) => {
  const userRole = {};
  userRole[role] = [name];
  rolesRef.update(userRole, (err) => {
    if (err) {
      callback(err);
    } else {
      callback();
    }
  });
};

const removeUserRole = (name, role, callback) => {
  async.waterfall([
    cb => getRole(role, cb),
    (users, cb) => {
      if (users.includes(name)) {
        users.splice(users.indexOf(name), 1);
      }
      cb(null, users);
    },
    (users, cb) => setRole(users, role, cb)
  ], (err, users) => {
    if (err) {
      callback(err);
    } else {
      callback(null, users);
    }
  });
};

const isUserRole = (name, role, callback) => {
  rolesRef.child(role).once('value', (snapshot) => {
    if (snapshot.exists()) {
      callback(null, snapshot.val().includes(name));
    } else {
      callback(null, false);
    }
  }, err => callback(err));
};

exports.ADMIN = ADMIN;
exports.GUARDIAN = GUARDIAN;
exports.getRoles = getRoles;
exports.getRole = getRole;
exports.setRole = setRole;
exports.getUserRoles = getUserRoles;
exports.setUserRole = setUserRole;
exports.removeUserRole = removeUserRole;
exports.isUserRole = isUserRole;
