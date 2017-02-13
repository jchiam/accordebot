// Description:
//  Sections query
//
// Commands:
//  hubot section <section> - Acknowledges incident
//
// Author:
//  jonathan

const sections = require('./data/sections');

module.exports = (robot) => {
  robot.respond(/section/i, (res) => {
    res.send('sections!!');
  });
};
