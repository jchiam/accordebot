// Description:
//  Youtube archive-related queries
//
// Commands:
//  hubot youtube <query> - returns possible video matches to query from youtube uploads
//
// Dependencies:
//  "async": "^2.1.4"
//
// Author:
//  jonathan

const async = require('async');
const youtubeUtils = require('./utils/youtube');

module.exports = (robot) => {
  // hubot youtube <query> - returns possible video matches to query from youtube uploads
  robot.respond(/\byoutube( .+)/i, (res) => {
    const query = res.match[1].trim().toLowerCase();

    async.waterfall([
      cb => youtubeUtils.getUploads(query, cb)
    ], (err, results) => {
      if (err) {
        res.send(`Error: ${err.message}`);
      } else if (results.length === 0) {
        res.send('No matches found...');
      } else {
        results.forEach((video) => {
          res.send(`https://www.youtube.com/watch?v=${video.id}`);
        });
      }
    });
  });
};
