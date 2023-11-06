//const {initializeApp} = require("firebase-admin/app");
const { defineString } = require('firebase-functions/params');
const admin = require('firebase-admin');

import {onRequest} from "firebase-functions/v2/https";
//import * as logger from "firebase-functions/logger";
import * as functions from 'firebase-functions';
import axios from 'axios';
const path = require('path');

const serviceAccount = require(path.join(__dirname, 'adminSDKKey.json'))

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://video-game-collection-tracker-default-rtdb.firebaseio.com"
  });

const db = admin.database();

const twitchClientId = defineString('TWITCH_CLIENT_ID');
const twitchClientSecret = defineString('TWITCH_CLIENT_SECRET');
const twitchAccessTokenRef = db.ref('/twitchAccessToken');

export const helloWorld = onRequest(
    { maxInstances: 3 },
  (req, res) => {
      res.send(`${twitchClientId.value()}! ${twitchClientSecret.value()}.`);
    }
  );

export const getTwitchAccessToken = functions.https.onRequest(async (request, response) => {
     try {
       // Replace with your actual Client ID and Client Secret
       const client_id = twitchClientId.value()
       const client_secret = twitchClientSecret.value()
  
       // Make a POST request to Twitch OAuth2 token endpoint
       const twitchOAuthUrl = 'https://id.twitch.tv/oauth2/token';
       const data = new URLSearchParams();
       data.append('client_id', client_id);
       data.append('client_secret', client_secret);
       data.append('grant_type', 'client_credentials');
  
       const twitchOAuthResponse = await axios.post(twitchOAuthUrl, data);

       const accessToken = twitchOAuthResponse.data.access_token;

       await twitchAccessTokenRef.set(accessToken);
  
       // Respond with the access token
       response.json({ access_token: accessToken });
     } catch (error) {
       console.error('Error obtaining Twitch access token:', error);
       response.status(500).json({ error: 'Internal Server Error' });
     }
});

export const getGameData = functions.https.onRequest(async (request, response) => {
    try {

        const accessTokenSnapshot = await twitchAccessTokenRef.once('value');
        const twitchAccessToken = accessTokenSnapshot.val();
      if (!twitchAccessToken) {
        response.status(500).json({ error: 'Twitch access token is missing or invalid.' });
        return;
      }

      const client_id = twitchClientId.value()
  
      // Define the IGDB API endpoint
      const igdbApiUrl = 'https://api.igdb.com/v4/games';
  
      // Define the headers for the IGDB API request
      const headers = {
        'Client-ID': client_id,
        'Authorization': `Bearer ${twitchAccessToken}`,
      };
  
      // Define the request body (specify fields, filters, etc.)
      const requestBody = 'fields *; limit 10;';
  
      // Make a POST request to the IGDB API
      const igdbResponse = await axios.post(igdbApiUrl, requestBody, { headers });
  
      // Respond with the data obtained from the IGDB API
      response.json(igdbResponse.data);
    } catch (error) {
      console.error('Error obtaining IGDB data:', error);
      response.status(500).json({ error: 'Internal Server Error' });
    }
  });