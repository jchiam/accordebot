var list = {
  alto_1: ['Jonathan', 'Minmin'],
  alto_2: ['Minmin', 'Magdalene', 'Kevin'],
  alto_cem: ['Kevin'],
  prime: ['Dorothy', 'Cami'],
  prime_cem: [],
  bass: ['Peixin'],
  contra_gr: ['Yong Xiang']
};

var getSectionName = prop => {
  switch(prop) {
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
}

exports.list = list;
exports.getSectionName = getSectionName;
