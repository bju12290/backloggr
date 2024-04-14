<!-- 
  
  TODO: 
  - List View
  - Export to Excel Spreadsheet
  - Import From Excel Spreadsheet
  - Add "Get Collection Link" So Users Can Share Collection With Friends 
-->
<style scoped>
.status-selected {
  background-color: #14FFEB;
  color: #393939;
  font-weight: 650;
}

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
  z-index: 1000;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.popup.success-popup {
  background-color: #8EE4AF; 
  color: #13543B; 
}

.popup.error-popup {
  background-color: #F87171;
  color: #742A2A; 
}

.popup.update-popup {
  background-color: #93C5FD; 
  color: #1E3A8A;
}

.popup.active {
  opacity: 1;
}

.progress-bar {
  position: relative;
  width: 100%;
  height: 30px;
  border-radius: 15px; /* Half of height to make it round */
}

.progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 15px; /* Half of height to make it round */
  transition: width 0.3s ease; /* Smooth transition effect */
}
</style>

<template>
    <div>
    <div v-if="showSuccessPopup" class="rounded-md fade-in" :class="{ 'popup': true, 'success-popup': true, 'active': showSuccessPopup }">Item Added to Collection Popup</div>
    <div v-if="showErrorPopup" class="rounded-md fade-in" :class="{ 'popup': true, 'error-popup': true, 'active': showErrorPopup }">Error: Item Not Added to Collection Popup</div>
    <div v-if="showUpdatePopup" class="rounded-md fade-in" :class="{ 'popup': true, 'update-popup': true, 'active': showUpdatePopup }">Item Updated Popup</div>
  </div>
    <div class="titillium-web-regular text-light-text dark:text-dark-text relative m-auto top-7 max-lg:w-full w-1/2 center">
      <Combobox v-model="query" v-slot="{ open }">
        <div class="relative z-10">
          <div
            class="relative w-full cursor-default overflow-hidden rounded-lg bg-light-tertiary dark:bg-dark-secondary text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm"
          >
            <ComboboxInput
              class="mt-1 w-full border-none py-2 pl-3 pr-10 text-sm leading-5 placeholder-dark-secondary dark:placeholder-light-secondary border-solid border-2 rounded-md p-1 bg-light-tertiary dark:bg-dark-secondary"
              :displayValue="(game) => game.name"
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
          <div class="" v-show="open">
          <TransitionRoot
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ComboboxOptions
              class="absolute mt-1 max-h-96 w-full overflow-auto rounded-md bg-light-primary dark:bg-dark-primary py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
            >
            <div v-if="loading" class="text-light-text dark:text-dark-text h-80 flex flex-col items-center justify-center h-full">
                <pacman-loader color="#14FFEB"></pacman-loader>
                <p>Loading</p>
            </div>
            <div class="text-light-text dark:text-dark-text" v-else>
              <div
                    v-for="game in searchResults"
                    as="template"
                    :key="game?.id"
                    :value="game"
                    >
                    <li class="relative cursor-default select-none py-2 pl-10 pr-4">
                        <span class="block truncate text-xl">
                        <div class="grid grid-cols-2 justify-items-center place-items-center">
                          <div class="flex flex-col whitespace-normal max-sm:w-40 max-md:w-64 justify-self-start">
                              <p class="">{{ game?.name }}</p>
                              <p class="font-thin"><span class="">Release Date:</span> {{ new Date(game?.first_release_date * 1000).toLocaleDateString("en-US") }}</p>
                              <hr class="border border-light-secondary dark:border-dark-secondary" />
                              <p class="line-clamp-3">{{ game?.summary }}</p>
                              <hr class="border border-light-secondary dark:border-dark-secondary" />
                              <p class=""><span class="">Review Score:</span> {{ game.total_rating ? game.total_rating.toFixed(2) : "No Rating Found"}}</p>
                              <div v-if="store.signedIn">
                                <div class="flex flex-col w-full">
                                  <div class="flex text-center text-sm justify-center flex-wrap gap-2 my-2">
                                    <div
                                      class="cursor-pointer bg-light-secondary dark:bg-dark-secondary w-[100px] rounded-md"
                                      :class="{'status-selected': selectedSearchStatus[game.id] === 'playing'}"
                                      @click="handleSelectedSearchStatus(game.id, 'playing')"
                                    >
                                      Playing
                                    </div>
                                    <div
                                      class="cursor-pointer bg-light-secondary dark:bg-dark-secondary w-[100px] rounded-md"
                                      :class="{'status-selected': selectedSearchStatus[game.id] === 'completed'}"
                                      @click="handleSelectedSearchStatus(game.id, 'completed')"
                                    >
                                      Completed
                                    </div>
                                    <div
                                      class="cursor-pointer bg-light-secondary dark:bg-dark-secondary w-[100px] rounded-md"
                                      :class="{'status-selected': selectedSearchStatus[game.id] === 'backlog'}"
                                      @click="handleSelectedSearchStatus(game.id, 'backlog')"
                                    >
                                      Backlog
                                    </div>
                                    <div
                                      class="cursor-pointer bg-light-secondary dark:bg-dark-secondary w-[100px] rounded-md"
                                      :class="{'status-selected': selectedSearchStatus[game.id] === 'dropped'}"
                                      @click="handleSelectedSearchStatus(game.id, 'dropped')"
                                    >
                                      Dropped
                                    </div>
                                    <div
                                      class="cursor-pointer bg-light-secondary dark:bg-dark-secondary w-[100px] rounded-md"
                                      :class="{'status-selected': selectedSearchStatus[game.id] === 'never-played'}"
                                      @click="handleSelectedSearchStatus(game.id, 'never-played')"
                                    >
                                      Never Played
                                    </div>
                                  </div>
                                  <button
                                @click="handleAddToCollection(game.id, game.name, selectedSearchStatus[game.id], game?.first_release_date, game.total_rating, game.platforms, store.uid)"
                                class="shadow-md py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:scale-105 transition-all duration-500 cursor-pointer border-solid border-2 border-light-accent dark:border-dark-accent m-2 bg-light-accent dark:bg-dark-accent text-light-textcontrast dark:text-dark-secondary block"
                              >
                                Add to Collection
                              </button>
                                </div>
                              <div v-if="game.isInCollection" :class="{ 'text-green-500 font-semibold': game.isInCollection }">
                                In Collection
                              </div>
                          </div>
                        </div>
                          <div>
                            <router-link :to="'/game/' + game.id"><img class="rounded-md max-h-80 place-self-auto" :src="game?.artType?.data?.length > 0 ? game?.artType.data[0].url : 'https://res.cloudinary.com/ddv5jvvvg/image/upload/v1699694058/no_cover_img_t5agly.jpg'"/></router-link>
                          </div>
                        </div>
                        </span>
                    </li>
                    <hr class="border border-light-secondary dark:border-dark-secondary"/>
                    </div>
                  </div>
            </ComboboxOptions>
          </TransitionRoot>
        </div>
        </div>
      </Combobox>
    </div>
    <div v-if="store.signedIn">
    <div class="flex md:flex-row flex-col titillium-web-regular">
      <div class="mt-24 w-1/2 w-full md:max-w-[300px]">
        <div class="flex flex-col justify-center items-center m-3">
          <label for="profileUrl" hidden>Steam Profile URL:</label>
          <input class="w-full placeholder:text-light-primary placeholder:dark:text-dark-textcontrast text-light-primary dark:text-dark-textcontrast rounded-md p-1 bg-light-tertiary dark:bg-dark-secondary m-2 block" id="profileUrl" placeholder="Enter Your Steam Profile Url..."/> <br>
          <button @click="importGames()" class="w-[162px] titillium-web-bold shadow-md p-2 rounded border-solid border-2 border-light-accent dark:border-dark-accent bg-light-accent dark:bg-dark-accent">Import Library</button>
        </div>
        <div v-if="isImporting" class="w-98% m-2 block">
          <div class="progress-bar dark:bg-dark-primary bg-light-secondary">
            <div id="progress" class="progress bg-dark-accent" :style="{ width: progressWidth }"></div>
          </div>
            <p class="titillium-web-light text-center dark:text-dark-text">Please remain on this page while the process is in progress.</p>
        </div>
        <div v-if="isFinishedImporting" class="w-98% m-2 block">
          <div class="progress-bar dark:bg-dark-primary bg-light-secondary">
            <div id="progress" class="progress bg-dark-accent text-center titillium-web-semibold" style="width: 100%">Importing Complete</div>
          </div>
        </div>
      <div class="sticky top-8 pt-20">
        <SortSearchFilter />
      </div>
      </div>
      <CollectionGrid :selectedStatus="selectedStatus" :view="store.view"/>
      <div class="absolute top-[10.75rem] right-1">
        <div v-if="!isSmallScreen" class="flex bg-light-primary dark:bg-dark-primary rounded-md">
          <div @click="isSmallScreen.value ? null : setView('grid')" class="rounded-l-md transition-all duration-500 cursor-pointer" :class="{ 'bg-light-secondary dark:bg-dark-secondary': store.view === 'grid'}">
            <svg width="35" height="35" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="9.96814" y="16.0603" width="37.1365" height="29.7092" rx="4" fill="#14FFEB"/>
            <rect x="52.8954" y="16.0603" width="37.1365" height="29.7092" rx="4" fill="#14FFEB"/>
            <rect x="52.8954" y="54.2305" width="37.1365" height="29.7092" rx="4" fill="#14FFEB"/>
            <rect x="9.96814" y="54.2305" width="37.1365" height="29.7092" rx="4" fill="#14FFEB"/>
            </svg>
          </div>
          <div @click="isSmallScreen.value ? null : setView('list')" class="rounded-r-md transition-all duration-500 cursor-pointer" :class="{ 'bg-light-secondary dark:bg-dark-secondary': store.view === 'list' }">
            <svg width="35" height="35" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="24.8838" y="14.0657" width="69.2179" height="13.9299" rx="4" fill="#14FFEB"/>
              <rect x="5.89832" y="14.0657" width="12.7661" height="13.9299" rx="4" fill="#14FFEB"/>
              <rect x="24.8838" y="33.3785" width="69.2179" height="13.9299" rx="4" fill="#14FFEB"/>
              <rect x="5.89832" y="33.3785" width="12.7661" height="13.9299" rx="4" fill="#14FFEB"/>
              <rect x="24.8838" y="52.6914" width="69.2179" height="13.9299" rx="4" fill="#14FFEB"/>
              <rect x="5.89832" y="52.6914" width="12.7661" height="13.9299" rx="4" fill="#14FFEB"/>
              <rect x="24.8838" y="72.0044" width="69.2179" height="13.9299" rx="4" fill="#14FFEB"/>
              <rect x="5.89832" y="72.0044" width="12.7661" height="13.9299" rx="4" fill="#14FFEB"/>
            </svg>
          </div>
          </div>
      </div>
    </div>
  </div>
  <div v-else>
    <h1 class="titillium-web-bold text-light-text dark:text-dark-text text-4xl text-center mt-16">Hey!</h1>
    <p class="titillium-web-semibold text-light-text dark:text-dark-text text-xl text-center mt-2">You're not signed in! 
      <router-link to="/login"><span class="underline text-light-accent dark:text-dark-accent hover:text-light-primary dark:hover:text-dark-primary">Log in</span></router-link>, or 
      <router-link to="/signup"><span class="underline text-light-accent dark:text-dark-accent hover:text-light-primary dark:hover:text-dark-primary">create an account</span></router-link>
      to start adding games to your collection!</p>
  </div>
    </template>
  
  <script setup>
  import { handleAddToCollection, handleUpdate } from '../utils/utils'
  import { onMounted, ref, watchEffect, watch  } from 'vue'
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
  import SortSearchFilter from '../components/SortSearchFilter.vue'

  const uid = ref(null);
  const selectedSearchStatus = ref({});
  const isImporting = ref(false);
  const isFinishedImporting = ref(false);
  const progressWidth = ref('5%');
  const isSmallScreen = ref(window.innerWidth < 1071);

