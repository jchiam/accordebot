const async = require('async');
const firebase = require('firebase');
const userUtils = require('../utils/users');

const ALTO1_PROP = 'alto1';
const ALTO2_PROP = 'alto2';
const ALTO_CEM_PROP = 'alto_cem';
const PRIME_PROP = 'prime';
const PRIME_CEM_PROP = 'prime_cem';
const BASS_PROP = 'bass';
const CONTRA_GR_PROP = 'contra_gr';

const getSections = (section, callback) => {
  if (section == null || section.length === 0) {
    firebase.database().ref('/sections').on('value', (snapshot) => {
      if (snapshot.exists()) {
        callback(null, snapshot.val());
      } else {
        callback(new Error('Failed to retrieve sections...'));
      }
    });
    return;
  }

  firebase.database().ref(`/sections/${section}`).on('value', (snapshot) => {
    if (snapshot.exists()) {
      callback(null, snapshot.val());
    } else {
      callback(new Error(`Invalid section - ${section}`));
    }
  });
};

const getSectionNameByProperty = (prop) => {
  switch (prop) {
    case 'alto1':
      return 'Alto 1';
    case 'alto2':
      return 'Alto 2';
    case 'alto_cem':
      return 'Alto Cembalo';
    case 'prime':
      return 'Prime';
    case 'prime_cem':
      return 'Prime Cembalo';
    case 'bass':
      return 'Bass';
    case 'contra_gr':
      return 'Contrabass / Guitarron';
    default:
      return '';
  }
};

const getSectionProperty = (section) => {
  switch (section.toLowerCase()) {
    case 'a1':
    case 'alto1':
    case 'alto 1':
      return ALTO1_PROP;
    case 'a2':
    case 'alto2':
    case 'alto 2':
      return ALTO2_PROP;
    case 'ac':
    case 'acem':
    case 'a cem':
    case 'altocem':
    case 'alto cem':
    case 'alto cembalo':
      return ALTO_CEM_PROP;
    case 'p':
    case 'prime':
      return PRIME_PROP;
    case 'pc':
    case 'pcem':
    case 'p cem':
    case 'primecem':
    case 'prime cem':
    case 'prime cembalo':
      return PRIME_CEM_PROP;
    case 'b':
    case 'bass':
      return BASS_PROP;
    case 'cb':
    case 'contra':
    case 'contrabass':
    case 'gr':
    case 'guitarron':
      return CONTRA_GR_PROP;
    default:
      return '';
  }
};

exports.getSections = getSections;
exports.getSectionNameByProperty = getSectionNameByProperty;
exports.getSectionProperty = getSectionProperty;
