<script setup> 
// Future Improvements
// - Similar Games Under Game Info

import { ref, onMounted, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { fetchGameDetailsById, fetchGameImage, fetchPlatforms, handleAddToCollection, handleRemove, handleUpdate } from '../utils/utils';
import { store } from '../store.js'
import { getDatabase, ref as dbRef, onChildAdded, onChildRemoved, onChildChanged } from 'firebase/database';
import PacmanLoader from 'vue-spinner/src/PacmanLoader.vue'
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination } from 'swiper/modules';
import NotificationPopup from '@/components/NotificationPopup.vue';
import 'swiper/css';
import 'swiper/css/pagination';


const modules = [Pagination]

const pacmanLoaderColor = store.theme === 'dark' ? "#2e6994" : "#6ba7d1"
const gameId = ref(null);
const gameDetails = ref({});
const gameImage = ref(null)
const platformDetails = ref(null)
const isLoading = ref(false)
const loadingStatus = ref('Getting Game Details...')

const route = useRoute();

onMounted(async () => {
  console.log(gameDetails)
  isLoading.value = true
  try {
    gameId.value = route.params.gameId;
    gameDetails.value = await fetchGameDetailsById(gameId.value);
    console.log(gameDetails.value);

    loadingStatus.value = "Fetching Cover Image..."

    // Now that you have gameDetails, you can use it to fetch the game image
    gameImage.value = await fetchGameImage(gameId.value, gameDetails.value.name);
    console.log(gameImage.value);

    isLoading.value = false
  } catch (error) {
    console.error('Failed to fetch game details:', error);
  }
});

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
  <notification-popup color="green" message="This is a success message!"></notification-popup>
  <div class="roboto-regular flex flex-col justify-center items-center" v-if="isLoading">
    <p class="mt-16 text-light-text dark:text-dark-text">{{ loadingStatus }}</p>
    <pacman-loader :color="pacmanLoaderColor"></pacman-loader>
  </div>
  <div class="flex justify-center items-center" v-else>
  <div class="mt-4 w-11/12 bg-opacity-75 shadow-md rounded-xl border-solid border-2 border-light-accent dark:border-dark-accent bg-light-secondary dark:bg-dark-secondary roboto-regular text-light-text dark:text-dark-text">
    <div class="flex md:flex-row flex-col">
      <div class="mt-4 p-3 min-w-96">
        <img class="md:min-w-[24rem]" :src="gameImage"/>
      </div>
      <div class="mt-4 p-3">
        <h1 class="montserrat-bold text-2xl">{{ gameDetails.name }}</h1>
        <p class="montserrat-medium mt-2">Review Score</p>
        <p class="roboto-thin">{{ gameDetails.total_rating?.toFixed(2) }}</p>
        <p class="montserrat-medium mt-2">Release Date</p>
        <p class="roboto-thin">{{ new Date(gameDetails.first_release_date * 1000).toLocaleDateString('en-US') }}</p>
        <p class="montserrat-medium mt-2">Genres</p>
        <div class="flex flex-wrap gap-2">
          <p class="text-xs roboto-light p-2 bg-light-accent dark:bg-dark-accent rounded-full border-solid border border-light-primary dark:border-dark-primary" v-for="genre in gameDetails.genres">{{ genre.name }}</p>
        </div>
        <p class="montserrat-medium mt-2">Themes</p>
        <div class="flex gap-2" >
          <p class="text-xs roboto-light p-2 bg-light-accent dark:bg-dark-accent rounded-full border-solid border border-light-primary dark:border-dark-primary" v-for="theme in gameDetails.themes">{{ theme.name }}</p>
        </div>
        <p class="montserrat-medium mt-2">Platforms</p>
        <div class="flex flex-wrap gap-2">
        <div class="p-1 bg-light-accent dark:bg-dark-accent rounded-full border-solid border border-light-primary dark:border-dark-primary" v-for="platform in gameDetails.platforms">
          <p class="roboto-light text-xs text-center p-1">{{ platform?.abbreviation?.length > 0? platform.abbreviation : platform.name }}</p>
        </div>
      </div>
      <p class="montserrat-medium mt-2">Summary</p>
      <p>{{ gameDetails.summary }}</p>
      <div v-if="store.signedIn">
    <div class="flex flex-col justify-center items-center gap-2" v-if="store.userData.game_collection[gameDetails.id]">
      <form @change="handleUpdate(gameDetails.id, store.userData.game_collection[gameDetails.id].game_status, store.uid)" class="font-thin text-sm tracking-tight flex gap-2 flex-wrap place-content-center mt-5 ms-1">

          <input
            :id="'playing-' + gameDetails.id"
            v-model="store.userData.game_collection[gameDetails.id].game_status"
            :name="'status-' + (gameDetails.id ? gameDetails.id : '')"
            value="playing"
            type="radio"
          />

          <label :for="'playing-' + gameDetails.id">Playing</label>

          <input 
            :id="'completed-' + gameDetails.id"
            v-model="store.userData.game_collection[gameDetails.id].game_status"
            :name="'status-' + (gameDetails.id ? gameDetails.id : '')" 
            value="completed" 
            type="radio" 
          />

          <label :for="'completed-' + gameDetails.id">Completed</label>

          <input 
            :id="'backlog-' + gameDetails.id"
            v-model="store.userData.game_collection[gameDetails.id].game_status"
            :name="'status-' + (gameDetails.id ? gameDetails.id : '')" 
            value="backlog" 
            type="radio" 
            />

          <label :for="'backlog-' + gameDetails.id">Backlog</label>

          <div class="flex gap-2">
            <input 
              :id="'dropped-' + gameDetails.id"
              v-model="store.userData.game_collection[gameDetails.id].game_status"
              :name="'status-' + (gameDetails.id ? gameDetails.id : '')" 
              value="dropped" 
              type="radio" 
            />

            <label :for="'dropped-' + gameDetails.id">Dropped</label>

            <input 
              :id="'never-played-' + gameDetails.id"
              v-model="store.userData.game_collection[gameDetails.id].game_status"
              :name="'status-' + (gameDetails.id ? gameDetails.id : '')" 
              value="never-played" 
              type="radio" 
            />

            <label :for="'dropped-' + gameDetails.id">Never Played</label>
          </div>
          </form>
      <form @change="handleUpdate(gameDetails.id, store.userData.game_collection[gameDetails.id].platform, store.uid)">
        <label class="montserrat-medium" for="platform">Playing On: </label>
          <select class="montserrat-regular w-48 p-1 border rounded bg-light-secondary dark:bg-dark-secondary" id="platform" name="platform" v-model="store.userData.game_collection[gameDetails.id].platform">
            <option disabled value="">
              {{ 
                Object.keys(gameDetails.platforms).length > 0
                  ? "Please Select a Platform"
                  : "Loading..."
              }}
            </option>
            <template v-for="platform in gameDetails.platforms">
                <option class="w-full" :value="platform">{{ platform?.abbreviation?.length > 0? platform.abbreviation : platform.name }}</option>
            </template>
          </select>
        </form>
      <button class="shadow-md py-2 px-4 rounded focus:outline-none focus:shadow-outline roboto-light mt-5 p-2 border-solid border-2 border-light-accent dark:border-dark-accent bg-light-accent dark:bg-dark-accent" @click="handleRemove(gameDetails.id, store.uid)">Remove from Collection</button>
    </div>
    <div class="flex flex-col justify-center items-center gap-2" v-else>
      <button class="shadow-md py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:scale-105 transition-all duration-500 cursor-pointer roboto-light mt-5 p-2 border-solid border-2 border-light-accent dark:border-dark-accent bg-light-accent dark:bg-dark-accent" @click="handleAddToCollection(gameDetails.id, gameDetails.name, undefined, gameDetails.first_release_date, gameDetails.total_rating, gameDetails.platforms, store.uid )">Add to Collection</button>
    </div>
  </div>
  </div>
  </div>
  <div class="p-3 m-3">
    <swiper
    :pagination="{
      dynamicBullets: true,
    }"
    :modules="modules"
    class="border-2 border-light-accent dark:border-dark-accent rounded-md"
  >
    <SwiperSlide v-for="(screenshot, index) in gameDetails.screenshots" :key="screenshot.image_id">
      <img
        :src="`https://images.igdb.com/igdb/image/upload/t_1080p/${screenshot.image_id}.jpg`" 
        :alt="`${gameDetails.name} Screenshot ${index + 1}`" />
    </SwiperSlide>
  </Swiper>
  </div>
  </div>
</div>
</template>

<style>
:root {
  --pagination-bullet-active-light: #97bad3; /* Light mode color */
  --pagination-bullet-active-dark: #2c4f68; /* Dark mode color */
}

.swiper-pagination-bullet-active {
    background-color: var(--pagination-bullet-active-light) !important;
}

/* Dark mode overrides */
.dark .swiper-pagination-bullet-active {
    background-color: var(--pagination-bullet-active-dark) !important;
}

.swiper {
  width: 100%;
  height: 100%;
}

.swiper-slide {
  text-align: center;
  font-size: 18px;
  background: #fff;
  max-height: 90vh;

  /* Center slide text vertically */
  display: flex;
  justify-content: center;
  align-items: center;
}

.swiper-slide img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>