<!-- 
  
  TODO: 
    - Add Loading Animation for Search Bar :check:
    - Add Status Functionality to Search Bar :check:
    - Add Functionality to Add Collection Item to Database :check:
    - Add popup for successful collection addition, collection item updated, and update failed :check:
    - Add "Item in Collection" under item in search results if user already has item in collection :check:
    - Add Collection Items Underneath Search Bar :check:
    - Add Ability to Change Game Status Under Each Game
    - Add Ability to Remove Game From Collection
    - Add Ability to Select Platform
    - Add "Get Collection Link" So Users Can Share Collection With Friends

-->

<style scoped>
/* Your existing styles go here */
.fade-in {
  animation: fadeIn 5s;
  -webkit-animation: fadeIn 5s;
  -moz-animation: fadeIn 5s;
  -o-animation: fadeIn 5s;
  -ms-animation: fadeIn 5s;
}

@keyframes fadeIn {
  0% { opacity: 0; }
  50% { opacity: 1;}
  100% { opacity: 0; }
}

.popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000; /* Ensure the popups appear above other elements */
  opacity: 0; /* Initially hidden */
  transition: opacity 0.3s ease-in-out;
}

/* Additional styling for specific popups */
.popup.success-popup {
  background-color: #8EE4AF; /* Green background for success popup */
  color: #13543B; /* Dark green text color */
}

.popup.error-popup {
  background-color: #F87171; /* Red background for error popup */
  color: #742A2A; /* Dark red text color */
}

.popup.update-popup {
  background-color: #93C5FD; /* Blue background for update popup */
  color: #1E3A8A; /* Dark blue text color */
}

/* Show the popups */
.popup.active {
  opacity: 1;
}
</style>

<template>
    <div >
    <div v-if="showSuccessPopup" class="rounded-md fade-in" :class="{ 'popup': true, 'success-popup': true, 'active': showSuccessPopup }">Item Added to Collection Popup</div>
    <div v-if="showErrorPopup" class="rounded-md fade-in" :class="{ 'popup': true, 'error-popup': true, 'active': showErrorPopup }">Error: Item Not Added to Collection Popup</div>
    <div v-if="showUpdatePopup" class="rounded-md fade-in" :class="{ 'popup': true, 'update-popup': true, 'active': showUpdatePopup }">Item Updated Popup</div>
  </div>
    <div class="relative m-auto top-7 max-lg:w-full w-1/2 center">
      <Combobox v-model="query" v-slot="{ open }">
        <div class="relative mt-1">
          <div
            class="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm"
          >
            <ComboboxInput
              class="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
              :displayValue="(person) => person.name"
              @change="query = $event.target.value; searchGames();"
            />
            <ComboboxButton
              class="absolute inset-y-0 right-0 flex items-center pr-2"
            >
              <ChevronUpDownIcon
                class="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </ComboboxButton>
          </div>
          <div v-show="open">
          <TransitionRoot
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ComboboxOptions
              class="absolute mt-1 max-h-80 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
            >
            <div v-if="loading" class="h-80 flex flex-col items-center justify-center h-full">
                <pacman-loader></pacman-loader>
                <p>Loading</p>
            </div>
            <div v-else>
              <div
                    v-for="game in searchResults"
                    as="template"
                    :key="game?.id"
                    :value="game"
                    >
                    <li class="relative cursor-default select-none py-2 pl-10 pr-4 text-gray-900">
                        <span class="block truncate text-xl">
                        <div class="grid grid-cols-2 justify-items-center place-items-center">
                          <div class="flex flex-col whitespace-normal max-sm:w-40 max-md:w-64 justify-self-start">
                              <p>{{ game?.name }}</p>
                              <p class="font-thin">Release Date: {{ new Date(game?.first_release_date * 1000).toLocaleDateString("en-US") }}</p>
                              <hr />
                              <p class="font-thin line-clamp-3">{{ game?.summary }}</p>
                              <hr />
                              <p class="font-thin">Review Score: <span class="font-medium">{{ game.total_rating ? game.total_rating.toFixed(2) : "No Rating Found"}}</span></p>
                              <form class="font-thin text-sm tracking-tight flex gap-2 flex-wrap place-content-center mt-5 ms-1">
                                <input
                                  v-model="selectedStatus[game.id]"
                                  :name="'status-' + (game ? game.id : '')"
                                  value="playing"
                                  type="radio"
                                />
                                <label for="playing">Playing</label>
                                
                                <input 
                                  v-model="selectedStatus[game.id]"
                                  :name="'status-' + (game ? game.id : '')" 
                                  value="completed" 
                                  type="radio" 
                                />
                                <label for="completed">Completed</label>
                                
                                <input 
                                  v-model="selectedStatus[game.id]"
                                  :name="'status-' + (game ? game.id : '')" 
                                  value="backlog" 
                                  type="radio" 
                                  />
                                <label for="backlog">Backlog</label>
                                
                                <div class="flex gap-2">
                                  <input 
                                    v-model="selectedStatus[game.id]"
                                    :name="'status-' + (game ? game.id : '')" 
                                    value="dropped" 
                                    type="radio" 
                                  />
                                  <label for="dropped">Dropped</label>
                                </div>
                              </form>
                              <button
                                @click="handleAddToCollection(game.id, game.name, selectedStatus[game.id])"
                                class="text-cyan-900 bg-emerald-300 hover:bg-emerald-500 focus:ring-4 focus:ring-emerald-700 font-medium rounded-lg text-sm px-5 py-2.5 ms-1 mt-2 mb-2"
                              >
                                Add to Collection
                              </button>
                              <div v-if="game.isInCollection" :class="{ 'text-green-500 font-semibold': game.isInCollection }">
                                In Collection
                              </div>
                          </div>
                          <div>
                            <img class="max-h-60 place-self-auto" :src="game?.artType?.data?.length > 0 ? game?.artType.data[0].url : 'https://res.cloudinary.com/ddv5jvvvg/image/upload/v1699694058/no_cover_img_t5agly.jpg'"/>
                          </div>
                        </div>
                        </span>
                    </li>
                    </div>
                    <hr>
                  </div>
            </ComboboxOptions>
          </TransitionRoot>
        </div>
        </div>
      </Combobox>
    </div>
    <CollectionGrid />
  </template>
  
  <script setup>
  import { ref, watchEffect  } from 'vue'
  import {
    Combobox,
    ComboboxInput,
    ComboboxButton,
    ComboboxOptions,
    TransitionRoot,
  } from '@headlessui/vue'
  import { ChevronUpDownIcon } from '@heroicons/vue/20/solid'
  import PacmanLoader from 'vue-spinner/src/PacmanLoader.vue'
  import { getDatabase, ref as dbRef, set, get } from "firebase/database";
  import { store } from '../store'
  import CollectionGrid from '../components/CollectionGrid.vue'

  const uid = ref(null);
  console.log(uid.value)
  
