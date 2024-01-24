
import axios from 'axios';
const path = require('path');
const cors = require('cors')({ origin: true });

const { defineString } = require('firebase-functions/params');
const admin = require('firebase-admin');
import {onRequest} from "firebase-functions/v2/https";
import * as functions from 'firebase-functions';

const serviceAccount = require(path.join(__dirname, 'adminSDKKey.json'))

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://video-game-collection-tracker-default-rtdb.firebaseio.com"
  });

const db = admin.database();

const twitchClientId = defineString('TWITCH_CLIENT_ID');
const twitchClientSecret = defineString('TWITCH_CLIENT_SECRET');
const steamGridAPIKey = defineString('STEAMGRID_API_KEY');
const steamAPIKey = defineString('STEAM_API_KEY')

const twitchAccessTokenRef = db.ref('/twitchAccessToken');

export const helloWorld = onRequest(
    { maxInstances: 3 },
  (req, res) => {
      res.send(`${twitchClientId.value()}! ${twitchClientSecret.value()}.`);
    }
  );

export const getTwitchAccessToken = functions.https.onRequest(async (request, response) => {
     try {
       const client_id = twitchClientId.value()
       const client_secret = twitchClientSecret.value()
  
       const twitchOAuthUrl = 'https://id.twitch.tv/oauth2/token';
       const data = new URLSearchParams();
       data.append('client_id', client_id);
       data.append('client_secret', client_secret);
       data.append('grant_type', 'client_credentials');
  
       const twitchOAuthResponse = await axios.post(twitchOAuthUrl, data);

       const accessToken = twitchOAuthResponse.data.access_token;

       await twitchAccessTokenRef.set(accessToken);
  
       response.json({ access_token: accessToken });
     } catch (error) {
       console.error('Error obtaining Twitch access token:', error);
       response.status(500).json({ error: 'Internal Server Error' });
     }
});

export const getGameData = functions.https.onRequest(async (request, response) => {
    try {
      await cors(request, response, async () => {
        const accessTokenSnapshot = await twitchAccessTokenRef.once('value');
        const twitchAccessToken = accessTokenSnapshot.val();
      if (!twitchAccessToken) {
        response.status(500).json({ error: 'Twitch access token is missing or invalid.' });
        return;
      }

      const client_id = twitchClientId.value()
  
      const igdbApiUrl = 'https://api.igdb.com/v4/games';
  
      const headers = {
        'Client-ID': client_id,
        'Authorization': `Bearer ${twitchAccessToken}`,
      };

      const userQuery = request.query.query;
      const searchLimit = request.query.limit ? request.query.limit : 1;

      const requestBody = `fields name, platforms, first_release_date, total_rating, summary; limit ${searchLimit}; search "${userQuery}"; where version_parent = null;`;
  
      const igdbResponse = await axios.post(igdbApiUrl, requestBody, { headers });
  
      response.json(igdbResponse.data);
    })
    } catch (error) {
      console.error('Error obtaining IGDB data:', error);
      response.status(500).json({ error: 'Internal Server Error', message: 'An error occurred while processing your request.' });
    }
  });

  export const getPlatforms = functions.https.onRequest(async (request, response) => {
    console.log("Started getPlatforms");
    try {
      await cors(request, response, async () => {
        const accessTokenSnapshot = await twitchAccessTokenRef.once('value');
        const twitchAccessToken = accessTokenSnapshot.val();
        if (!twitchAccessToken) {
          response.status(500).json({ error: 'Twitch access token is missing or invalid.' });
          return;
        }
  
        const client_id = twitchClientId.value();
  
        // Assuming request.query.query is an array of platformIds
        const platformIds = request.query.query;
  
        const igdbApiUrl = 'https://api.igdb.com/v4/platforms';
  
        const headers = {
          'Client-ID': client_id,
          'Authorization': `Bearer ${twitchAccessToken}`,
        };
  
        const requestBody = `fields abbreviation; where id = (${platformIds});`;
        const igdbResponse = await axios.post(igdbApiUrl, requestBody, { headers });
  
        response.json(igdbResponse.data);
        console.log("Finished getPlatforms");
      });
    } catch (error) {
      console.error('Error obtaining IGDB data:', error);
      response.status(500).json({ error: 'Internal Server Error', message: 'An error occurred while processing your request.' });
    }
  });

  export const getGameDataViaId = functions.https.onRequest(async (request, response) => {
    console.log("Started getGameDataViaId")
    try {
      await cors(request, response, async () => {
        console.log("Getting authorization Info")
        const accessTokenSnapshot = await twitchAccessTokenRef.once('value');
        const twitchAccessToken = accessTokenSnapshot.val();
      if (!twitchAccessToken) {
        console.log("Error getting TwitchAccessToken")
        response.status(500).json({ error: 'Twitch access token is missing or invalid.' });
        return;
      }

      console.log("Got Access Token... Proceeding", twitchAccessToken)

      const client_id = twitchClientId.value()

      console.log("Client ID:", client_id)
  
      const igdbApiUrl = 'https://api.igdb.com/v4/games';
  
      const headers = {
        'Client-ID': client_id,
        'Authorization': `Bearer ${twitchAccessToken}`,
      };

      const id = request.query.query;
      console.log("Game ID:", id)
      const searchLimit = request.query.limit
      console.log("searchLimit:", searchLimit)

      const requestBody = `fields name, platforms, first_release_date, total_rating; limit ${searchLimit}; where id = ${id};`;
  
      const igdbResponse = await axios.post(igdbApiUrl, requestBody, { headers });

      console.log(igdbResponse.data)
  
      response.json(igdbResponse.data);
      console.log("Finished getGameDataViaId")
    })
    } catch (error) {
      console.error('Error obtaining IGDB data:', error);
      response.status(500).json({ error: 'Internal Server Error', message: 'An error occurred while processing your request.' });
    }
  });

