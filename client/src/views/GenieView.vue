<template>
    <div v-if="store.signedIn" class="p-4 text-light-text dark:text-dark-text titillium-web-regular">
      <div v-if="!isCollectionLoaded" class="flex flex-col justify-center text-center">
        <p class="block text-2xl titillium-web-semibold mt-5 bouncing-text">
          <span v-for="(char, index) in scanningText" :key="index" :class="{ 'bouncing': activeIndex === index }">{{ char === ' ' ? '\u00A0' : char }}</span>
        </p>
        <div class="w-full mt-4 px-4 flex flex-col justify-center items-center">
          <div class="progress-bar dark:bg-dark-primary bg-light-secondary w-[60%] h-4 rounded">
            <div class="progress bg-dark-accent h-4 rounded" :style="{ width: progressWidth }"></div>
          </div>
          <p class="titillium-web-light text-center dark:text-dark-text mt-2">Please remain on this page while the process is in progress, first scans might take longer!</p>
        </div>
      </div>
      <form v-else @submit.prevent="selectGame" class="space-y-4">
        <div>
          <label for="platform" class="block text-sm titillium-web-semibold">Platform</label>
          <select id="platform" v-model="preferences.platform" class="text-dark-primary mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <option value="">Select a platform</option>
            <option v-for="platform in uniquePlatforms" :key="platform">{{ platform }}</option>
          </select>
        </div>
        <div>
          <label for="genre" class="block text-sm titillium-web-semibold">Genre</label>
          <select id="genre" v-model="preferences.genre" class="text-dark-primary mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <option value="">Select a genre</option>
            <option v-for="genre in uniqueGenres" :key="genre">{{ genre }}</option>
          </select>
        </div>
        <div>
          <label for="status" class="block text-sm titillium-web-semibold">Status in Collection</label>
          <select id="status" v-model="preferences.status" class="text-dark-primary mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <option value="">Select status</option>
            <option v-for="status in uniqueStatuses" :key="status">{{ status }}</option>
          </select>
        </div>
        <div class="flex justify-center">
          <button type="submit" class="hover:scale-105 transition-all duration-500 cursor-pointer mx-auto w-full md:w-1/2 mt-5 shadow-md py-2 px-4 rounded focus:outline-none focus:shadow-outline border-solid border-2 border-light-accent dark:border-dark-accent bg-light-accent dark:bg-dark-accent dark:text-dark-primary titillium-web-semibold">Recommend a Game</button>
        </div>
      </form>
      <div v-if="isLoadingImage" class="mt-4 p-4 min-h-[652px]">
        <clip-loader color="#14FFEB" size="90px"></clip-loader>
      </div>
      <div v-else class="flex justify-center">
      <div v-if="!recommendedGame" class="w-full absolute mt-5">
        <p class="text-xl text-center">{{ errorMessage }}</p>
      </div>
      <div ref="recommendedGameDiv" :class="recommendedGame ? 'visible' : 'invisible'" class="min-h-[652px] lg:w-1/3 md:w-1/2 w-full mt-4 p-4 border rounded flex flex-col items-center bg-light-primary dark:bg-dark-primary opacity-95">
        <p class="text-xl text-center">{{ recommendationText }}</p>
        <img class="max-w-[300px]" :src="recommendedGameImageUrl ? recommendedGameImageUrl : 'https://res.cloudinary.com/ddv5jvvvg/image/upload/v1719104953/no_cover_img_t5agly_c_crop_w_821_tlxlxx.jpg'"/>
        <p class="text-3xl titillium-web-bold text-center">{{ recommendedGame ? recommendedGame.game_name : ''}}</p>
        <button @click="ignoreGame(recommendedGame.game_name)" class="mt-2 px-4 py-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">{{ ignoreButtonText }}</button>
      </div>
      </div>
    </div>
    <div v-else>
      <h1 class="titillium-web-bold text-light-text dark:text-dark-text text-4xl text-center pt-16">Hey!</h1>
    <p class="titillium-web-semibold text-light-text dark:text-dark-text text-xl text-center mt-2">You're not signed in! 
      <router-link to="/login"><span class="underline text-light-accent dark:text-dark-accent hover:text-light-primary dark:hover:text-dark-primary">Log in</span></router-link>, or 
      <router-link to="/signup"><span class="underline text-light-accent dark:text-dark-accent hover:text-light-primary dark:hover:text-dark-primary">create an account</span></router-link>
      to get game recommendations!</p>
    </div>
  </template>

