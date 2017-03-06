const async = require('async');
const google = require('googleapis');

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.GOOGLE_API_KEY
});

const getUploads = (query, callback) => {
  async.waterfall([
    cb => getUploadChannelID(cb),
    (id, cb) => getUploadsByChannelID(id, cb),
    (uploads, cb) => getVideoMatches(query, uploads, cb)
  ], (err, videos) => {
    if (err) {
      callback(err);
    } else {
      callback(null, videos);
    }
  });
};

const getUploadChannelID = (callback) => {
  const youtubeID = process.env.YOUTUBE_ID;
  youtube.channels.list({
    part: 'contentDetails',
    id: youtubeID
  }, (err, resp) => {
    if (err) {
      callback(err);
    } else {
      const playlistID = resp.items[0].contentDetails.relatedPlaylists.uploads;
      callback(null, playlistID);
    }
  });
};

const getUploadsByChannelID = (id, callback) => {
  youtube.playlistItems.list({
    playlistId: id,
    part: 'snippet'
  }, (err, resp) => {
    if (err) {
      callback(err);
    } else {
      const items = resp.items;
      const videos = [];
      items.forEach((item) => {
        videos.push({
          id: item.snippet.resourceId.videoId,
          title: item.snippet.title.split('|')[0].trim().toLowerCase()
        });
      });
      callback(null, videos);
    }
  });
};

const getVideoMatches = (query, uploads, callback) => {
  if (query.length < 3) {
    callback(new Error('Query should be at least 3 characters...'));
    return;
  }
  const matches = [];
  uploads.forEach((video) => {
    if (video.title.includes(query)) {
      matches.push(video);
    }
  });
  callback(null, matches);
};

exports.getUploads = getUploads;