const updateScreenWidth = () => {
  isSmallScreen.value = window.innerWidth < 1071;
};

  const handleSelectedSearchStatus = (gameId, status) => {
    selectedSearchStatus.value = { ...selectedSearchStatus.value, [gameId]: status };
    //console.log(selectedSearchStatus.value)
  };

  const setView = (val) => {
    store.view = val;
    localStorage.setItem('view', val);
};
  
watchEffect(() => {
  uid.value = store.uid;
  // Now you can use uid.value in your component
});

watch(isSmallScreen, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    setView('grid'); // Automatically set to grid view on small screens
  }
}, { immediate: true });

onMounted(() => {
  window.addEventListener('resize', updateScreenWidth);
});

onMounted(() => {
  uid.value = store.uid
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
  searchResults = ref([]);
  debounce(() => {
    loading.value = true
    const queryValue = query.value; // Get the user's query
    const searchLimit = 5
    // Make a request to the IGDB API
    fetch(`https://us-central1-video-game-collection-tracker.cloudfunctions.net/getGameData?query=${queryValue}&limit=${searchLimit}`)
      .then((response) => response.json())
      .then(async (gameData) => {
        console.log(gameData)
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

const checkIsInCollection = async (gameId) => {
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

const importGames = async () => {

  // Check if an import process is already ongoing
  if (isImporting.value) {
    console.log('An import process is already in progress.');
    return;
  }

  isFinishedImporting.value = false;
  isImporting.value = true;

  // Reset progress bar
  progressWidth.value = '5%';

  // Get the value from the input box
  const profileUrlInput = document.getElementById("profileUrl");
  const profileUrl = profileUrlInput.value;

  let userSlug;

  // Remove trailing slashes
  const normalizedUrl = profileUrl.replace(/\/+$/, '');

  // Split the URL by slashes and remove empty segments
  const urlParts = normalizedUrl.split('/').filter(part => part.trim() !== '');

  // Check if the last segment is a username or user slug
  if (urlParts.length > 0) {
    userSlug = urlParts[urlParts.length - 1];
  }

  try {
    // Fetch user's game library
    const response = await fetch(`https://us-central1-video-game-collection-tracker.cloudfunctions.net/steamLibraryImport?query=${userSlug}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    const steamLibraryData = await response.json();
    console.log("Steam Library Data: ", steamLibraryData)

    // Check if the 'games' array exists in the response
    if (steamLibraryData && steamLibraryData.games && Array.isArray(steamLibraryData.games)) {
      // Calculate total number of games to import
      const totalGames = steamLibraryData.games.length;
      let gamesProcessed = 0;

      // Iterate through games to import
      for (const game of steamLibraryData.games) {
        // Fetch game details
        await fetchGameDetails(game, game.appid);
        
        // Update progress based on the fraction of games processed
        gamesProcessed++;
        const progressPercentage = Math.floor((gamesProcessed / totalGames) * 100);
        progressWidth.value = `${Math.max(progressPercentage, 5)}%`;
      }

      // Set progress to 100%
      progressWidth.value = '100%';
    } else {
      console.error('Invalid or missing "games" array in the server response');
    }
  } catch (error) {
    console.error('Error:', error.message);
    // Handle errors, e.g., show an error message to the user
  } finally {
    // Reset the flag to indicate that the import process has finished
    isImporting.value = false;
    isFinishedImporting.value = true;
  }
};

// Function to fetch additional details for a single game
const fetchGameDetails = async (game, steamAppId) => {
  try {
    // Modify the URL and parameters based on your endpoint
    const response = await fetch(`https://us-central1-video-game-collection-tracker.cloudfunctions.net/getGameData?query=${game.name}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch details for ${game.name}`);
    }

    const gameDetails = await response.json();
    console.log(`Details for ${game.name}:`, gameDetails);
    handleAddToCollection(
      gameDetails[0].id,
      gameDetails[0].name,
      undefined,
      gameDetails[0].first_release_date,
      gameDetails[0].total_rating,
      gameDetails[0].platforms,
      store.uid,
      steamAppId 
    );
    handleUpdate(gameDetails[0].id, {abbreviation: "PC", id: 6, name: "PC (Microsoft Windows)"}, store.uid )
  } catch (error) {
    console.error(`Error fetching details for ${game.name}:`, error.message);
    // Handle errors, e.g., log the error or show an error message to the user
  }
};

  </script>