<script setup>
// ### Overview

// - User Can Select Preferences: Platform, Genre, Status in Collection
// - User will be served a random game recommendation using one of the stat points or a combination of the stat points below
// - User can click "Give Me Something Else" on a game recommendation and it will be ignored for future runs of the Recommender until the page is refreshed.
// - After clicking ignore, another game will be served.

// #### If No Genre Selected:
// - Previous Filters + Game In Your Selection in Your Favorite Genre (Genre where user has the most games marked as played)
// 	- Example: Game w/ Highest IGDB Total Rating Score in Your Favorite Genre
// - Previous Filters + Game In Your Selection in Your Least Played Genre (Genre where user has the least games marked as played)

// #### If No Platform Selected:
// - Previous Filters + Game In Your Selection on Your Favorite Platform (Platform where user has the most games marked as played)
// - Previous Filters + Game In Your Selection on Your Least Played Platform (Platform where user has the least games marked as played)

// #### If No Status Selected:
// - Previous Filters + Game In Your Backlog
// - Previous Filters + Game You've Never Played
// - Previous Filters + Game You're Playing

// #### If Nothing Selected:
// - Random Combination of the Above Filters, Random Amount
// 	Example: Game w/ Highest Steam Review Score in Your Most Played Genre on Your Least Favorite Platform
// 	Example: Game w/ Shortest Playtime in Your Backlog

import { ref, computed, watchEffect , reactive, nextTick, onMounted } from 'vue';
import { getDatabase, ref as dbRef, get } from 'firebase/database';
import { store } from '../store.js';
import { fetchGameDetailsById, fetchGameImage } from '../utils/utils.js'
import ClipLoader from 'vue-spinner/src/ClipLoader.vue'

const preferences = ref({
  platform: '',
  genre: '',
  status: ''
});

const scanningText = ref('Scanning Your Collection...'.split(''));
const isCollectionLoaded = ref(false)
const activeIndex = ref(0);
const progress = ref(0);
const recommendedGame = ref(null);
const recommendedGameImageUrl = ref(null);
const recommendedGameDiv = ref(null);
const ignoredGames = ref([]);
const recommendationText = ref(null);
const isLoadingImage = ref(false);
const ignoreButtonText = ref('Nope')
const mergedGameDetails = reactive({});
const appliedFilters = ref([]);
const selectFunction = ref()
const selectedFunction = ref('');
const errorMessage = ref ('')
const RATE_LIMIT_DELAY = 275;

const progressWidth = computed(() => `${Math.floor(progress.value)}%`);

const uniquePlatforms = computed(() => {
  const platforms = new Set();
  if (mergedGameDetails) {
    Object.values(mergedGameDetails).forEach(game => {
      if (game && game.platform) {
        platforms.add(game.platform.abbreviation);
      }
    });
  }
  return Array.from(platforms);
});

const uniqueGenres = computed(() => {
  const genres = new Set();
  if (mergedGameDetails) {
    Object.values(mergedGameDetails).forEach(game => {
      if (game.genres) {
        genres.add(game.genres[0].name); // Ensure 'genre' is a valid property
      }
    });
  }
  return Array.from(genres);
});

const uniqueStatuses = computed(() => {
  const statuses = new Set();
  if (mergedGameDetails) {
    Object.values(mergedGameDetails).forEach(game => {
      if (game) {
        let status = game.game_status;
        // Capitalize and replace dashes with spaces
        status = status.replace(/-/g, ' ').replace(/_/g, ' ')
                       .split(' ')
                       .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                       .join(' ');
        statuses.add(status);
      }
    });
  }
  return Array.from(statuses);
});