watchEffect(() => {
  uid.value = store.uid;
  // Now you can use uid.value in your component
  console.log(uid.value);
});

  const loading = ref(false)

  let query = ref('')

  let debounceTimeout = null;

  const debounce = (fn, delay) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    debounceTimeout = setTimeout(fn, delay);
  };

  let searchResults = ref([])
  
  
  const searchGames = () => {
    console.log(store)
  searchResults = ref([]);
  debounce(() => {
    loading.value = true
    const queryValue = query.value; // Get the user's query
    const searchLimit = 5
    // Make a request to the IGDB API
    fetch(`https://us-central1-video-game-collection-tracker.cloudfunctions.net/getGameData?query=${queryValue}&limit=${searchLimit}`)
      .then((response) => response.json())
      .then(async (gameData) => {
        // Create an array to store the promises for fetching artwork
        const promises = gameData.map(async (game) => {
          const gameName = game.name;

          // Make a request to the SteamGridDB API to get SteamGridDB data
          const steamGridDBResponse = await fetch(`https://us-central1-video-game-collection-tracker.cloudfunctions.net/getSteamGridDBData?query=${gameName}`);
          const steamGridDBData = await steamGridDBResponse.json();
          game.steamGridDBData = steamGridDBData; // Associate the SteamGridDB data with the search result

          return game;
        });


        // Use Promise.all to fetch SteamGridDB data for all games
        const resultsWithSteamGridDB = await Promise.all(promises);

        // Now, create new promises to fetch the correct art type for each game
        const artTypePromises = resultsWithSteamGridDB.map(async (game) => {
            console.log(game)
          if (game.steamGridDBData.data && game.steamGridDBData.data.length > 0) {
            const artTypeResponse = await fetch(`https://us-central1-video-game-collection-tracker.cloudfunctions.net/getGrid?query=${game.steamGridDBData.data[0].id}`);
            const artTypeData = await artTypeResponse.json();
            game.artType = artTypeData;
          }
          return game;
        });

        // Use Promise.all to fetch the correct art type for all games
        const resultsWithArtType = await Promise.all(artTypePromises);

        searchResults.value = resultsWithArtType;

        for (const game of searchResults.value) {
        game.isInCollection = await checkIsInCollection(game.id);
      }

        console.log(searchResults.value);
      })
      .catch((error) => {
        console.error('Error fetching game data:', error);
      })
      .finally(() => {
        loading.value = false
      });
  }, 400);
};

const selectedStatus = ref({});

const showSuccessPopup = ref(false);
const showErrorPopup = ref(false);
const showUpdatePopup = ref(false);

const handleAddToCollection = (gameId, gameName, gameStatus) => {
  const db = getDatabase();
  console.log(uid);

  const gameRef = dbRef(db, `data/users/${uid.value}/game_collection/${gameId}`);

  // Check if the document already exists
  get(gameRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        // Document exists, it's an update
        // You can add specific logic for updates if needed
        showUpdatePopup.value = true;
        showSuccessPopup.value = false;
        showErrorPopup.value = false;
      } else {
        // Document doesn't exist, it's an initial addition
        showSuccessPopup.value = true;
        showErrorPopup.value = false;
        showUpdatePopup.value = false;
      }
    })
    .catch((error) => {
      console.error('Error checking if document exists:', error);
      showErrorPopup.value = true;
      showSuccessPopup.value = false;
      showUpdatePopup.value = false;
    })
    .finally(() => {
      // Optionally, use a timeout to hide the popups after a certain duration
      setTimeout(() => {
        showSuccessPopup.value = false;
        showErrorPopup.value = false;
        showUpdatePopup.value = false;
      }, 3000); // Adjust the duration as needed
    });

  // Perform the set operation
  set(gameRef, {
    game_name: gameName,
    game_status: gameStatus,
  });
}

const checkIsInCollection = async (gameId) => {
  // Use the same logic to check if the document exists in the collection
  const db = getDatabase();
  const gameRef = dbRef(db, `data/users/${uid.value}/game_collection/${gameId}`);

  try {
    const snapshot = await get(gameRef);
    return snapshot.exists();
  } catch (error) {
    console.error('Error checking if document exists:', error);
    return false;
  }
};

  </script>