<!-- 
- Confirm Remove From Collection Popup
-->
<style scoped>
.status-selected {
  background-color: #14FFEB;
  color: #393939;
  font-weight: 700;
}

.fade-in {
  animation: fadeIn 500ms;
  -webkit-animation: fadeIn 500ms;
  -moz-animation: fadeIn 500ms;
  -o-animation: fadeIn 500ms;
  -ms-animation: fadeIn 500ms;
}

@keyframes fadeIn {
  0% { opacity: 0; }
  50% { opacity: .95;}
  100% { opacity: .95; }
}
</style>

<template>
  <div v-if="view === 'grid'" class="w-full">
    <div class="mt-16 titillium-web-regular w-full">
      <h1 class="titillium-web-black text-4xl text-light-text dark:text-dark-text text-center text-2xl">Your Collection</h1>
      <div v-if="bulkDeleting" class="fade-in flex flex-col justify-center content-center items-center text-center rounded-md left-1/4 top-1/4 z-50 fixed w-[50vw] h-[50vh] bg-light-primary dark:bg-dark-primary opacity-95">
        <div class="cursor-pointer absolute top-1 right-1" @click="confirmBulkDelete()">
          <svg width="20" height="20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="15.1612" y="74.9888" width="84.609" height="13.9299" rx="4" transform="rotate(-45 15.1612 74.9888)" fill="#14FFEB"/>
            <rect x="25.0112" y="15.1613" width="84.609" height="13.9299" rx="4" transform="rotate(45 25.0112 15.1613)" fill="#14FFEB"/>
          </svg>
        </div>
        <div>
          <p class="text-3xl opacity-100 py-2 px-4 rounded focus:outline-none dark:text-light-primary titillium-web-bold">Are you sure you want to remove your entire selection from your collection?</p>
          <p class="text-2xl opacity-100 py-2 px-4 rounded focus:outline-none dark:text-light-primary titillium-web-bold">This action cannot be undone!</p>
        </div>
        <button class="my-5 opacity-100 hover:scale-105 transition-all duration-500 cursor-pointer self-center w-full md:w-1/3 shadow-md py-2 px-4 rounded focus:outline-none focus:shadow-outline border-solid border-2 border-light-warning bg-light-warning dark:text-dark-primary titillium-web-bold" @click="performBulkOperation('delete')">Remove Selected</button>
      </div>
      <div v-if="bulkEditing" class="fade-in flex flex-row mt-5 mb-2 gap-2">
        <form @change="performBulkOperation('updateStatus')" class="flex flex-row">
          <select class="text-light-text dark:text-dark-text p-1 rounded-md bg-light-tertiary dark:bg-dark-tertiary md:w-full" id="bulkStatus" name="bulkStatus" v-model="localSelectedStatus">
            <option class="bg-light-primary dark:bg-dark-primary" value="playing">Playing</option>
            <option class="bg-light-primary dark:bg-dark-primary" value="completed">Completed</option>
            <option class="bg-light-primary dark:bg-dark-primary" value="backlog">Backlog</option>
            <option class="bg-light-primary dark:bg-dark-primary" value="dropped">Dropped</option>
            <option class="bg-light-primary dark:bg-dark-primary" value="never-played">Never Played</option>
          </select>
        </form>
          <button class="hover:scale-105 transition-all duration-500 cursor-pointer self-center w-full md:w-1/6 shadow-md py-2 px-4 rounded focus:outline-none focus:shadow-outline border-solid border-2 border-light-warning bg-light-warning dark:text-dark-primary titillium-web-bold" @click="confirmBulkDelete()">Remove Selected</button>
          <button class="hover:scale-105 transition-all duration-500 cursor-pointer self-center w-full md:w-1/6 shadow-md py-2 px-4 rounded focus:outline-none focus:shadow-outline border-solid border-2 border-light-accent bg-light-accent dark:text-dark-primary titillium-web-bold" @click="performBulkOperation('selectAll')">Select All</button>
          <button class="hover:scale-105 transition-all duration-500 cursor-pointer self-center w-full md:w-1/6 shadow-md py-2 px-4 rounded focus:outline-none focus:shadow-outline border-solid border-2 border-light-accent bg-light-accent dark:text-dark-primary titillium-web-bold" @click="performBulkOperation('clear')">Clear Selection</button>
        </div>
        <div v-if="isLoading" class="flex justify-center items-center mt-5">
          <pacman-loader color="#14FFEB"></pacman-loader>
        </div>
        <div class="flex justify-center items-center text-3xl md:text-4xl titillium-web-black text-light-primary dark:text-dark-primary" v-if="!isLoading && !store.userData.game_collection">
        <p class="p-11 text-center">You haven't added any games to your collection yet! Try adding some using the Quick Search above!</p>
        </div>

      <div v-else class="text-light-text dark:text-dark-text lg:grid lg:grid-cols-3 gap-2">
        <div class="p-1" v-for="(game) in sortedGames">
          <div class="rounded shadow-xl bg-light-secondary dark:bg-dark-secondary/50 p-4" data-aos="fade-up">
          <div class="flex flex-row">
            <input class="absolute top-0 right-0 m-2 opacity-0 w-0 h-0" type="checkbox" :id="'game-checkbox-' + game.id" :value="game.id" v-model="selectedGames" @change="toggleSelection()">
            <label :for="'game-checkbox-' + game.id" class="absolute top-0 right-0 m-2 w-6 h-6 border-2 border-light-primary dark:border-dark-primary rounded-full cursor-pointer" :class="{ 'bg-light-accent': selectedGames.includes(game.id) }"></label>
            <div class="min-h-[160px] max-h-[160px] min-w-[106.66px] max-w-[106.66px]">
            <router-link :to="'/game/' + game.id">
                <img v-if="gameData[game.id]?.imageLoaded" :src="gameData[game.id]?.image || 'https://res.cloudinary.com/ddv5jvvvg/image/upload/v1699694058/no_cover_img_t5agly.jpg'" alt="Game Cover" class="rounded hover:scale-105 transition-all duration-500 cursor-pointer max-w-none min-h-40 max-h-40" />
                <div v-else class="flex justify-center content-center">
                  <clip-loader color="#14FFEB" size="90px"></clip-loader>
                </div>
            </router-link>
          </div>
          <div class="p-2">
            <h3 class="text-xl line-clamp-1 titillium-web-bold">{{ store.userData.game_collection[game.id]?.game_name || 'Loading...' }}</h3>
            <p class="line-clamp-1 titillium-web-semibold">First Release</p>
            <p class="titillium-web-light">{{  game.release_year }}</p>
            <p class="line-clamp-1 titillium-web-semibold">Review Score</p>
            <p class="line-clamp-1 titillium-web-light">{{ gameData[game.id]?.popularity ? gameData[game.id]?.popularity?.toFixed(2) : "No Rating Found" }}</p>
          </div>
          </div>
          <div class="flex flex-col w-full">
            <div class="flex text-center justify-center flex-wrap gap-2 my-2">
              <div
                class="cursor-pointer bg-light-primary dark:bg-dark-primary w-[100px] rounded-md"
                :class="{'status-selected': store.userData.game_collection[game.id].game_status === 'playing'}" 
                @click="handleAddToCollection(game.id, store.userData.game_collection[game.id]?.game_name, 'playing', store.userData.game_collection[game.id].release_year, gameData[game.id]?.popularity, store.userData.game_collection[game.id].platformIds, store.uid)"
              >
                Playing
              </div>
              <div 
                class="cursor-pointer bg-light-primary dark:bg-dark-primary w-[100px] rounded-md"
                :class="{'status-selected': store.userData.game_collection[game.id].game_status === 'completed'}" 
                @click="handleAddToCollection(game.id, store.userData.game_collection[game.id]?.game_name, 'completed', store.userData.game_collection[game.id].release_year, gameData[game.id]?.popularity, store.userData.game_collection[game.id].platformIds, store.uid)"
              >
                Completed
              </div>
              <div 
                class="cursor-pointer bg-light-primary dark:bg-dark-primary w-[100px] rounded-md"
                :class="{'status-selected': store.userData.game_collection[game.id].game_status === 'backlog'}" 
                @click="handleAddToCollection(game.id, store.userData.game_collection[game.id]?.game_name, 'backlog', store.userData.game_collection[game.id].release_year, gameData[game.id]?.popularity, store.userData.game_collection[game.id].platformIds, store.uid)"
              >
                Backlog
              </div>
              <div 
                class="cursor-pointer bg-light-primary dark:bg-dark-primary w-[100px] rounded-md"
                :class="{'status-selected': store.userData.game_collection[game.id].game_status === 'dropped'}" 
                @click="handleAddToCollection(game.id, store.userData.game_collection[game.id]?.game_name, 'dropped', store.userData.game_collection[game.id].release_year, gameData[game.id]?.popularity, store.userData.game_collection[game.id].platformIds, store.uid)"
              >
                Dropped
              </div>
              <div 
                class="cursor-pointer bg-light-primary dark:bg-dark-primary w-[100px] rounded-md"
                :class="{'status-selected': store.userData.game_collection[game.id].game_status === 'never-played'}" 
                @click="handleAddToCollection(game.id, store.userData.game_collection[game.id]?.game_name, 'never-played', store.userData.game_collection[game.id].release_year, gameData[game.id]?.popularity, store.userData.game_collection[game.id].platformIds, store.uid)"
              >
                Never Played
              </div>
            </div>
            <div class="flex flex-col justify-center items-center text-center">
            <form @change="handlePlatform(game.id, store.userData.game_collection[game.id].platform)">

              <label class="titillium-web-semibold" for="platform">Select Platform:</label> <br/>
                <select class="w-48 p-1 rounded-md bg-light-tertiary dark:bg-dark-tertiary" id="platform" name="platform" v-model="store.userData.game_collection[game.id].platform">
                  <option value="">
                    {{ 
                      store.userData.game_collection[game.id]?.platforms && store.userData.game_collection[game.id]?.platforms.length > 0
                        ? ""
                        : platformLoadingStatus
                    }}
                  </option>
                  <template v-for="platform in store.userData.game_collection[game.id]?.platformIds">
                      <option class="w-full bg-light-primary dark:bg-dark-primary" :value="platform">{{ platform?.abbreviation }}</option>
                  </template>
                </select>
            </form>
          </div>
            <button class="hover:scale-105 transition-all duration-500 cursor-pointer self-center w-full md:w-2/3 mt-5 shadow-md py-2 px-4 rounded focus:outline-none focus:shadow-outline border-solid border-2 border-light-accent dark:border-dark-accent bg-light-accent dark:bg-dark-accent dark:text-dark-primary titillium-web-semibold" @click="handleRemove(game.id)">Remove From Collection</button>
          </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="w-full">
    <div class="mt-16 titillium-web-regular w-full">
      <h1 class="titillium-web-black text-4xl text-light-text dark:text-dark-text text-center text-2xl">Your Collection</h1>
      <div v-if="bulkDeleting" class="fade-in flex flex-col justify-center content-center items-center text-center rounded-md left-1/4 top-1/4 z-50 fixed w-[50vw] h-[50vh] bg-light-primary dark:bg-dark-primary opacity-95">
        <div class="cursor-pointer absolute top-1 right-1" @click="confirmBulkDelete()">
          <svg width="20" height="20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="15.1612" y="74.9888" width="84.609" height="13.9299" rx="4" transform="rotate(-45 15.1612 74.9888)" fill="#14FFEB"/>
            <rect x="25.0112" y="15.1613" width="84.609" height="13.9299" rx="4" transform="rotate(45 25.0112 15.1613)" fill="#14FFEB"/>
          </svg>
        </div>
        <div>
          <p class="text-3xl opacity-100 py-2 px-4 rounded focus:outline-none dark:text-light-primary titillium-web-bold">Are you sure you want to remove your entire selection from your collection?</p>
          <p class="text-2xl opacity-100 py-2 px-4 rounded focus:outline-none dark:text-light-primary titillium-web-bold">This action cannot be undone!</p>
        </div>
        <button class="my-5 opacity-100 hover:scale-105 transition-all duration-500 cursor-pointer self-center w-full md:w-1/3 shadow-md py-2 px-4 rounded focus:outline-none focus:shadow-outline border-solid border-2 border-light-warning bg-light-warning dark:text-dark-primary titillium-web-bold" @click="performBulkOperation('delete')">Remove Selected</button>
      </div>
      <div v-if="bulkEditing" class="fade-in flex flex-row mt-5 mb-2 gap-2">
        <form @change="performBulkOperation('updateStatus')" class="flex flex-row">
          <select class="text-light-text dark:text-dark-text p-1 rounded-md bg-light-tertiary dark:bg-dark-tertiary md:w-full" id="bulkStatus" name="bulkStatus" v-model="localSelectedStatus">
            <option class="bg-light-primary dark:bg-dark-primary" value="playing">Playing</option>
            <option class="bg-light-primary dark:bg-dark-primary" value="completed">Completed</option>
            <option class="bg-light-primary dark:bg-dark-primary" value="backlog">Backlog</option>
            <option class="bg-light-primary dark:bg-dark-primary" value="dropped">Dropped</option>
            <option class="bg-light-primary dark:bg-dark-primary" value="never-played">Never Played</option>
          </select>
        </form>
          <button class="hover:scale-105 transition-all duration-500 cursor-pointer self-center w-full md:w-1/6 shadow-md py-2 px-4 rounded focus:outline-none focus:shadow-outline border-solid border-2 border-light-warning bg-light-warning dark:text-dark-primary titillium-web-bold" @click="confirmBulkDelete()">Remove Selected</button>
          <button class="hover:scale-105 transition-all duration-500 cursor-pointer self-center w-full md:w-1/6 shadow-md py-2 px-4 rounded focus:outline-none focus:shadow-outline border-solid border-2 border-light-accent bg-light-accent dark:text-dark-primary titillium-web-bold" @click="performBulkOperation('selectAll')">Select All</button>
          <button class="hover:scale-105 transition-all duration-500 cursor-pointer self-center w-full md:w-1/6 shadow-md py-2 px-4 rounded focus:outline-none focus:shadow-outline border-solid border-2 border-light-accent bg-light-accent dark:text-dark-primary titillium-web-bold" @click="performBulkOperation('clear')">Clear Selection</button>
        </div>
        <div v-if="isLoading" class="flex justify-center items-center mt-5">
          <pacman-loader color="#14FFEB"></pacman-loader>
        </div>
        <div class="flex justify-center items-center text-3xl md:text-4xl titillium-web-black text-light-primary dark:text-dark-primary" v-if="!isLoading && !store.userData.game_collection">
        <p class="p-11 text-center">You haven't added any games to your collection yet! Try adding some using the Quick Search above!</p>
        </div>

      <div v-else class="text-light-text dark:text-dark-text lg:flex lg:flex-col gap-2">
        <div class="p-1" v-for="(game) in sortedGames"> 
          <div class="rounded shadow-xl bg-light-secondary dark:bg-dark-secondary/50 p-4 w-full" data-aos="fade-up">
          <div class="flex flex-row aboslute">
            <input class="absolute top-0 right-0 m-2 opacity-0 w-0 h-0" type="checkbox" :id="'game-checkbox-' + game.id" :value="game.id" v-model="selectedGames" @change="toggleSelection()">
            <label :for="'game-checkbox-' + game.id" class="absolute top-0 right-0 m-2 w-6 h-6 border-2 border-light-primary dark:border-dark-primary rounded-full cursor-pointer" :class="{ 'bg-light-accent': selectedGames.includes(game.id) }"></label>
            <div class="min-h-[160px] max-h-[160px] min-w-[106.66px] max-w-[106.66px]">
            <router-link :to="'/game/' + game.id">
                <img v-if="gameData[game.id]?.imageLoaded" :src="gameData[game.id]?.image || 'https://res.cloudinary.com/ddv5jvvvg/image/upload/v1699694058/no_cover_img_t5agly.jpg'" alt="Game Cover" class="rounded hover:scale-105 transition-all duration-500 cursor-pointer max-w-none min-h-40 max-h-40" />
                <div v-else class="flex justify-center content-center">
                  <clip-loader color="#14FFEB" size="90px"></clip-loader>
                </div>
            </router-link>
          </div>
          <div class="p-2">
            <h3 class="text-xl line-clamp-1 titillium-web-bold">{{ store.userData.game_collection[game.id]?.game_name || 'Loading...' }}</h3>
            <p class="line-clamp-1 titillium-web-semibold">First Release</p>
            <p class="titillium-web-light">{{  game.release_year }}</p>
            <p class="line-clamp-1 titillium-web-semibold">Review Score</p>
            <p class="line-clamp-1 titillium-web-light">{{ gameData[game.id]?.popularity ? gameData[game.id]?.popularity?.toFixed(2) : "No Rating Found" }}</p>
          </div>
          </div>
          <div class="flex flex-col w-full absolute top-11 justify-end items-end">
            <div class="flex text-center flex-wrap gap-2 my-2 justify-end mx-5">
              <div
                class="cursor-pointer bg-light-primary dark:bg-dark-primary w-[100px] rounded-md"
                :class="{'status-selected': store.userData.game_collection[game.id].game_status === 'playing'}" 
                @click="handleAddToCollection(game.id, store.userData.game_collection[game.id]?.game_name, 'playing', store.userData.game_collection[game.id].release_year, gameData[game.id]?.popularity, store.userData.game_collection[game.id].platformIds, store.uid)"
              >
                Playing
              </div>
              <div 
                class="cursor-pointer bg-light-primary dark:bg-dark-primary w-[100px] rounded-md"
                :class="{'status-selected': store.userData.game_collection[game.id].game_status === 'completed'}" 
                @click="handleAddToCollection(game.id, store.userData.game_collection[game.id]?.game_name, 'completed', store.userData.game_collection[game.id].release_year, gameData[game.id]?.popularity, store.userData.game_collection[game.id].platformIds, store.uid)"
              >
                Completed
              </div>
              <div 
                class="cursor-pointer bg-light-primary dark:bg-dark-primary w-[100px] rounded-md"
                :class="{'status-selected': store.userData.game_collection[game.id].game_status === 'backlog'}" 
                @click="handleAddToCollection(game.id, store.userData.game_collection[game.id]?.game_name, 'backlog', store.userData.game_collection[game.id].release_year, gameData[game.id]?.popularity, store.userData.game_collection[game.id].platformIds, store.uid)"
              >
                Backlog
              </div>
              <div 
                class="cursor-pointer bg-light-primary dark:bg-dark-primary w-[100px] rounded-md"
                :class="{'status-selected': store.userData.game_collection[game.id].game_status === 'dropped'}" 
                @click="handleAddToCollection(game.id, store.userData.game_collection[game.id]?.game_name, 'dropped', store.userData.game_collection[game.id].release_year, gameData[game.id]?.popularity, store.userData.game_collection[game.id].platformIds, store.uid)"
              >
                Dropped
              </div>
              <div 
                class="cursor-pointer bg-light-primary dark:bg-dark-primary w-[100px] rounded-md"
                :class="{'status-selected': store.userData.game_collection[game.id].game_status === 'never-played'}" 
                @click="handleAddToCollection(game.id, store.userData.game_collection[game.id]?.game_name, 'never-played', store.userData.game_collection[game.id].release_year, gameData[game.id]?.popularity, store.userData.game_collection[game.id].platformIds, store.uid)"
              >
                Never Played
              </div>
            </div>
            <div class="flex flex-col justify-end items-end text-center mx-5">
            <form @change="handlePlatform(game.id, store.userData.game_collection[game.id].platform)">

              <label class="titillium-web-semibold" for="platform">Select Platform:</label> <br/>
                <select class="w-48 p-1 rounded-md bg-light-tertiary dark:bg-dark-tertiary" id="platform" name="platform" v-model="store.userData.game_collection[game.id].platform">
                  <option value="">
                    {{ 
                      store.userData.game_collection[game.id]?.platforms && store.userData.game_collection[game.id]?.platforms.length > 0
                        ? ""
                        : platformLoadingStatus
                    }}
                  </option>
                  <template v-for="platform in store.userData.game_collection[game.id]?.platformIds">
                      <option class="w-full bg-light-primary dark:bg-dark-primary" :value="platform">{{ platform?.abbreviation }}</option>
                  </template>
                </select>
            </form>
          </div>
            <button class="justify-self-end self-end hover:scale-105 transition-all duration-500 cursor-pointer w-full md:w-1/4 mt-2 shadow-md py-1 px-4 rounded focus:outline-none focus:shadow-outline border-solid border-2 border-light-accent dark:border-dark-accent bg-light-accent dark:bg-dark-accent dark:text-dark-primary titillium-web-semibold mx-5" @click="handleRemove(game.id)">Remove</button>
          </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </template>
  
  <script setup>
  import { handleAddToCollection, handleUpdate } from '../utils/utils'
  import { ref, onMounted, watchEffect, onUnmounted  } from 'vue';
  import { store } from '../store';
  import { getDatabase, ref as dbRef, update, get, remove, onChildAdded, onChildChanged, onChildRemoved  } from "firebase/database";
  import PacmanLoader from 'vue-spinner/src/PacmanLoader.vue'
  import ClipLoader from 'vue-spinner/src/ClipLoader.vue'
  import AOS from 'aos';
  import 'aos/dist/aos.css';
  
  const selectedGames = ref([]);
  const bulkEditing = ref(false)
  const gameData = ref({});
  const localSelectedStatus = ref('');
  const isLoading = ref(true)
  const platformLoadingStatus = ref("")
  const props = defineProps(['selectedStatus', 'view']);
  const bulkDeleting = ref(false)
  const isSmallScreen = ref(window.innerWidth < 1071);

  const consoleLog = () => {
    console.log(filteredGames.value)
    console.log(sortedGames.value)
    console.log(store.userData.game_collection)
    console.log(gameData.value)
    console.log(store.sortValue)
  }

  const filteredGames = ref({});

