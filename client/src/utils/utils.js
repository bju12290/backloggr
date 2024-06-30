import { getDatabase, ref as dbRef, set, get, remove, update } from "firebase/database";
import { store } from '../store.js'

export const fetchGameDetailsById = async (gameId) => {
    try {
      // Modify the URL and parameters based on your endpoint
      const response = await fetch(`https://us-central1-video-game-collection-tracker.cloudfunctions.net/getGameDataViaId?query=${gameId}&limit=1`, {
        method: 'GET',
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch details for game ID ${gameId}`);
      }
  
      const gameDetails = await response.json();
      return gameDetails[0]; // Assuming the response is an array with one element
    } catch (error) {
      console.error(`Error fetching details for game ID ${gameId}:`, error.message);
      throw error; // Propagate the error to the caller
    }
  };

export const fetchGameImage = async (gameId, gameName) => {
    try {
      // Get SteamGridDB data for the game name
      const steamGridDBResponse = await fetch(`https://us-central1-video-game-collection-tracker.cloudfunctions.net/getSteamGridDBData?query=${gameName}`);
      const steamGridDBData = await steamGridDBResponse.json();
  
      // Check if SteamGridDB data is available
      if (steamGridDBData.data && steamGridDBData.data.length > 0) {
        const steamGridDbId = steamGridDBData.data[0]?.id;
  
        // Fetch game image using SteamGridDB ID
        const artTypeResponse = await fetch(`https://us-central1-video-game-collection-tracker.cloudfunctions.net/getGrid?query=${steamGridDbId}`);
        const artTypeData = await artTypeResponse.json();
  
        // Update the gameData structure
        return artTypeData.data[0]?.url || "https://res.cloudinary.com/ddv5jvvvg/image/upload/v1699694058/no_cover_img_t5agly.jpg";
      } else {
        //console.log(`SteamGridDB data not found for game ${gameName}.`);
      }
    } catch (error) {
      console.error(`Error fetching image for game ${gameName}:`, error);
    }
};

export const fetchPlatforms = async (gameId, platformIds) => {
    let platformData = [];
      try {
        
        const platformResponse = await fetch(`https://us-central1-video-game-collection-tracker.cloudfunctions.net/getPlatforms?query=${platformIds}`);
        const platforms = await platformResponse.json();
    
        // Map the response to platformData array
        platformData = platforms.map(platform => platform.abbreviation).filter(abbreviation => abbreviation);
    
        //console.log(`Updated platform data for the game with ID ${gameId}:`, platformData);
      } catch (error) {
        console.error(`Error fetching platform data for the game with ID ${gameId}:`, error);
      } finally {
        return platformData;
      }
      
}

export const handleAddToCollection = (gameId, gameName, gameStatus, gameReleaseYear, gamePopularity, platformIds, uid, steamAppId = null, genre = '') => {
  const db = getDatabase();
  const gameRef = dbRef(db, `data/users/${uid}/game_collection/${gameId}`);

  console.log(`Adding game to collection: ${gameId}, ${gameName}, UID: ${uid}`);

  if (gameStatus === undefined) {
    if (store.userData?.game_collection?.[gameId]?.game_status) {
      gameStatus = store.userData.game_collection[gameId].game_status;
    } else {
      gameStatus = "playing";
    }
  }

  if (gamePopularity === undefined) {
    gamePopularity = 0;
  }

  if (!gameReleaseYear) {
    gameReleaseYear = 0;
  }

  if (!platformIds) {
    platformIds = [];
  }

  let formattedReleaseYear;
  if (gameReleaseYear > new Date().getFullYear()) {
    formattedReleaseYear = new Date(gameReleaseYear * 1000).getFullYear();
  } else {
    formattedReleaseYear = gameReleaseYear;
  }

  get(gameRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        console.log(`Game ${gameId} already exists in collection.`);
      } else {
        console.log(`Game ${gameId} does not exist in collection. Adding new entry.`);
      }
    })
    .catch((error) => {
      console.error('Error checking if document exists:', error);
    })
    .finally(() => {
      setTimeout(() => {}, 3000);
    });

  update(gameRef, {
    steamAppId: steamAppId,
    game_name: gameName,
    game_status: gameStatus,
    platformIds: platformIds,
    release_year: formattedReleaseYear,
    popularity: gamePopularity,
    genre: genre,
    selected: false
  })
  .then(() => {
    console.log(`Game ${gameId} added/updated successfully.`);
  })
  .catch((error) => {
    console.error(`Error adding/updating game ${gameId}: ${error.message}`);
  });
};


  export const handleRemove = (gameId, uid) => {
    const db = getDatabase();
    const gameRef = dbRef(db, `data/users/${uid}/game_collection/${gameId}`);

    remove(gameRef)
    .then(() => {
      //console.log(`Game with ID ${gameId} removed successfully.`);
    })
    .catch((error) => {
      console.error(`Error removing game with ID ${gameId}: ${error.message}`);
    });
  }
  
  export const handleUpdate = (gameId, value, uid) => {
    const db = getDatabase();
    const gameRef = dbRef(db, `data/users/${uid}/game_collection/${gameId}`);
  
    console.log(`Updating game ${gameId} with value:`, value, `UID: ${uid}`);
  
    if (value === "playing" || value === "completed" || value === "backlog" || value === "dropped" || value === "never-played") {
      update(gameRef, {
        game_status: value,
      })
      .then(() => {
        console.log(`Game status for game with ID ${gameId} updated successfully.`);
      })
      .catch((error) => {
        console.error(`Error updating game status for game with ID ${gameId}: ${error.message}`);
      });
    } else {
      update(gameRef, {
        platform: value,
      })
      .then(() => {
        console.log(`Platform for game with ID ${gameId} updated successfully.`);
      })
      .catch((error) => {
        console.error(`Error updating platform for game with ID ${gameId}: ${error.message}`);
      });
    }
  };
  
  export const searchGames = async (queryValue, searchLimit) => {
    try {
        const response = await fetch(`https://us-central1-video-game-collection-tracker.cloudfunctions.net/getGameData?query=${queryValue}&limit=${searchLimit}`);
        const gameData = await response.json();

        const promises = gameData.map(async (game) => {
            const gameName = game.name;

            const steamGridDBResponse = await fetch(`https://us-central1-video-game-collection-tracker.cloudfunctions.net/getSteamGridDBData?query=${gameName}`);
            const steamGridDBData = await steamGridDBResponse.json();
            game.steamGridDBData = steamGridDBData;

            return game;
        });

        const resultsWithSteamGridDB = await Promise.all(promises);

        const artTypePromises = resultsWithSteamGridDB.map(async (game) => {
            if (game.steamGridDBData.data && game.steamGridDBData.data.length > 0) {
                const artTypeResponse = await fetch(`https://us-central1-video-game-collection-tracker.cloudfunctions.net/getGrid?query=${game.steamGridDBData.data[0].id}`);
                const artTypeData = await artTypeResponse.json();
                game.artType = artTypeData;
            }
            return game;
        });

        const resultsWithArtType = await Promise.all(artTypePromises);

        const searchResults = resultsWithArtType;

        //console.log(searchResults);
        return searchResults; // Move the return statement inside the async block
    } catch (error) {
        console.error('Error fetching game data:', error);
        throw error; // Propagate the error
    }
};
