<!-- 
- Add Ability to Change Game Status Under Each Game :check:
- Show current game's status as current input selection :check:
- Add Ability to Remove Game From Collection :check:
- Add Ability to Select Platform :check:
- Map over IGDB's available platforms for each game and make those the options available for users to select for platforms :check:
- Make platforms work the same way game status does, show the currently selected platform. :check:
- Optimize
- Create 'No Games Found' Display When No Games are Found
-->

<template>

    <div class="mt-16">
      <h2 class="">Your Collection</h2>

      <div class="grid grid-cols-3 gap-4">
        <div v-for="(game) in sortedGames">
          <div class="border p-4">

            <h3 class="line-clamp-1">{{ store.userData.game_collection[game.id]?.game_name || 'Loading...' }}</h3>
            <img :src="gameData[game.id]?.image || 'https://res.cloudinary.com/ddv5jvvvg/image/upload/v1699694058/no_cover_img_t5agly.jpg'" alt="Game Cover" class="max-h-40" />
            <p>First Release: {{  game.release_year }}</p>
            <p>Review Score: {{ gameData[game.id]?.popularity ? gameData[game.id]?.popularity : "No Rating Found" }}</p>

            <form @change="props.handleAddToCollection(game.id, gameData[game.id]?.name, store.userData.game_collection[game.id].game_status, store.userData.game_collection[game.id].release_year, gameData[game.id]?.popularity)" class="font-thin text-sm tracking-tight flex gap-2 flex-wrap place-content-center mt-5 ms-1">

              <input
                id="playing"
                v-model="store.userData.game_collection[game.id].game_status"
                :name="'status-' + (game.id ? game.id : '')"
                value="playing"
                type="radio"
              />

              <label for="playing">Playing</label>
              
              <input 
                id="completed"
                v-model="store.userData.game_collection[game.id].game_status"
                :name="'status-' + (game.id ? game.id : '')" 
                value="completed" 
                type="radio" 
              />

              <label for="completed">Completed</label>
              
              <input 
                id="backlog"
                v-model="store.userData.game_collection[game.id].game_status"
                :name="'status-' + (game.id ? game.id : '')" 
                value="backlog" 
                type="radio" 
                />

              <label for="backlog">Backlog</label>
              
              <div class="flex gap-2">
                <input 
                  id="dropped"
                  v-model="store.userData.game_collection[game.id].game_status"
                  :name="'status-' + (game.id ? game.id : '')" 
                  value="dropped" 
                  type="radio" 
                />

                <label for="dropped">Dropped</label>
              </div>
            </form>
            
            <form @change="handlePlatform(game.id, store.userData.game_collection[game.id].platform)">

              <label for="platform">Select Platform:</label>
                <select id="platform" name="platform" v-model="store.userData.game_collection[game.id].platform">
                  <option disabled value="">
                    {{ 
                      gameData[game.id]?.platforms && gameData[game.id]?.platforms.length > 0
                        ? "Please select a platform"
                        : "Platform Info Not Found"
                    }}
                  </option>

                  <template v-for="platform in gameData[game.id]?.platforms">
                      <option :value="platform">{{ platform }}</option>
                  </template>
                </select>
            </form>

            <button @click="handleRemove(game.id)">Remove From Collection</button>

          </div>
        </div>
      </div>
    </div>

    <div v-if="Object.keys(filteredGames).length === 0">
      No Games Found
    </div>

    <button @click="consoleLog">Console Log</button>

  </template>
  
  <script setup>
  import { ref, onMounted, watchEffect, watch } from 'vue';
  import { store } from '../store';
  import { getDatabase, ref as dbRef, update, get, remove } from "firebase/database";

  const gameData = ref({});
  const loading = ref(true);
  const localSelectedStatus = ref({});
  const props = defineProps(['handleAddToCollection', 'selectedStatus']);

  const consoleLog = () => {
    console.log(filteredGames.value)
    console.log(sortedGames.value)
    console.log(store.userData.game_collection)
    console.log(gameData.value)
    console.log(store.sortValue)
  }

  const fetchGameDetails = async () => {
    if (Object.keys(gameData.value).length === 0) {
    try {
      for (const id in store.userData.game_collection) {
        const gameId = parseInt(id);

        const gameInfoResponse = await fetch(`https://us-central1-video-game-collection-tracker.cloudfunctions.net/getGameDataViaId?query=${gameId}&limit=1`);
        const gameInfoArray = await gameInfoResponse.json();
        const gameInfo = gameInfoArray[0]

        const steamGridDBResponse = await fetch(`https://us-central1-video-game-collection-tracker.cloudfunctions.net/getSteamGridDBData?query=${gameInfo.name}`);
        const steamGridDBData = await steamGridDBResponse.json();

        const artTypeResponse = await fetch(`https://us-central1-video-game-collection-tracker.cloudfunctions.net/getGrid?query=${steamGridDBData.data[0]?.id}`);
        const artTypeData = await artTypeResponse.json();

        let platformData = []
        if (gameInfo.platforms && gameInfo.platforms.length > 0) {
        // Build an array of platformIds
        const platformIds = gameInfo.platforms.join(',');

        // Make a single request to getPlatforms for all platformIds
        const platformResponse = await fetch(`https://us-central1-video-game-collection-tracker.cloudfunctions.net/getPlatforms?query=${platformIds}`);
        const platforms = await platformResponse.json();

        // Map the response to platformData array
        platformData = platforms.map(platform => platform.abbreviation).filter(abbreviation => abbreviation);
      }
      
        gameData.value[id] = {
          name: gameInfo.name,
          image: artTypeData.data[0]?.url || "https://res.cloudinary.com/ddv5jvvvg/image/upload/v1699694058/no_cover_img_t5agly.jpg",
          platforms: platformData.length > 0 ? platformData : null,
          release_year: new Date(gameInfo.first_release_date * 1000).getFullYear(),
          popularity: gameInfo.total_rating
        };

        localSelectedStatus.value[id] = props.selectedStatus[id] || 'playing';
      }
    } catch (error) {
      console.error('Error fetching game details:', error);
    } finally {
      loading.value = false;
    }}
  };

  const filteredGames = ref({});