const filteredGames = computed(() => {
  const gamesArray = Object.values(mergedGameDetails);
  console.log("Games Array Before Filtering:", gamesArray);

  const filtered = gamesArray.filter(game => {
    const isIgnored = ignoredGames.value.includes(game.game_name);
    return !isIgnored &&
           (!preferences.value.platform || game.platform.abbreviation === preferences.value.platform) &&
           (!preferences.value.genre || game.genre === preferences.value.genre) &&
           (!preferences.value.status || game.game_status === preferences.value.status);
  });

  console.log("Filtered Games:", filtered);
  return filtered;
});

const gameSelectionFunctions = [
  fetchRandomGame,
  fetchHighestIGDBRatedGame,
  fetchMostIGDBRatedGame,
  fetchHighestExternallyRatedGame,
  fetchMostExternallyRatedGame,
  fetchMostHypedGame,
  fetchOldestGame,
  fetchNewestGame,
  fetchMostPlatformedGame,
  fetchShortestGame,
  fetchShortestFullCompletion,
  fetchLongestGame,
  fetchLongestFullCompletion
];

const ignoreButtonTextOptions = [
  'Nope',
  'No Thanks',
  '*Blow Raspberry*',
  'Try Again',
  `Not feelin' it`,
  'No Bueno',
  'Ehhhhh',
  'Give Me Another',
  'Do Better',
  'Nah',
  'Naw',
  'Nizz',
  'Heck No',
  'Is not possible',
  '._.'
]

const savedGameDetails = localStorage.getItem('mergedGameDetails');

if (savedGameDetails) {
  Object.assign(mergedGameDetails, JSON.parse(savedGameDetails));
}


function startBouncingText() {
  setInterval(() => {
    activeIndex.value = (activeIndex.value + 1) % scanningText.value.length;
  }, 250); // Change active letter every 200ms
}

onMounted(() => {
  startBouncingText();
});

onMounted(async () => {
    await updateGameDetails();
});

watchEffect(async () => {
  if (store.userData.game_collection) {
    await updateGameDetails();
  }
});

async function selectGame(count) {
  errorMessage.value = ''
  console.log("Filtered Games Before Selection Function:", filteredGames.value);

  console.log("RetryCount", count)

  if (!selectFunction.value || count === 0) {
    const randomIndex = Math.floor(Math.random() * gameSelectionFunctions.length);
    selectFunction.value = gameSelectionFunctions[randomIndex];
  }
  
  await selectFunction.value(); // Ensure the function is awaited
  console.log("Recommended Game After Selection Function:", recommendedGame.value, selectFunction.value);
}

function generateRecommendationMessage() {
  let message = 'We';


  if (appliedFilters.value.length === 1) {
    message+= ` applied the following filter: ${appliedFilters.value.join(', ')}; and `;
  }

  if (appliedFilters.value.length > 1) {
    message+= ` applied the following filters: ${appliedFilters.value.join(', ')}; and `;
  }

  if (selectedFunction.value) {
    message+= `${selectedFunction.value}`;
  }

  return message;
}

const MAX_RETRIES = 5;
let retryCount = 0

async function setRecommendedGame(game) {
  isLoadingImage.value = true;

  if (!game && retryCount < MAX_RETRIES) {
    // Check if a game was successfully set
    console.log(`Retrying... Attempt ${retryCount + 1}`);
    retryCount++
    recommendedGame.value = null
    recommendationText.value = ""
    setTimeout(() => selectGame(retryCount), 500); // Retry selecting a game with a delay
    return
  } else if (retryCount >= MAX_RETRIES) {
    recommendedGame.value = null;
    recommendationText.value = ""
    errorMessage.value = "No Games Found With the Following Filters, Please Try Again!"
    isLoadingImage.value = false;
    retryCount = 0
    return
  }
   if (game) {
    recommendedGame.value = game;
    recommendationText.value = generateRecommendationMessage();
    recommendedGameImageUrl.value = await fetchGameImage(game.id, game.game_name).finally(() => {
    isLoadingImage.value = false;
  });
  }
  
  console.log(game);
  console.log(filteredGames);
  retryCount = 0

  nextTick(() => {
    if (recommendedGameDiv.value) {
      const elementTop = recommendedGameDiv.value.getBoundingClientRect().top;
      const idealOffset = 50; // Adjust this value as needed for your UI, e.g., to account for fixed headers.

      // Calculate the absolute position of the element top relative to the document
      const absoluteElementTop = window.pageYOffset + elementTop - idealOffset;

      // Perform the scroll
      window.scrollTo({
        top: absoluteElementTop,
        behavior: 'smooth'
      });
    }
  });
}