const updateGameStatus = (gameId, status) => {
  store.userData.game_collection[gameId].game_status = status
}

const toggleSelection = () => {
  if (selectedGames.value.length > 0) {
    bulkEditing.value = true
  } else {
    bulkEditing.value = false
  }
};

const confirmBulkDelete = () => {
  if (!bulkDeleting.value) {
    bulkDeleting.value = true
  } else {
    bulkDeleting.value = false
  }
}

const performBulkOperation = (operation) => {
  switch (operation) {
    case 'delete':
      selectedGames.value.forEach(gameId => {
        handleRemove(gameId);
      });
      bulkDeleting.value = false
      selectedGames.value = [];
      break;
    case 'updateStatus':
      selectedGames.value.forEach(gameId => {
        handleUpdate(gameId, localSelectedStatus.value, store.uid);
      });
      break;
    case 'selectAll':
      sortedGames.value.forEach(game => {
        if (!selectedGames.value.includes(game.id)) {
          selectedGames.value.push(game.id);
        }
      });
      break;
    case 'clear':
      selectedGames.value = [];
      bulkEditing.value = false;
      break;
    // Add other bulk operation cases as needed
  }
};

const updateFilteredGames = () => {
  const selectedPlatforms = store.selectedPlatforms;
  const selectedStatuses = store.selectedStatuses;

  filteredGames.value = Object.fromEntries(
    Object.entries(store.userData.game_collection)
      .filter(([id, game]) => {
        // Apply platform filter
        const platformMatch =
          selectedPlatforms.length === 0 ||
          selectedPlatforms.includes(game.platform?.abbreviation) ||
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
  switch (sortingMethod) {
    case 'AtoZ':
    gameArray.sort((a, b) => {
        const gameA = a[1].game_name.toUpperCase();
        // console.log(gameA);
        const gameB = b[1].game_name.toUpperCase();
        // console.log(gameB);

        if (gameA < gameB) return -1;
        if (gameA > gameB) return 1;
        return 0;
      });
      break;
    
    // Add other cases for different sorting methods
    case 'ZtoA':
    gameArray.sort((a, b) => {
        const gameA = a[1].game_name.toUpperCase();
        // console.log(gameA);
        const gameB = b[1].game_name.toUpperCase();
        // console.log(gameB);

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

        // console.log(`Sorting ${a[1].game_name} (${a[1].game_status}) and ${b[1].game_name} (${b[1].game_status}): ${statusA} - ${statusB}`);

        return statusA - statusB;
      });
    break;

    default:
    }
  sortedGames.value = gameArray.map(([id, game]) => ({ id, ...game }));

});

  const uid = ref(null);

  const handleRemove = (gameId) => {
    const db = getDatabase();
    const gameRef = dbRef(db, `data/users/${store.uid}/game_collection/${gameId}`);

    remove(gameRef)
    .then(() => {
      // console.log(`Game with ID ${gameId} removed successfully.`);
    })
    .catch((error) => {
      console.error(`Error removing game with ID ${gameId}: ${error.message}`);
    });
  }

  const handlePlatform = (gameId, selectedPlatform) => {
    const db = getDatabase();
    const gameRef = dbRef(db, `data/users/${store.uid}/game_collection/${gameId}`);
    console.log(selectedPlatform)
    update(gameRef, {
        platform: selectedPlatform,
    })
    .then(() => {
    // console.log(`Platform for game with ID ${gameId} updated successfully.`);
    })
    .catch((error) => {
    console.error(`Error updating platform for game with ID ${gameId}: ${error.message}`);
    });
  }


watchEffect(() => {
  uid.value = store.uid;
  if (store.userData.game_collection && Object.keys(store.userData.game_collection).length > 0 && props.selectedStatus) {
    updateFilteredGames();
  } else {}
});

const fetchGameImage = async (gameId, gameName) => {
  try {
    // Get SteamGridDB data for the game name
    const steamGridDBResponse = await fetch(`https://us-central1-video-game-collection-tracker.cloudfunctions.net/getSteamGridDBData?query=${gameName}`);
    const steamGridDBData = await steamGridDBResponse.json();

    // Check if SteamGridDB data is available
    if (steamGridDBData.data && steamGridDBData.data.length > 0) {
      const steamGridDbId = steamGridDBData.data[0]?.id;

      // Fetch game image using SteamGridDB ID
      const artTypeResponse = await fetch(`https://us-central1-video-game-collection-tracker.cloudfunctions.net/getGrid?query=${steamGridDbId}`);
      const artTypeData = await artTypeResponse.json();

      // Update the gameData structure
      gameData.value[gameId] = {
        ...store.userData.game_collection[gameId], // Spread existing properties
        image: artTypeData.data[0]?.url || "https://res.cloudinary.com/ddv5jvvvg/image/upload/v1699694058/no_cover_img_t5agly.jpg",
        imageLoaded: true
      };
      //console.log(gameData.value[gameId])
    } else {
      //console.log(`SteamGridDB data not found for game ${gameName}.`);
    }
  } catch (error) {
    console.error(`Error fetching image for game ${gameName}:`, error);
  }
};

let isListenersSetup = false;

const setupRealtimeListeners = () => {
  let initialDataReceived = false;
  const db = getDatabase();
  const collectionRef = dbRef(db, `data/users/${store.uid}/game_collection`);

  const dataReceived = () => {
    if (!initialDataReceived) {
      initialDataReceived = true;
      setTimeout(() => {
        isLoading.value = false;
      }, 500);
    }
  };

  const realtimeUpdate = (snapshot) => {
    const gameData = snapshot.val();
    if (gameData) {
      store.userData.game_collection[snapshot.key] = gameData;
      updateFilteredGames();
      dataReceived();
    }
  };

  const changeListener = onChildChanged(collectionRef, realtimeUpdate);

  const addListener = onChildAdded(collectionRef, async (snapshot) => {
    const gameId = snapshot.key;
    const gameData = snapshot.val();
    const gameName = gameData.game_name;
    if (gameData) {
      if (!store.userData) store.userData = {};
      if (!store.userData.game_collection) store.userData.game_collection = {};
      store.userData.game_collection[gameId] = gameData;
      updateFilteredGames();
      fetchGameImage(gameId, gameName);
      dataReceived();
    }
});

  const removeListener = onChildRemoved(collectionRef, (snapshot) => {
    const gameId = snapshot.key;
    delete store.userData.game_collection[gameId];
    const { [gameId]: removedGame, ...updatedFilteredGames } = filteredGames.value;
    filteredGames.value = updatedFilteredGames;
  });
  setTimeout(() => {
    if (!initialDataReceived) {
      isLoading.value = false;
    }
  }, 2000); // Adjust this delay as needed
};

// Watch for changes in store.userData.game_collection and trigger initial fetch
watchEffect(() => {
  const gameCollection = store.userData.game_collection;

  if (gameCollection && Object.keys(gameCollection).length > 0 && !isListenersSetup) {
    isListenersSetup = true;
    setupRealtimeListeners();
  }
});

onMounted( () => {
  if (!isListenersSetup) {
    isListenersSetup = true;
    setupRealtimeListeners();
  }
  AOS.init();
  store.sortValue = '';
  uid.value = store.uid;
  //console.log(store)
})


</script>