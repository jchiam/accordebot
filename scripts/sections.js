// Description:
//  Sections query
//
// Commands:
//  hubot section(s) - full section list
//  hubot section(s) <section> - specific section list
//
// Dependencies:
//  "async": "^2.1.4"
//
// Author:
//  jonathan

const async = require('async');
const auth = require('./utils/auth');
const sectionUtils = require('./utils/sections');

module.exports = (robot) => {
  robot.respond(/\bsections?(.*)/i, (res) => {
    const section = res.match[1].trim();
    if (section) {
      processSingleSection(res, section);
    } else {
      processAllSections(res);
    }
  });
};

let processSingleSection = (res, section) => {
  const parsedSection = sectionUtils.getSectionProperty(section);
  if (parsedSection === '') {
    res.send(`Error: Unknown section _${section}_...`);
    return;
  }

  async.waterfall([
    cb => auth.authenticateFirebase(cb),
    cb => sectionUtils.getSections(parsedSection, cb)
  ], (err, sections) => {
    if (err) {
      res.send(`Error: ${err.message}...`);
      return;
    }

    const sectionField = [{
      title: sectionUtils.getSectionNameByProperty(parsedSection),
      value: processSection(sections)
    }];
    res.send(prepareSectionMsg(sectionField));
  });
};

let processAllSections = (res) => {
  async.waterfall([
    cb => auth.authenticateFirebase(cb),
    cb => sectionUtils.getSections('', cb)
  ], (err, sections) => {
    if (err) {
      res.send(`Error: ${err.message}...`);
      return;
    }

    const multiSectionFields = [];
    for (const sect in sections) {
      multiSectionFields.push({
        title: sectionUtils.getSectionNameByProperty(sect),
        value: processSection(sections[sect]),
        short: true
      });
    }
    res.send(prepareSectionMsg(multiSectionFields));
  });
};

let prepareSectionMsg = (fields) => {
  const msg = {
    text: '*Accord\u00E9 Guitar Ensemble - Sections*',
    attachments: [{
      fallback: 'Accord\u00E9 Guitar Ensemble - Sections',
      color: '#96ec21',
      fields,
      footer: 'Brought to you by Accord\u00E9Bot'
    }]
  };
  return msg;
};

let processSection = (section) => {
  const names = [];
  for (const name in section) {
    names.push(name);
  }
  return names.join('\n');
};