// When calculating totals for genre, status, and platform we need to use the store, not the filtered games.

//When applyCommonFilters retries, random filters are re-applied, thus causing issues with the 

function applyCommonFilters(games) {
  if (!games) {
    console.log("No games to filter in applyCommonFilters");
    return [];
  }

  const formattedStatus = preferences.value.status.toLowerCase().replace(" ", "-")
  console.log(formattedStatus)

  let filteredGames = games.filter(game => {
    return ((!preferences.value.platform || preferences.value.platform === "" )|| game.platform.abbreviation === preferences.value.platform) &&
           ((!preferences.value.genre || preferences.value.genre === "") || game.genre === preferences.value.genre) &&
           ((!preferences.value.status || preferences.value.status === "") || game.game_status === formattedStatus);
  });

  filteredGames = filteredGames.filter(game => !ignoredGames.value.includes(game.game_name));

  console.log("Filtered Games Before Random Filters:", filteredGames);

  return applyRandomFilters(filteredGames);
}

function applyRandomFilters(games) {
  if (!games) {
    console.log("No games to filter");
    return [];
  }

  const genreFilters = [];
  const platformFilters = [];
  const statusFilters = [];
  appliedFilters.value = [];

  // Add filter functions based on the preferences
  if (!preferences.value.genre || preferences.value.genre === "") {
    genreFilters.push({
      filter: games => games.filter(game => (game.genres?.[0]?.name ?? null) === getFavoriteGenre(games)),
      message: 'Favorite Genre'
    });
    genreFilters.push({
      filter: games => games.filter(game => (game.genres?.[0]?.name ?? null) === getLeastPlayedGenre(games)),
      message: 'Least Played Genre'
    });
  }
  if (!preferences.value.platform || preferences.value.platform === "") {
    platformFilters.push({
      filter: games => games.filter(game => game.platform.abbreviation === getFavoritePlatform(games)),
      message: 'Favorite Platform'
    });
    platformFilters.push({
      filter: games => games.filter(game => game.platform.abbreviation === getLeastPlayedPlatform(games)),
      message: 'Least Played Platform'
    });
  }
  if (!preferences.value.status || preferences.value.status === "") {
    statusFilters.push({
      filter: games => getStatusFilter('backlog'),
      message: 'Backlog'
    });
    statusFilters.push({
      filter: games => getStatusFilter('never-played'),
      message: 'Never Played'
    });
    statusFilters.push({
      filter: games => getStatusFilter('playing'),
      message: 'Playing'
    });
  }

  // Randomly select one filter from each category
  const selectedGenreFilter = genreFilters.length ? genreFilters[Math.floor(Math.random() * genreFilters.length)] : null;
  console.log("Genre Filter", selectedGenreFilter)
  const selectedPlatformFilter = platformFilters.length ? platformFilters[Math.floor(Math.random() * platformFilters.length)] : null;
  console.log("Platform Filter", selectedPlatformFilter)
  const selectedStatusFilter = statusFilters.length ? statusFilters[Math.floor(Math.random() * statusFilters.length)] : null;
  console.log("Status Filter", selectedStatusFilter)

  const selectedFilters = [selectedGenreFilter, selectedPlatformFilter, selectedStatusFilter].filter(Boolean);

  // Randomly determine how many filters to apply (0 to possibleFilters.length)
  const numberOfFiltersToApply = Math.floor(Math.random() * (selectedFilters.length + 1));
  
  // Shuffle and select a subset of filters to apply
  const appliedFiltersSet = selectedFilters.sort(() => 0.5 - Math.random()).slice(0, numberOfFiltersToApply);

  console.log("Applied Filters Set:", appliedFiltersSet)

  // Apply the selected filters
  let filteredGames = games;
  console.log("Filtered Games Before Applying Random Filters", filteredGames)
  appliedFiltersSet.forEach(({ filter, message }) => {
    console.log("Applying Filter:", filter);
    filteredGames = filter(filteredGames);
    console.log("Filter Message", message)
    appliedFilters.value.push(message);
    console.log("Filtered Games After Applying Filter:", filteredGames, appliedFilters);
  });

  filteredGames = filteredGames.filter(game => !ignoredGames.value.includes(game.game_name));

  recommendationText.value = generateRecommendationMessage();

  return filteredGames;
}

