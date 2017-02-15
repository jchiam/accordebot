const ALTO1_PROP = 'alto_1';
const ALTO2_PROP = 'alto_2';
const ALTO_CEM_PROP = 'alto_cem';
const PRIME_PROP = 'prime';
const PRIME_CEM_PROP = 'prime_cem';
const BASS_PROP = 'bass';
const CONTRA_GR_PROP = 'contra_gr';

const list = {
  alto_1: ['Jonathan', 'Minmin'],
  alto_2: ['Minmin', 'Magdalene', 'Kevin'],
  alto_cem: ['Kevin'],
  prime: ['Dorothy', 'Cami'],
  prime_cem: [],
  bass: ['Peixin'],
  contra_gr: ['Yong Xiang']
};

const getSectionNameByProperty = (prop) => {
  switch (prop) {
    case 'alto_1':
      return 'Alto 1';
    case 'alto_2':
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

exports.list = list;
exports.getSectionNameByProperty = getSectionNameByProperty;
exports.getSectionProperty = getSectionProperty;
