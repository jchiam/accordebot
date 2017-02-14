// Description:
//  Sections query
//
// Commands:
//  hubot section(s) - full section list
//  hubot section(s) <section> - particular section list
//
// Author:
//  jonathan

const sections = require('./data/sections');

module.exports = (robot) => {
  robot.respond(/\bsections?(.*)/i, (res) => {
    let section = res.match[1];
    let attachments = [{
      fallback: 'Accord\u00E9 Guitar Ensemble - Sections',
      title: 'Accord\u00E9 Guitar Ensemble - Sections',
      color: '#96ec21',
      fields: formatSectionFields(sections.list)
    }];

    res.send({ attachments });
  });
};

var formatSectionFields = sectionsList => {
  var fields = [];
  for (var section in sectionsList) {
    if (sectionsList[section].length > 0) {
      fields.push({
        title: sections.getSectionName(section),
        value: stringifyArrayToColumn(sectionsList[section]),
        "short": true
      });
    }
  };
  return fields;
};

var stringifyArrayToColumn = arr => {
  return arr.join('\n');
}