// - Truly random game in Your Selection
async function fetchRandomGame() {
    const games = filteredGames.value;
    if (games.length) {
        const randomIndex = Math.floor(Math.random() * games.length);
        const selectedGame = games[randomIndex];
        selectedFunction.value = ' randomly picked this game for you to try out!';
        await setRecommendedGame(selectedGame);
    } else {
        await setRecommendedGame(null, 'Your filters might be too strict, we were unable to find any matching games!');
    }
}

// - Game w/ Highest IGDB Total Rating Score in Your Selection
async function fetchHighestIGDBRatedGame() {
  const games = applyCommonFilters(Object.values(mergedGameDetails))
    .filter(game => game.rating_count !== undefined)
    .sort((a, b) => b.rating_count - a.rating_count);

  if (games.length) {
    const selectedGame = games[0];
    selectedFunction.value = ' picked the game with the Highest IGDB User Rating!';
    await setRecommendedGame(selectedGame);
  } else {
    await setRecommendedGame(null, 'Your filters might be too strict, we were unable to find any matching games!');
  }
}

// - Game w/ Highest Number of IGDB Total Ratings in Your Selection
async function fetchMostIGDBRatedGame() {
  const games = applyCommonFilters(Object.values(mergedGameDetails))
    .filter(game => game.rating_count !== undefined) // Ensure the rating_count is available
    .sort((a, b) => b.rating_count - a.rating_count);

  if (games.length) {
    const selectedGame = games[0];
    selectedFunction.value = ' picked the game with the most ratings by IGDB users!';
    await setRecommendedGame(selectedGame);
  } else {
    await setRecommendedGame(null, 'No games found with this criterion.');
  }
}

// - Game w/ Highest Aggregated Rating from External Critics in Your Selection(IGDB API)
async function fetchHighestExternallyRatedGame() {
  const games = applyCommonFilters(Object.values(mergedGameDetails))
    .filter(game => game.aggregated_rating !== undefined) // Ensure the aggregated_rating is available
    .sort((a, b) => b.aggregated_rating - a.aggregated_rating);

  if (games.length) {
    const selectedGame = games[0];
    selectedFunction.value = ' picked the game with the highest review score by critics!';
    await setRecommendedGame(selectedGame);
  } else {
    await setRecommendedGame(null, 'No games found with this criterion.');
  }
}

// - Game w Highest Number of Ratings from External Critics in Your Selection(IGDB API)
async function fetchMostExternallyRatedGame() {
  const games = applyCommonFilters(Object.values(mergedGameDetails))
    .filter(game => game.aggregated_rating_count !== undefined) // Ensure the aggregated_rating_count is available
    .sort((a, b) => b.aggregated_rating_count - a.aggregated_rating_count);

  if (games.length) {
    const selectedGame = games[0];
    selectedFunction.value = ' picked the game with the most reviews by critics!';
    await setRecommendedGame(selectedGame);
  } else {
    await setRecommendedGame(null, 'No games found with this criterion.');
  }
}

