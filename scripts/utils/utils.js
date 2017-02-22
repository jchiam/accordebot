const async = require('async');
const userUtils = require('./users');

const capitalizeFirstChar = str => str.charAt(0).toUpperCase() + str.slice(1);

const replaceArrWithPreferredNames = (arr, callback) => {
  if (arr.length === 0) {
    callback(null, arr);
    return;
  }

  async.map(arr, userUtils.getUserNameByName, (err, formattedArr) => {
    if (err) {
      callback(err);
    } else {
      callback(null, formattedArr);
    }
  });
};

exports.capitalizeFirstChar = capitalizeFirstChar;
exports.replaceArrWithPreferredNames = replaceArrWithPreferredNames;
