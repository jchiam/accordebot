const firebase = require('firebase');

const ALTO1_PROP = '0:alto1';
const ALTO2_PROP = '1:alto2';
const PRIME_PROP = '2:prime';
const ALTO_CEM_PROP = '3:alto_cem';
const PRIME_CEM_PROP = '4:prime_cem';
const BASS_PROP = '5:bass';
const CONTRA_GR_PROP = '6:contra_gr';

const sectionsRef = firebase.database().ref('/sections');

const getSections = (section, callback) => {
  if (section == null || section.length === 0) {
    sectionsRef.once('value', (snapshot) => {
      if (snapshot.exists()) {
        callback(null, snapshot.val());
      } else {
        callback(new Error('Failed to retrieve sections...'));
      }
    }, err => callback(err));
    return;
  }

  sectionsRef.child(section).once('value', (snapshot) => {
    if (snapshot.exists()) {
      callback(null, snapshot.val());
    } else {
      callback(new Error(`Invalid section ${parseSectionProp(section)}...`));
    }
  }, err => callback(err));
};

const parseSectionProp = (prop) => {
  if (prop) {
    return prop.split(':')[1];
  }
  return '';
};

const getSectionNameByProperty = (prop) => {
  switch (prop) {
    case ALTO1_PROP:
      return 'Alto 1';
    case ALTO2_PROP:
      return 'Alto 2';
    case PRIME_PROP:
      return 'Prime';
    case ALTO_CEM_PROP:
      return 'Alto Cembalo';
    case PRIME_CEM_PROP:
      return 'Prime Cembalo';
    case BASS_PROP:
      return 'Bass';
    case CONTRA_GR_PROP:
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
exports.parseSectionProp = parseSectionProp;
exports.getSectionNameByProperty = getSectionNameByProperty;
exports.getSectionProperty = getSectionProperty;