// - Game w/ the most Hype Before Release in Your Selection in Your Selection(IGDB API)
async function fetchMostHypedGame() {
  const games = applyCommonFilters(Object.values(mergedGameDetails))
    .filter(game => game.hypes !== undefined) // Ensure the hypes is available
    .sort((a, b) => b.hypes - a.hypes);

  if (games.length) {
    const selectedGame = games[0];
    selectedFunction.value = ' picked the game with the most hype before release!';
    await setRecommendedGame(selectedGame);
  } else {
    await setRecommendedGame(null, 'No games found with this criterion.');
  }
}

// - Game w/ Oldest Release Date in Your Selection
// Oldest game
async function fetchOldestGame() {
  const games = applyCommonFilters(Object.values(mergedGameDetails))
    .filter(game => game.first_release_date !== undefined)
    .sort((a, b) => a.first_release_date - b.first_release_date);

  if (games.length) {
    const selectedGame = games[0];
    selectedFunction.value = ' picked the oldest game to release!';
    await setRecommendedGame(selectedGame);
  } else {
    await setRecommendedGame(null, 'No games found with this criterion.');
  }
}

// Newest game
async function fetchNewestGame() {
  const games = applyCommonFilters(Object.values(mergedGameDetails))
    .filter(game => game.first_release_date !== undefined)
    .sort((a, b) => b.first_release_date - a.first_release_date);

  if (games.length) {
    const selectedGame = games[0];
    selectedFunction.value = ' picked the most recent release!';
    await setRecommendedGame(selectedGame);
  } else {
    await setRecommendedGame(null, 'No games found with this criterion.');
  }
}

// - Game Released on the Most Platforms in Your Selection
async function fetchMostPlatformedGame() {
  const games = filteredGames.value;

  // Check if there are any games to process
  if (games.length === 0) {
    await setRecommendedGame(null, 'No games available in your selection.');
    return;
  }

  // Sort games by the length of the platformIds array in descending order
  const sortedGames = games.sort((a, b) => b.platformIds.length - a.platformIds.length);
  
  // Find the maximum number of platforms any game is available on
  const maxPlatforms = sortedGames[0].platformIds.length;

  // Filter games that have this maximum number of platforms
  const mostPlatformedGames = sortedGames.filter(game => game.platformIds.length === maxPlatforms);

  // Randomly select one if there are multiple games with the same number of platforms
  const selectedGame = mostPlatformedGames[Math.floor(Math.random() * mostPlatformedGames.length)];

  selectedFunction.value = ' picked the game released on the most platforms!';
  await setRecommendedGame(selectedGame);
}

// - Game w/ Shortest Playtime in Your Selection
async function fetchShortestGame() {
  const games = applyCommonFilters(Object.values(mergedGameDetails))
    .filter(game => game.hltbData && game.hltbData.gameplayMain > 0) // Ensure playtime is greater than zero
    .sort((a, b) => a.hltbData.gameplayMain - b.hltbData.gameplayMain);

  if (games.length) {
    const selectedGame = games[0];
    selectedFunction.value = ' picked the game with the shortest main playtime!';
    await setRecommendedGame(selectedGame);
  } else {
    await setRecommendedGame(null, 'No games found with criteria.');
  }
}

// - Game w/ Shortest Time to 100% in Your Selection
async function fetchShortestFullCompletion() {
  const games = applyCommonFilters(Object.values(mergedGameDetails))
    .filter(game => game.hltbData && game.hltbData.gameplayCompletionist > 0) // Ensure playtime is greater than zero
    .sort((a, b) => a.hltbData.gameplayCompletionist - b.hltbData.gameplayCompletionist);

  if (games.length) {
    const selectedGame = games[0];
    selectedFunction.value = ' picked the game with the shortest full completion playtime!';
    await setRecommendedGame(selectedGame);
  } else {
    await setRecommendedGame(null, 'No games found with criteria.');
  }
}

// - Game w/ Longest Playtime in Your Selection
async function fetchLongestGame() {
  console.log("Attempting to fetch longest game")
  const games = applyCommonFilters(Object.values(mergedGameDetails))
    .filter(game => game.hltbData && game.hltbData.gameplayMain > 0) // Ensure playtime is greater than zero
    .sort((a, b) => b.hltbData.gameplayMain - a.hltbData.gameplayMain);

  if (games.length) {
    const selectedGame = games[0];
    selectedFunction.value = ' picked the game with the longest main playtime!';
    await setRecommendedGame(selectedGame);
  } else {
    await setRecommendedGame(null, 'No games found with criteria.');
  }
}

