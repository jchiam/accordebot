// Description:
//  Sections query
//
// Commands:
//  hubot section(s) - full section list
//  hubot section(s) <section> - specific section list
//
// Author:
//  jonathan

const sections = require('./data/sections');

module.exports = (robot) => {
  robot.respond(/\bsections?(.*)/i, (res) => {
    let section = res.match[1].trim();
    let attachments = [{
      fallback: 'Accord\u00E9 Guitar Ensemble - Sections',
      title: 'Accord\u00E9 Guitar Ensemble - Sections',
      color: '#96ec21',
      fields: section ? formatSectionFields(sections.list, section) : formatAllSectionFields(sections.list),
      footer: 'Brought to you by Accord\u00E9Bot'
    }];

    res.send({ attachments });
  });
};

var formatAllSectionFields = sectionsList => {
  var fields = [];
  for (var section in sectionsList) {
    if (sectionsList[section].length > 0) {
      fields.push({
        title: sections.getSectionNameByProperty(section),
        value: stringifyArrayToColumn(sectionsList[section]),
        "short": true
      });
    }
  };
  return fields;
};

var formatSectionFields = (sectionsList, sectionReq) => {
  var field = [];
  var sectionProp = sections.getSectionProperty(sectionReq);
  if (sectionProp) {
    field.push({
      title: sections.getSectionNameByProperty(sectionProp),
      value: stringifyArrayToColumn(sectionsList[sectionProp])
    });
  }
  return field;
}

var stringifyArrayToColumn = arr => {
  return arr.join('\n');
}
