
<template>
    <div class="fixed top-16 w-72">
      <Combobox v-model="query">
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
          <TransitionRoot
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ComboboxOptions
              class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
            >
              <!-- <div
                v-if="filteredPeople.length === 0 && query !== ''"
                class="relative cursor-default select-none py-2 px-4 text-gray-700"
              >
                Nothing found.
              </div> -->
  
              <ComboboxOption
                    v-for="game in searchResults"
                    as="template"
                    :key="game.id"
                    :value="game"
                    v-slot="{ selected, active }"
                    >
                    <li
                        class="relative cursor-default select-none py-2 pl-10 pr-4"
                        :class="{
                        'bg-teal-600 text-white': active,
                        'text-gray-900': !active,
                        }"
                    >
                        <span
                        class="block truncate"
                        :class="{ 'font-medium': selected, 'font-normal': !selected }"
                        >
                        {{ game.name }}
                        <img :src="game.artType.data.length > 0 ? game.artType.data[0].url : ''"/>
                        
                        </span>
                        <span
                        v-if="selected"
                        class="absolute inset-y-0 left-0 flex items-center pl-3"
                        :class="{ 'text-white': active, 'text-teal-600': !active }"
                        >
                        <CheckIcon class="h-5 w-5" aria-hidden="true" />
                        </span>
                    </li>
                    </ComboboxOption>
            </ComboboxOptions>
          </TransitionRoot>
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

  const people = [
    { id: 1, name: 'Wade Cooper' },
    { id: 2, name: 'Arlene Mccoy' },
    { id: 3, name: 'Devon Webb' },
    { id: 4, name: 'Tom Cook' },
    { id: 5, name: 'Tanya Fox' },
    { id: 6, name: 'Hellen Schmidt' },
  ]

  let query = ref('')
  console.log(query.value)

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
    const queryValue = query.value; // Get the user's query
    // Make a request to the IGDB API
    fetch(`https://us-central1-video-game-collection-tracker.cloudfunctions.net/getGameData?query=${queryValue}`)
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
      });
  }, 500);
};
  </script>