// - Game w/ Longest Time to 100% in Your Selection
async function fetchLongestFullCompletion() {
  const games = applyCommonFilters(Object.values(mergedGameDetails))
    .filter(game => game.hltbData && game.hltbData.gameplayCompletionist > 0) // Ensure playtime is greater than zero
    .sort((a, b) => b.hltbData.gameplayCompletionist - a.hltbData.gameplayCompletionist);

  if (games.length) {
    const selectedGame = games[0];
    selectedFunction.value = ' picked the game with the longest full completion playtime!';
    await setRecommendedGame(selectedGame);
  } else {
    await setRecommendedGame(null, 'No games found with criteria.');
  }
}

function getStatusFilter(status) {
  return applyCommonFilters(Object.values(mergedGameDetails)).filter(game => game.game_status === status);
}

function getFavoriteGenre() {
  console.log("Getting Favorite Genre")
  const genreCount = {};
  Object.values(mergedGameDetails).forEach(game => {
    if (game.genres) {
      if (game.genres[0].name && (game.game_status === 'playing' || game.game_status === 'completed')) {
        genreCount[game.genres[0].name] = (genreCount[game.genres[0].name] || 0) + 1;
      }
  }});
  return Object.keys(genreCount).reduce((a, b) => genreCount[a] > genreCount[b] ? a : b, null);
}

function getLeastPlayedGenre() {
  console.log("Getting Least Played Genre")
  const genreCount = {};
  Object.values(mergedGameDetails).forEach(game => {
    if (game.genres) {
      if (game.genres[0].name && (game.game_status === 'playing' || game.game_status === 'completed' || game.game_status === 'backlog' || game.game_status === 'never-played')) {
        genreCount[game.genres[0].name] = (genreCount[game.genres[0].name] || 0) + 1;
      }
  }});
  return Object.keys(genreCount).reduce((a, b) => genreCount[a] < genreCount[b] ? a : b, null);
}

function getFavoritePlatform() {
  console.log("Getting Favorite Platform")
  const platformCount = {};
  Object.values(mergedGameDetails).forEach(game => {
    if (game.platform && game.platform.abbreviation && (game.game_status === 'playing' || game.game_status === 'completed')) {
      platformCount[game.platform.abbreviation] = (platformCount[game.platform.abbreviation] || 0) + 1;
    }
  });
  return Object.keys(platformCount).reduce((a, b) => platformCount[a] > platformCount[b] ? a : b, null);
}

function getLeastPlayedPlatform() {
  console.log("Getting Leasted Played Platform")
  const platformCount = {};
  Object.values(mergedGameDetails).forEach(game => {
    if (game.platform && game.platform.abbreviation && (game.game_status === 'playing' || game.game_status === 'completed' || game.game_status === 'backlog' || game.game_status === 'never-played')) {
      platformCount[game.platform.abbreviation] = (platformCount[game.platform.abbreviation] || 0) + 1;
    }
  });
  return Object.keys(platformCount).reduce((a, b) => platformCount[a] < platformCount[b] ? a : b, null);
}

function ignoreGame(gameName) {
  if (!ignoredGames.value.includes(gameName)) {
    ignoredGames.value.push(gameName);
  }

  const randomIndex = Math.floor(Math.random() * ignoreButtonTextOptions.length);
  ignoreButtonText.value = ignoreButtonTextOptions[randomIndex]
  selectGame(); 
}

async function fetchFirebaseGameData() {
  const db = getDatabase();
  const gameRef = dbRef(db, `data/users/${store.uid}/game_collection`);
  
  try {
    const snapshot = await get(gameRef);
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log("No data available");
      return {};
    }
  } catch (error) {
    console.error("Failed to fetch game data from Firebase:", error);
    return {};
  }
}