export const getSteamGridDBData = functions.https.onRequest(async (request, response) => {
  console.log("Started getSteamGridDBData")
  try {
    await cors(request, response, async () => {
    const api_key = steamGridAPIKey.value()
    const gameName = request.query.query
    const steamGridUrl = `https://www.steamgriddb.com/api/v2/search/autocomplete/${gameName}`

    const headers = {
      'Authorization': `Bearer ${api_key}`
    }

    const sgdbResponse = await axios.get(steamGridUrl, { headers })
    response.json(sgdbResponse.data)
    console.log("Finished getSteamGridDBData")
  })
  } catch (error) {
    console.error('Error obtaining SGDB data', error)
    response.status(500).json({ error: 'Internal Server Error' });
  }
})

export const getGrid = functions.https.onRequest(async (request, response) => {
  console.log("Started getGrid")
  try {
    await cors(request, response, async () => {
      const api_key=steamGridAPIKey.value()
      const gameId = request.query.query
      const steamGridUrl = `https://www.steamgriddb.com/api/v2/grids/game/${gameId}?dimensions=600x900`

      const headers = {
        'Authorization': `Bearer ${api_key}`
      }
      const sgdbResponse = await axios.get(steamGridUrl, { headers })
      response.json(sgdbResponse.data)
      console.log("Finished getGrid")
    })
  } catch (error) {
    console.error('Error obtaing SGDB grid', error)
    response.status(500).json({ error: 'Internal Server Error' })
  }
})

export const steamLibraryImport = functions.https.onRequest(async (request, response) => {
  try {
    // Enable CORS
    await cors(request, response, async () => {
      const api_key = steamAPIKey.value();
      const vanityUrl = request.query.query;

      console.log('Received vanity URL:', vanityUrl);

      const getSteamIdURL = `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${api_key}&vanityurl=${vanityUrl}`

      const steamIdResponse = await axios.get(getSteamIdURL)

      const steamId = steamIdResponse.data.response.steamid

      // Log the received steamId to the console for testing
      console.log('Received steam ID:', steamId);

      const getOwnedGamesURL = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${api_key}&steamid=${steamId}&include_appinfo=1&format=json`;

      const steamResponse = await axios.get(getOwnedGamesURL);

      if (steamResponse.data && steamResponse.data.response && steamResponse.data.response.games) {
        const userGames = steamResponse.data.response.games;
        response.json({ games: userGames });
      } else {
        response.json({ error: 'Unable to fetch user games from Steam API' });
      }
    });
  } catch (error) {
    console.error('Error fetching user games from Steam API', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
});