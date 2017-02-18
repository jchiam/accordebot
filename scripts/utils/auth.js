const firebase = require('firebase');

const FIREBASE_CONFIG = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DB_URL
};
firebase.initializeApp(FIREBASE_CONFIG);

const authenticateFirebase = (callback) => {
  const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      unsubscribe();
      callback(null);
    }
  });

  // sign in to firebase if necessary
  if (firebase.auth().currentUser == null) {
    firebase
      .auth()
      .signInWithEmailAndPassword(process.env.FIREBASE_EMAIL, process.env.FIREBASE_EMAIL_PW)
      .catch(error => callback(error));
  }
};

const getFacebookAccessToken = (robot, callback) => {
  const url = `https://graph.facebook.com/oauth/access_token?client_id=${process.env.FB_CLIENT_ID}&client_secret=${process.env.FB_CLIENT_SECRET}&grant_type=client_credentials`;

  robot.http(url).get()((err, resp) => {
    if (resp.statusCode !== 200) {
      callback(new Error(`Facebook auth failed...${process.env.FB_CLIENT_ID}`));
    }
    // graph.setAccessToken(body.split('='[1]));
    callback(null);
  });
};

exports.authenticateFirebase = authenticateFirebase;
exports.getFacebookAccessToken = getFacebookAccessToken;