function deepEqual(value1, value2) {
  if (typeof value1 !== 'object' || value1 === null || typeof value2 !== 'object' || value2 === null) {
    return value1 === value2;
  }

  const keys1 = Object.keys(value1);
  const keys2 = Object.keys(value2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(value1[key], value2[key])) {
      return false;
    }
  }

  return true;
}

function hasGameDetailsChanged(newData, existingData) {
  // Implement logic to compare relevant fields to detect changes
  const relevantFields = ['game_status', 'platform']; // Add any other relevant fields here

  for (const field of relevantFields) {
    if (!deepEqual(newData[field], existingData[field])) {
      return true;
    }
  }

  return false;
}

async function fetchAndMergeGameDetails(gameId, gameData) {
  try {
    await delay(RATE_LIMIT_DELAY);
    const details = await fetchGameDetailsById(gameId);
    let hltbData = {};

    if (gameData && gameData.game_name) {
      const hltbResults = await fetchHltbData(gameData.game_name);
      if (hltbResults.length > 0) {
        hltbData = hltbResults[0];
      }
    }

    mergedGameDetails[gameId] = { ...gameData, ...details, hltbData };
  } catch (error) {
    console.error(`Failed to fetch game details for ID ${gameId}:`, error);
    mergedGameDetails[gameId] = { ...gameData, error: true };
  }
}

async function updateGameDetails() {
  // Step 1: Fetch Latest Data from Firebase
  const latestFirebaseData = await fetchFirebaseGameData();

  // Step 2: Get mergedGameDetails from Local Storage
  const storedGameDetails = JSON.parse(localStorage.getItem('mergedGameDetails')) || {};
  Object.assign(mergedGameDetails, storedGameDetails);

  // Step 3: Compare Data
  const newGames = [];
  const updatedGames = [];
  const deletedGames = [];

  const gameIdsInFirebase = new Set(Object.keys(latestFirebaseData));
  const gameIdsInLocal = new Set(Object.keys(mergedGameDetails));

  for (const gameId of gameIdsInFirebase) {
    if (!gameIdsInLocal.has(gameId)) {
      newGames.push(gameId);
    } else if (hasGameDetailsChanged(latestFirebaseData[gameId], mergedGameDetails[gameId])) {
      updatedGames.push(gameId);
    }
  }

  for (const gameId of gameIdsInLocal) {
    if (!gameIdsInFirebase.has(gameId)) {
      deletedGames.push(gameId);
    }
  }

  const totalOperations = newGames.length + updatedGames.length + deletedGames.length;
  let completedOperations = 0;

  // Step 4: Fetch Details for New/Updated Games
  for (const gameId of newGames) {
    await fetchAndMergeGameDetails(gameId, latestFirebaseData[gameId]);
    completedOperations++;
    updateProgress(completedOperations, totalOperations);
  }

  for (const gameId of updatedGames) {
    await fetchAndMergeGameDetails(gameId, latestFirebaseData[gameId]);
    completedOperations++;
    updateProgress(completedOperations, totalOperations);
  }

  // Step 5: Remove Deleted Games
  for (const gameId of deletedGames) {
    delete mergedGameDetails[gameId];
    completedOperations++;
    updateProgress(completedOperations, totalOperations);
  }

  // Step 6: Save Updated Data to Local Storage
  localStorage.setItem('mergedGameDetails', JSON.stringify(mergedGameDetails));
  isCollectionLoaded.value = true;
}

function updateProgress(completedOperations, totalOperations) {
  progress.value = Math.min(100, Math.floor((completedOperations / totalOperations) * 100));
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchHltbData(gameName) {
    const encodedGameName = encodeURIComponent(gameName);
    const url = `https://us-central1-video-game-collection-tracker.cloudfunctions.net/searchHltb?searchTerm=${encodedGameName}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch HLTB data:", error);
        throw error;  // Re-throw to handle it in the calling function
    }
}
</script>

<style scoped>
.bouncing-text span {
  display: inline-block;
}

.bouncing {
  animation: bounce 0.6s cubic-bezier(0.25, 2, 0.5, 1) infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.progress {
  transition: width 0.4s ease;
}
</style>