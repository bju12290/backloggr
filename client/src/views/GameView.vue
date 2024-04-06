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
import { Pagination, Autoplay } from 'swiper/modules';
import NotificationPopup from '@/components/NotificationPopup.vue';
import 'swiper/css';
import 'swiper/css/pagination';


const modules = [Pagination, Autoplay]

const gameId = ref();
const gameDetails = ref({});
const gameImage = ref(null)
const platformDetails = ref(null)
const isLoading = ref(false)
const loadingStatus = ref('Getting Game Details...')

const route = useRoute();

onMounted(async () => {
  console.log(gameDetails)
  console.log(store)
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
  <notification-popup bgColor="green" message="This is a success message!"></notification-popup>
  <div class="titillium-web-regular flex flex-col justify-center items-center" v-if="isLoading">
    <p class="mt-16 text-light-text dark:text-dark-text">{{ loadingStatus }}</p>
    <pacman-loader color="#14FFEB"></pacman-loader>
  </div>
  <div class="flex justify-center items-center" v-else>
  <div class="mt-4 w-11/12 bg-opacity-75 shadow-md rounded-xl bg-light-secondary dark:bg-dark-secondary titillium-web-regular text-light-text dark:text-dark-text">
    <div class="flex md:flex-row flex-col">
      <div class="mt-4 p-3 min-w-96">
        <img class="shadow-md rounded-md md:min-w-[24rem]" :src="gameImage"/>
      </div>
      <div class="mt-4 p-3">
        <h1 class="titillium-web-bold text-4xl">{{ gameDetails.name }}</h1>
        <p class="titillium-web-semibold mt-2">Review Score</p>
        <p class="titillium-web-light">{{ gameDetails.total_rating?.toFixed(2) }}</p>
        <p class="titillium-web-semibold mt-2">Release Date</p>
        <p class="titillium-web-light">{{ new Date(gameDetails.first_release_date * 1000).toLocaleDateString('en-US') }}</p>
        <p class="titillium-web-semibold mt-2">Genres</p>
        <div class="flex flex-wrap gap-2">
          <p class="shadow-md text-light-text dark:text-dark-text text-sm titillium-web-semibold p-2 bg-light-primary dark:bg-dark-primary rounded-md" v-for="genre in gameDetails.genres">{{ genre.name }}</p>
        </div>
        <p class="titillium-web-medium mt-2">Themes</p>
        <div class="flex gap-2" >
          <p class="shadow-md text-light-text dark:text-dark-text text-sm titillium-web-semibold p-2 bg-light-primary dark:bg-dark-primary rounded-md" v-for="theme in gameDetails.themes">{{ theme.name }}</p>
        </div>
        <p class="titillium-web-medium mt-2">Platforms</p>
        <div class="flex flex-wrap gap-2">
        <div class="shadow-md p-1 bg-light-primary dark:bg-dark-primary rounded-md" v-for="platform in gameDetails.platforms">
          <p class="text-light-text dark:text-dark-text text-sm titillium-web-semibold text-center p-1">{{ platform.abbreviation?.length > 0? platform.abbreviation : platform.name }}</p>
        </div>
      </div>
      <p class="titillium-web-medium mt-2">Summary</p>
      <p>{{ gameDetails.summary }}</p>
      <div v-if="store.signedIn">
    <div class="flex flex-col justify-center items-center gap-2" v-if="gameDetails.id && store.userData.game_collection[gameDetails.id]">
          <div class="flex flex-col w-full">
            <div class="flex text-center text-sm justify-center flex-wrap gap-2 my-2">
              <div
                class="shadow-md cursor-pointer bg-light-primary dark:bg-dark-primary w-[100px] rounded-md"
                :class="{'status-selected': store.userData.game_collection[gameDetails.id].game_status === 'playing'}"
                @click="handleUpdate(gameDetails.id, 'playing', store.uid)"
                >
                Playing
              </div>
              <div
                class="shadow-md cursor-pointer bg-light-primary dark:bg-dark-primary w-[100px] rounded-md"
                :class="{'status-selected': store.userData.game_collection[gameDetails.id].game_status === 'completed'}"
                @click="handleUpdate(gameDetails.id, 'completed', store.uid)"
                >
                Completed
              </div>
              <div
                class="shadow-md cursor-pointer bg-light-primary dark:bg-dark-primary w-[100px] rounded-md"
                :class="{'status-selected': store.userData.game_collection[gameDetails.id].game_status === 'backlog'}"
                @click="handleUpdate(gameDetails.id, 'backlog', store.uid)"
                >
                Backlog
              </div>
              <div
                class="shadow-md cursor-pointer bg-light-primary dark:bg-dark-primary w-[100px] rounded-md"
                :class="{'status-selected': store.userData.game_collection[gameDetails.id].game_status === 'dropped'}"
                @click="handleUpdate(gameDetails.id, 'dropped', store.uid)"
                >
                Dropped
              </div>
              <div
                class="shadow-md cursor-pointer bg-light-primary dark:bg-dark-primary w-[100px] rounded-md"
                :class="{'status-selected': store.userData.game_collection[gameDetails.id].game_status === 'never-played'}"
                @click="handleUpdate(gameDetails.id, 'never-played', store.uid)"
                >
                Never Played
              </div>
            </div>
          </div>
            
      <form @change="handleUpdate(gameDetails.id, store.userData.game_collection[gameDetails.id].platform, store.uid)">
        <label class="titillium-web-medium" for="platform">Playing On: </label>
          <select class="titillium-web-regular w-48 p-1 rounded bg-light-secondary dark:bg-dark-secondary" id="platform" name="platform" v-model="store.userData.game_collection[gameDetails.id].platform">
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
      <button class="text-dark-primary shadow-md py-2 px-4 rounded focus:outline-none focus:shadow-outline titillium-web-semibold mt-5 p-2 bg-light-accent dark:bg-dark-accent" @click="handleRemove(gameDetails.id, store.uid)">Remove from Collection</button>
    </div>
    <div class="flex flex-col justify-center items-center gap-2" v-else>
      <button class="shadow-md py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:scale-105 transition-all duration-500 cursor-pointer titillium-web-light mt-5 p-2 bg-light-primary dark:bg-dark-accent" @click="handleAddToCollection(gameDetails.id, gameDetails.name, undefined, gameDetails.first_release_date, gameDetails.total_rating, gameDetails.platforms, store.uid )">Add to Collection</button>
    </div>
  </div>
  </div>
  </div>
  <div class="p-3 m-3">
    <swiper
    :pagination="{
      dynamicBullets: true,
    }"
    :autoplay="{
            delay: 2500,
            disableOnInteraction: false,
          }"
    :modules="modules"
    class="rounded-md shadow-md"
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

.status-selected {
  background-color: #14FFEB !important;
  color: #393939;
  font-weight: 650;
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