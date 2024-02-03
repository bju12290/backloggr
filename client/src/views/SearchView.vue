<script setup>
// Future Improvements:
// - Sort and Filter Functionality
// - Autocomplete/Recommendations

import { ref, watchEffect } from 'vue'
import { searchGames, fetchGameImage, handleAddToCollection, handleRemove } from '../utils/utils';
import { store } from '../store'
import { getDatabase, ref as dbRef, onChildAdded, onChildRemoved, onChildChanged } from 'firebase/database';
import PacmanLoader from 'vue-spinner/src/PacmanLoader.vue'

const pacmanLoaderColor = store.theme === 'dark' ? "#2e6994" : "#6ba7d1"
const searchResults = ref([])
const searchQuery = ref('')
const isLoading = ref(false)
const loadingStep = ref('')
const noResults = ref(false)

const handleSearch = async () => {
    isLoading.value = true
    noResults.value = false
    loadingStep.value = "Searching for Games..."
    try {
        searchResults.value = await searchGames(searchQuery.value, 30);

        if (searchResults.value.length < 1) {
            noResults.value = true
        }

        loadingStep.value = "Fetching Game Covers..."

        // Use Promise.all to wait for all image fetches to complete
        await Promise.all(searchResults.value.map(async (result) => {
            result.image = await fetchGameImage(result.id, result.name);
        }));

        loadingStep.value = "Preparing Data for Display..."

        console.log(searchResults.value);
    } catch (error) {
        console.error('Error in handleSearch:', error);
        loadingStep.value = "An error occured! Please try again!"
    }
    isLoading.value = false
}


const uid = store.uid // Assume this is obtained from your authentication logic

    const setupRealtimeListeners = () => {
      const db = getDatabase();
      const collectionRef = dbRef(db, `data/users/${uid}/game_collection`);

      const addListener = onChildAdded(collectionRef, (snapshot) => {
        const gameId = snapshot.key;
        const gameData = snapshot.val();
        store.userData.game_collection[gameId] = gameData;
        // Any other logic needed after adding a game
      });

      const changeListener = onChildChanged(collectionRef, (snapshot) => {
        const gameId = snapshot.key;
        const gameData = snapshot.val();
        store.userData.game_collection[gameId] = gameData;
        // Logic after a game in the collection is updated
      });

      const removeListener = onChildRemoved(collectionRef, (snapshot) => {
        const gameId = snapshot.key;
        delete store.userData.game_collection[gameId];; // For Vue 3, you might directly delete the property as store is reactive
        // Additional logic after a game is removed
      });

      // Store these listeners if you need to remove them later
      return { addListener, changeListener, removeListener };
    };

    watchEffect(() => {
        const gameCollection = store.userData.game_collection;

        if (gameCollection && Object.keys(gameCollection).length > 0) {
            setupRealtimeListeners();
        }
        });

</script>

<template>
    <div class="roboto-regular text-light-text dark:text-dark-text" :class="{ 'dark': store.theme === 'dark' }">
        <div class="flex justify-center items-center">
            <div class="flex-col flex justify-center items-center w-full mt-16 m-4 mb-5">
                <label class="sr-only" for="search">Search Games</label>
                <input @keyup.enter="handleSearch" class="w-full md:w-3/4 roboto-light border-solid border-2 border-light-accent dark:border-dark-accent rounded-md p-1 bg-light-primary dark:bg-dark-primary m-2 block w-full" id="search" type="text" v-model="searchQuery"/>
                <button @click="handleSearch" class="w-full md:w-3/4 roboto-medium border-solid border-2 border-light-accent dark:border-dark-accent m-2 p-2 rounded-md bg-light-accent dark:bg-dark-accent text-light-text dark:text-dark-text block w-full">Search</button>
            </div>
        </div>

        {{ searchResults.value }}
        <div class="flex flex-col justify-center items-center" v-if="noResults">
            <p>No Games Found!</p>
        </div>
        <div class="flex flex-col justify-center items-center" v-if="isLoading">
            <p>{{ loadingStep }}</p>
            <pacman-loader :color="pacmanLoaderColor"></pacman-loader>
        </div>
        <div class="flex flex-col justify-center items-center" v-else>
        <div class="w-11/12 md:w-3/4 bg-opacity-75 shadow-md mx-24 m-4 p-3 rounded-xl border-solid border-2 border-light-accent dark:border-dark-accent bg-light-secondary dark:bg-dark-secondary" v-for="result in searchResults" :key="result.id">
            <div class="flex md:flex-row flex-col">

                <!-- Image Column -->
                <div class="flex justify-center items-center text-center w-1/8">
                    <router-link :to="'/game/' + result.id">
                        <img class="m-1 w-64" :src="result.image">
                    </router-link>
                </div>

                <!-- Information Column -->
                <div class="w-full p-3">
                    <router-link :to="'/game/' + result.id">
                        <p class="roboto-black">{{ result.name }}</p>
                    </router-link>

                    <!-- Platforms -->
                    <p class="roboto-medium">Release Date</p>
                    <p class="roboto-thin">{{ new Date(result.first_release_date * 1000).toLocaleDateString("en-US") }}</p>
                    <p class="roboto-medium">Review Score</p>
                    <p class="roboto-thin line-clamp-1">{{ result.total_rating ? result.total_rating?.toFixed(2) : "Review Score Not Found"}}</p>
                    <p class="roboto-medium">Platforms</p>
                    <div class="flex flex-wrap gap-2">
                        <div class="p-1 bg-light-accent dark:bg-dark-accent rounded-full border-solid border border-light-primary dark:border-dark-primary" v-for="platform in result.platforms">
                            <p class="roboto-light text-xs text-center p-1">{{ platform?.abbreviation?.length > 0? platform.abbreviation : platform.name }}</p>
                        </div>
                    </div>
                    <p class="roboto-medium">Summary</p>
                    <p class="roboto-light line-clamp-3">{{ result.summary }}</p>
                    
                </div>
            </div>
            <!-- Collection Buttons -->
            <div class="flex justify-center text-center" v-if="store.signedIn">
                <div class="flex justify-center md:justify-start" v-if="store.userData?.game_collection[result.id]">
                    <button class="roboto-light mt-5 shadow-md p-2 rounded-xl border-solid border-2 border-light-accent dark:border-dark-accent bg-light-accent dark:bg-dark-accent" @click="handleRemove(result.id, store.uid)"
                    @keyup.enter="handleRemove(result.id, store.uid)">Remove from Collection</button>
                </div>
                <div class="flex justify-center md:justify-start" v-else>
                    <button class="flex roboto-light mt-5 shadow-md p-2 rounded-xl border-solid border-2 border-light-accent dark:border-dark-accent bg-light-accent dark:bg-dark-accent" @keyup.enter="handleRemove(result.id, store.uid)" @click="handleAddToCollection(result.id, result.name, undefined , result.first_release_date, result.total_rating, result.platforms, store.uid )">Add to Collection</button>
                </div>
            </div>
        </div>
    </div>
</div>
</template>