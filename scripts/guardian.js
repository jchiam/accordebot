// Description:
//  Find out who the guardian of the key is
//
// Commands:
//  hubot guardian - keeper of the key
//  hubot guardian reset - dethrone keeper of the key
//  hubot guardian set <name> - crown the keeper of the key
//
// Author:
//  jonathan

const REDIS_GUARDIAN_KEY = 'guardian';

module.exports = (robot) => {
  robot.respond(/\bguardian ?(.*)?/i, (res) => {
    const args = res.match[0].trim().split(' ');
    const cmd = args[2] ? args[2].toLowerCase() : '';
    const name = args[3] ? args[3].toLowerCase() : '';

    if (cmd) {
      switch (cmd) {
        // hubot guardian reset - dethrone keeper of the key
        case 'reset':
          robot.brain.remove(REDIS_GUARDIAN_KEY);
          res.send('Keeper of keys dethroned!');
          break;
        // hubot guardian set <name> - crown the keeper of the key
        case 'set':
          if (name) {
            robot.brain.set(REDIS_GUARDIAN_KEY, name);
            res.send(`${name} is now the keeper of the key!`);
          } else {
            res.send('Set who?');
          }
          break;
        default:
          break;
      }
    // hubot guardian - keeper of the key
    } else {
      const guardian = robot.brain.get('guardian');
      if (guardian) {
        res.send(guardian);
      } else {
        res.send('Keeper of keys unknown...');
      }
    }
  });
};
