//Commenting here just as I'm learning and so others can follow what's
//  going on.

//Express is the web server that runs on nodejs.  it serves both the
//  angular front end as well as the api that angular calls.  That api
//  makes calls to Riot's API as well as caching/saving data to a local
//  DB to reduce calls to riot
const express = require('express');
//This loads a local env file containing things like API cert keys to
//  the Riot API.  This allows the code to use the API key without having
//  to check in the key to GitHub, which is a security risk.  You may
//  have to create this file locally.
//
//  dotenv seems to be the nodejs standard for doing this, so the file
//  is a .env file
require('dotenv').config();
//Required for express to serve up stuff
const bodyParser = require('body-parser');
//chalk is a defacto string library for Node
const chalk = require('chalk');

const LeagueJs = require('leaguejs');
const api = new LeagueJs(process.env.riotAPIKey, {
    PLATFORM_ID: 'na1',
    caching: {
        isEnabled: true, // enable basic caching
        defaults: {stdTTL: 120} // add a TTL to all Endpoints you think is appropriate (you can tune it later per Endpoint)
    }
});

////Init Kindred with our Riot API key
//var k = new KindredApi.Kindred({
//  key: process.env.riotAPIKey,
//  defaultRegion: REGIONS.NORTH_AMERICA,
//  debug: process.env.riotAPIDebug,
//  showKey: process.env.riotAPIDebug,
//  showHeaders: process.env.riotAPIDebug,
//  limits: LIMITS.DEV,
//  cache: new InMemoryCache()
//});

//Init and configure express.  Pretty boilerplate stuff
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Create link to Angular build directory.  I believe this sets the dist dir
//  at the root and serves its contents as static files (express.static(distDir)
//  This allows us to serve front end/web stuff, while futher below we'll set up
//  some API stuff.  Things here won't have their routing done through express,
//  however, since this is probably a single page app we can let Angualr handle
//  all of the 'routing' once index.html is loaded
const distDir = __dirname + "/public/";
app.use(express.static(distDir));

//Router will set up the api calls.  It reads in all the http traffic and 'routes'
//  it to specific endpoints
const router = express.Router();  // get an instance of the express Router

//All of our routes will be prefixed with /api.  Since the front end stuff is in
//  /dist and thus at root, it can follow its own heiarchry, while everything with
//  /api will follow the heiarchry we define in router
app.use('/api', router);

//every router bounce call will go through here.  We can use this to set up basic
//  logging or configuration of headers or what ever needs to be done on all api
//  calls.  The next() allows the call to continue through to the requested route
router.use(function(req, res, next) {
  next();
});

/* GET /api/ping */
//Our first API call, will simply return a silly little string.  Good for smoke
//  testing if the server is running correctly or not.
router.route('/ping')
    .get(function(req, res) {
      res.json({message: 'Ping! I am alive'});
    });

/* GET /api/summoner/:sumname */
//Pass the entered summoner name to the KindredApi, which converts that to
//  user id and then passes that to the Riot API to get the match history
router.route('/summoner/:sumname')
    .get(function(req, res) {
        api.Summoner.gettingByName(req.params.sumname)
            .then(data => {
                api.Match.gettingListByAccount(data.accountId)
                    .then(matchList => { res.json(matchList) })
                    .catch(error => { res.json({error:error}) });
            })
            .catch(error => { res.json({error:error}) });
    });

/* GET /api/match/:matchid */
//Get the game stats for the entered matchid.  Redis will cache this short term
//  while longer term we'll want to do ... something for this?
router.route('/match/:matchid')
    .get(function(req, res){
      //k.Match.by.id(parseInt(req.params.matchid))
      //    .then(data => res.json(data))
      //.catch(error => res.json({error:err}));
        api.Match.gettingById(req.params.matchid)
            .then(data => { res.json(data) })
            .catch(error => { res.json({error:error}) });
    });

/* GET /api/static/:champid */
//Get the static data for the given champion
router.route('/static/champ/:champid')
    .get(function(req, res){
      //k.Static.Champion.by.id(parseInt(req.params.champid), {tags:'all'})
      //    .then(data => res.json(data))
      //.catch(error => res.json({error:err}));
    })

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

//Boilerplate node.js thing to make all our code visible and usable
module.exports = app;
