# AccordeBot

AccordeBot is a chat bot built on the [Hubot][hubot] framework. It was
initially generated by [generator-hubot][generator-hubot]. This setup is meant to be deployed onto IBM Bluemix.

[hubot]: http://hubot.github.com
[generator-hubot]: https://github.com/github/generator-hubot

## Features
```
hubot section(s) - full section list
hubot section(s) <section> - specific section list
```

## Requirements
- NodeJS
- CloudFoundry/CLI (manual deployment): https://github.com/cloudfoundry/cli
- generator-hubot: https://github.com/github/generator-hubot

## Running AccordeBot Locally

You can start AccordeBot locally by running:

```
% bin/hubot
```

You'll see some start up output and a prompt:

```
[Sat Feb 28 2015 12:38:27 GMT+0000 (GMT)] INFO Using default redis on localhost:6379
accordebot>
```

Then you can interact with accordebot by typing `accordebot help`.

```
accordebot> accordebot help
accordebot animate me <query> - The same thing as `image me`, except adds [snip]
accordebot help - Displays all of the help commands that accordebot knows about.
...
```

## Deployment

Auto-deployment has been setup on IBM Bluemix DevOps. Any changes to `master` branch will trigger a deployment.

Manual deployment requires cloudfoundry/cli installed and IBM Bluemix access:

```
% cf login
% cf push accordebot
```

## Restart AccordeBot

```
% cf restage accordebot
```
