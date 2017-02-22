const firebase = require('firebase');

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

exports.ADMIN = ADMIN;
exports.GUARDIAN = GUARDIAN;
exports.getRoles = getRoles;
