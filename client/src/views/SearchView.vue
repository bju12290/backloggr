<script setup>
// Future Improvements:
// - Sort and Filter Functionality
// - Autocomplete/Recommendations

import { ref, watchEffect } from 'vue'
import { searchGames, fetchGameImage, handleAddToCollection, handleRemove } from '../utils/utils';
import { store } from '../store'
import { getDatabase, ref as dbRef, onChildAdded, onChildRemoved, onChildChanged } from 'firebase/database';
import PacmanLoader from 'vue-spinner/src/PacmanLoader.vue'

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

    const setupRealtimeListeners = () => {
      const db = getDatabase();
      const collectionRef = dbRef(db, `data/users/${store.uid}/game_collection`);

      const addListener = onChildAdded(collectionRef, (snapshot) => {
        const gameId = snapshot.key;
        const gameData = snapshot.val();
        store.userData.game_collection[gameId] = gameData;
      });

      const changeListener = onChildChanged(collectionRef, (snapshot) => {
        const gameId = snapshot.key;
        const gameData = snapshot.val();
        store.userData.game_collection[gameId] = gameData;
      });

      const removeListener = onChildRemoved(collectionRef, (snapshot) => {
        const gameId = snapshot.key;
        delete store.userData.game_collection[gameId];
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
    <div class="titillium-web-regular text-light-text dark:text-dark-text" :class="{ 'dark': store.theme === 'dark' }">
        <div class="flex justify-center items-center">
            <div class="flex-col flex justify-center items-center w-full mt-16 m-4 mb-5">
                <label class="sr-only" for="search">Search Games</label>
                <input placeholder="Search for a game..." @keyup.enter="handleSearch" class="shadow-md placeholder:text-light-textcontrast dark:placeholder:text-dark-textcontrast w-full md:w-3/4  rounded-md p-1 bg-light-secondary dark:bg-dark-secondary m-2 block" id="search" type="text" v-model="searchQuery"/>
                <button @click="handleSearch" class="shadow-md w-full md:w-1/4 border-solid border-2 border-light-accent dark:border-dark-accent m-2 p-2 rounded-md bg-light-accent dark:bg-dark-accent titillium-web-bold block text-dark-primary text-md">Search</button>
            </div>
        </div>

        {{ searchResults.value }}
        <div class="flex flex-col justify-center items-center" v-if="noResults">
            <p>No Games Found!</p>
        </div>
        <div class="flex flex-col justify-center items-center" v-if="isLoading">
            <p>{{ loadingStep }}</p>
            <pacman-loader color="#14FFEB"></pacman-loader>
        </div>
        <div class="flex flex-col justify-center items-center" v-else>
        <div class="titillium-web-regular w-11/12 md:w-3/4 bg-opacity-75 shadow-md mx-24 m-4 p-3 rounded-md bg-light-secondary dark:bg-dark-secondary" v-for="result in searchResults" :key="result.id">
            <div class="flex md:flex-row flex-col md:h-full">

                <!-- Image Column -->
                <div class="flex justify-center items-center text-center w-1/8">
                    <router-link :to="'/game/' + result.id">
                        <img class="hover:scale-105 transition-all duration-500 cursor-pointer m-1 w-64" :src="result.image">
                    </router-link>
                </div>

                <!-- Information Column -->
                <div class="w-full p-3">
                    <router-link :to="'/game/' + result.id">
                        <p class="text-2xl titillium-web-semibold">{{ result.name }}</p>
                    </router-link>

                    <!-- Platforms -->
                    <p class="titillium-web-semibold">Release Date</p>
                    <p class="titillium-web-light">{{ new Date(result.first_release_date * 1000).toLocaleDateString("en-US") }}</p>
                    <p class="titillium-web-semibold">Review Score</p>
                    <p class="titillium-web-light line-clamp-1">{{ result.total_rating ? result.total_rating?.toFixed(2) : "Review Score Not Found"}}</p>
                    <p class="titillium-web-semibold">Platforms</p>
                    <div class="flex flex-wrap gap-2">
                        <div class="w-[145px] shadow-md titillium-web-semibold p-1 bg-light-accent dark:bg-dark-accent rounded text-dark-primary" v-for="platform in result.platforms">
                            <p class="text-xs text-center p-1">{{ platform?.abbreviation?.length > 0? platform.abbreviation : platform.name }}</p>
                        </div>
                    </div>
                    <p class="titillium-web-semibold">Summary</p>
                    <p class="titillium-web-light line-clamp-3">{{ result.summary }}</p>
                    
                </div>
            </div>
            <!-- Collection Buttons -->
            <div class="flex justify-center text-center" v-if="store.signedIn">
                <div class="flex justify-center md:justify-start" v-if="store.userData?.game_collection[result.id]">
                    <button class="titillium-web-semibold text-dark-primary hover:scale-105 transition-all duration-500 cursor-pointer mt-5 shadow-md p-2 rounded bg-light-accent dark:bg-dark-accent" @click="handleRemove(result.id, store.uid)"
                    @keyup.enter="handleRemove(result.id, store.uid)">Remove from Collection</button>
                </div>
                <div class="flex justify-center md:justify-start" v-else>
                    <button 
                    class="titillium-web-semibold text-dark-primary hover:scale-105 transition-all duration-500 cursor-pointer flex mt-5 shadow-md p-2 rounded bg-light-accent dark:bg-dark-accent" 
                        @keyup.enter="handleAddToCollection(result.id, result.name, undefined , result.first_release_date, result.total_rating, result.platforms, store.uid )" @click="handleAddToCollection(result.id, result.name, undefined , result.first_release_date, result.total_rating, result.platforms, store.uid )">
                    Add to Collection
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
</template>