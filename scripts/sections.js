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
const utils = require('./utils/utils');
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
    cb => sectionUtils.getSections(parsedSection, cb),
    (sect, cb) => utils.replaceArrWithPreferredNames(sect, cb)
  ], (err, result) => {
    if (err) {
      res.send(`Error: ${err.message}...`);
      return;
    }

    const sectionField = [{
      title: sectionUtils.getSectionNameByProperty(parsedSection),
      value: stringifyArrayToColumn(result)
    }];
    res.send(prepareSectionMsg(sectionField));
  });
};

let processAllSections = (res) => {
  async.waterfall([
    cb => auth.authenticateFirebase(cb),
    cb => sectionUtils.getSections('', cb),
    (sections, cb) => async.mapValues(
      sections,
      (names, key, callback) => utils.replaceArrWithPreferredNames(names, callback),
      (err, results) => {
        if (err) {
          cb(err);
        } else {
          cb(null, results);
        }
      })
  ], (err, results) => {
    if (err) {
      res.send(`Error: ${err.message}...`);
      return;
    }

    const multiSectionFields = [];
    for (const sect in results) {
      multiSectionFields.push({
        title: sectionUtils.getSectionNameByProperty(sect),
        value: stringifyArrayToColumn(results[sect]),
        short: true
      });
    }
    res.send(prepareSectionMsg(multiSectionFields));
  });
};

let prepareSectionMsg = (fields) => {
  const msg = {
    attachments: [{
      fallback: 'Accord\u00E9 Guitar Ensemble - Sections',
      title: 'Accord\u00E9 Guitar Ensemble - Sections',
      color: '#96ec21',
      fields,
      footer: 'Brought to you by Accord\u00E9Bot'
    }]
  };
  return msg;
};

let stringifyArrayToColumn = arr => arr.join('\n');