const updateFilteredGames = () => {
  const selectedPlatforms = store.selectedPlatforms;
  const selectedStatuses = store.selectedStatuses;

  filteredGames.value = Object.fromEntries(
    Object.entries(store.userData.game_collection)
      .filter(([id, game]) => {
        // Apply platform filter
        const platformMatch =
          selectedPlatforms.length === 0 ||
          selectedPlatforms.includes(game.platform) ||
          (game.platform === 'Uncategorized' && selectedPlatforms.includes('Uncategorized'));

        const nameMatch =
          store.searchTerm.length === 0 || game.game_name.toLowerCase().includes(store.searchTerm.toLowerCase());

        const releaseYearMatch =
          store.releaseYearStart <= game.release_year && game.release_year <= store.releaseYearEnd;

        const statusMatch =
          selectedStatuses.length === 0 || selectedStatuses.includes(game.game_status)

        return platformMatch && nameMatch && releaseYearMatch && statusMatch;
      })
  );
};

const sortedGames = ref([]);

watchEffect(() => {
  const sortingMethod = store.sortValue

  // Convert the object into an array of key-value pairs
  const gameArray = Object.entries(filteredGames.value);
  console.log(gameArray)
  switch (sortingMethod) {
    case 'AtoZ':
    gameArray.sort((a, b) => {
        const gameA = a[1].game_name.toUpperCase();
        console.log(gameA);
        const gameB = b[1].game_name.toUpperCase();
        console.log(gameB);

        if (gameA < gameB) return -1;
        if (gameA > gameB) return 1;
        return 0;
      });
      break;
    
    // Add other cases for different sorting methods
    case 'ZtoA':
    gameArray.sort((a, b) => {
        const gameA = a[1].game_name.toUpperCase();
        console.log(gameA);
        const gameB = b[1].game_name.toUpperCase();
        console.log(gameB);

        if (gameA > gameB) return -1;
        if (gameA < gameB) return 1;
        return 0;
      });
      break;
      case 'Newest':
      gameArray.sort((a, b) => b[1].release_year - a[1].release_year);
      break;

    case 'Oldest':
      gameArray.sort((a, b) => a[1].release_year - b[1].release_year);
      break;

    case 'PopHighToLow':
      gameArray.sort((a, b) => b[1].popularity - a[1].popularity);
      break;

    case 'PopLowToHigh':
      gameArray.sort((a, b) => a[1].popularity - b[1].popularity);
      break;
      
    case 'Status':
      const statusOrder = { playing: 1, completed: 2, backlog: 3, dropped: 4 };

      gameArray.sort((a, b) => {
        const statusA = statusOrder[a[1].game_status] || 5; // Default to 5 if not found in the order
        const statusB = statusOrder[b[1].game_status] || 5; // Default to 5 if not found in the order

        console.log(`Sorting ${a[1].game_name} (${a[1].game_status}) and ${b[1].game_name} (${b[1].game_status}): ${statusA} - ${statusB}`);

        return statusA - statusB;
      });
    break;

    default:

    // Add more cases as needed
    }

  // Sort the array based on the game name
  


  // Update the reactive ref with the sorted array
  sortedGames.value = gameArray.map(([id, game]) => ({ id, ...game }));

});

  const uid = ref(null);

  const handleRemove = (gameId) => {
    const db = getDatabase();
    const gameRef = dbRef(db, `data/users/${uid.value}/game_collection/${gameId}`);

    remove(gameRef)
    .then(() => {
      console.log(`Game with ID ${gameId} removed successfully.`);
    })
    .catch((error) => {
      console.error(`Error removing game with ID ${gameId}: ${error.message}`);
    });
  }

  const handlePlatform = (gameId, selectedPlatform) => {
    const db = getDatabase();
    const gameRef = dbRef(db, `data/users/${uid.value}/game_collection/${gameId}`);
    console.log(selectedPlatform)
    update(gameRef, {
        platform: selectedPlatform,
    })
    .then(() => {
    console.log(`Platform for game with ID ${gameId} updated successfully.`);
    })
    .catch((error) => {
    console.error(`Error updating platform for game with ID ${gameId}: ${error.message}`);
    });
  }


watchEffect(() => {
  uid.value = store.uid;
  if (store.userData.game_collection && Object.keys(store.userData.game_collection).length > 0 && props.selectedStatus) {
    updateFilteredGames();
  }
  if (store.userData.game_collection && Object.keys(store.userData.game_collection).length > 0) {
    fetchGameDetails();
  }
});


onMounted(() => {
  store.sortValue = ''
  uid.value = store.uid;
  fetchGameDetails();
});

</script>