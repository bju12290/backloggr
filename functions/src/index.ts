
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
  
      const igdbApiUrl = 'https://api.igdb.com/v4/search';
  
      const headers = {
        'Client-ID': client_id,
        'Authorization': `Bearer ${twitchAccessToken}`,
      };

      const userQuery = request.query.query;
      console.log(userQuery)
  
      const requestBody = `fields name; limit 10; search "${userQuery}";`;
  
      const igdbResponse = await axios.post(igdbApiUrl, requestBody, { headers });
  
      response.json(igdbResponse.data);
    })
    } catch (error) {
      console.error('Error obtaining IGDB data:', error);
      response.status(500).json({ error: 'Internal Server Error', message: 'An error occurred while processing your request.' });
    }
  });

export const getGrids = functions.https.onRequest(async (request, response) => {
  try {
    const api_key = steamGridAPIKey.value()
    const steamGridUrl = 'https://www.steamgriddb.com/api/v2/search/autocomplete/Counter-Strike'

    const headers = {
      'Authorization': `Bearer ${api_key}`
    }

    const sgdbResponse = await axios.get(steamGridUrl, { headers })
    response.json(sgdbResponse.data)
  } catch (error) {
    console.error('Error obtaining SGDB data', error)
    response.status(500).json({ error: 'Internal Server Error' });
  }
})