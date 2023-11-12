<!-- 
  
  TODO: 
    - Add Loading Animation for Search Bar :check:
    - Add Status Functionality to Search Bar 
    - Add Functionality to Add Collection Item to Database
    - Add Collection Items Underneath Search Bar
    - Add Ability to Change Game Status Under Each Game
    - Add Ability to Remove Game From Collection
    - Add Ability to Select Platform
    - Add "Get Collection Link" So Users Can Share Collection With Friends

-->

<template>
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
            <div v-if="loading" class="flex flex-col items-center justify-center h-full">
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
                    <li
                        class="relative cursor-default select-none py-2 pl-10 pr-4"
                        :class="{
                        'bg-teal-600 text-white': active,
                        'text-gray-900': !active,
                        }"
                    >
                        <span
                        class="block truncate text-xl"
                        :class="{ 'font-bold': selected, 'font-semibold': !selected }"
                        >
                        <div class="grid grid-cols-2 justify-items-center place-items-center">
                          <div class="flex flex-col whitespace-normal max-sm:w-40 max-md:w-64 justify-self-start">
                              <p>{{ game?.name }}</p>
                              <p class="font-thin">{{ new Date(game?.first_release_date * 1000).toLocaleDateString("en-US") }}</p>
                              <hr />
                              <p class="font-thin line-clamp-3">{{ game?.summary }}</p>
                              <hr />
                              <p class="font-thin">Review Score: <span class="font-medium">{{ game.total_rating ? game.total_rating.toFixed(2) : "No Rating Found"}}</span></p>
                              <form class="font-thin text-sm tracking-tight flex gap-2 flex-wrap place-content-center mt-5 ms-1">
                                <input id="playing" name="status" value="playing" type="radio" :checked="selectedStatus === 'playing'" @change="handleRadioChange('playing')"/>
                                <label for="playing">Playing</label>
                                
                                <input id="completed" name="status" value="completed" type="radio" :checked="selectedStatus === 'completed'" @change="handleRadioChange('completed')"/>
                                <label for="completed">Completed</label>
                                
                                <input id="backlog" name="status" value="backlog" type="radio" :checked="selectedStatus === 'backlog'" @change="handleRadioChange('backlog')"/>
                                <label for="backlog">Backlog</label>
                                
                                <div class="flex gap-2">
                                  <input id="dropped" name="status" value="dropped" type="radio" :checked="selectedStatus === 'dropped'" @change="handleRadioChange('dropped')"/>
                                  <label for="dropped">Dropped</label>
                                </div>
                              </form>
                              <button @click="handleAddToCollection(game.id, game.name, selectedStatus)" class="text-cyan-900 bg-emerald-300 hover:bg-emerald-500 focus:ring-4 focus:ring-emerald-700 font-medium rounded-lg text-sm px-5 py-2.5 ms-1 mt-2 mb-2">Add to Collection</button>
                          </div>
                          <div>
                            <img class="max-h-60 place-self-auto" :src="game?.artType?.data?.length > 0 ? game?.artType.data[0].url : 'https://res.cloudinary.com/ddv5jvvvg/image/upload/v1699694058/no_cover_img_t5agly.jpg'"/>
                          </div>
                        </div>
                        </span>
                        <span
                        v-if="selected"
                        class="absolute inset-y-0 left-0 flex items-center pl-3"
                        :class="{ 'text-white': active, 'text-teal-600': !active }"
                        >
                        <CheckIcon class="h-5 w-5" aria-hidden="true" />
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
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import {
    Combobox,
    ComboboxInput,
    ComboboxButton,
    ComboboxOptions,
    ComboboxOption,
    TransitionRoot,
  } from '@headlessui/vue'
  import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'
  import PacmanLoader from 'vue-spinner/src/PacmanLoader.vue'
  import { getDatabase, ref as dbRef, set, get } from "firebase/database";
  import { store } from '../store'

  const loading = ref(false)

  const selectedStatus = ref('');

  const handleRadioChange = (value) => {
    selectedStatus.value = value;
  };

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
        console.log(searchResults.value);
      })
      .catch((error) => {
        console.error('Error fetching game data:', error);
      })
      .finally(() => {
        loading.value = false
      });
  }, 500);
};

const uid = store.uid
console.log(uid)

const handleAddToCollection = (gameId, gameName, gameStatus) => {
  const db = getDatabase()
  console.log(uid)
  set(dbRef(db, 'data/users/' + uid + `/game_collection/${gameId}`), {
                game_name: gameName,
                game_status: gameStatus
  });
}
  </script>