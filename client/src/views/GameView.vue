<script setup> 
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { fetchGameDetailsById, fetchGameImage, fetchPlatforms, handleAddToCollection, handleRemove, handleUpdate } from '../utils/utils';
import { store } from '../store.js'

const gameId = ref(null);
const gameDetails = ref({});
const gameImage = ref(null)
const platformDetails = ref(null)

const route = useRoute();

onMounted(async () => {
  try {
    gameId.value = route.params.gameId;
    gameDetails.value = await fetchGameDetailsById(gameId.value);
    console.log(gameDetails.value);

    // Now that you have gameDetails, you can use it to fetch the game image
    gameImage.value = await fetchGameImage(gameId.value, gameDetails.value.name);
    console.log(gameImage.value);

    platformDetails.value = await fetchPlatforms(gameId.value, gameDetails.value.platforms)
    console.log(platformDetails.value)
  } catch (error) {
    console.error('Failed to fetch game details:', error);
  }
});
</script>

<template>
    <h1>{{ gameDetails.name }}</h1>
    <img :src="gameImage"/>
    <p>{{ gameDetails }}</p>
    <p>{{ gameDetails.total_rating }}</p>
    <p>{{ new Date(gameDetails.first_release_date).toLocaleDateString('en-US') }}</p>
    <p v-for="platform in platformDetails">{{ platform }}</p>
    <div v-if="store.signedIn">
    <div v-if="store.userData.game_collection[gameDetails.id]">
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
        <label for="platform">Select Platform:</label>
          <select class="w-48 p-1 border rounded" id="platform" name="platform" v-model="store.userData.game_collection[gameDetails.id].platform">
            <option disabled value="">
              {{ 
                store.userData.game_collection[gameDetails.id]?.platforms && store.userData.game_collection[gameDetails.id]?.platforms.length > 0
                  ? "Please select a platform"
                  : "Loading"
              }}
            </option>
            <template v-for="platform in platformDetails">
                <option class="w-full" :value="platform">{{ platform }}</option>
            </template>
          </select>
        </form>
      <button @click="handleRemove(gameDetails.id, store.uid)">Remove from Collection</button>
    </div>
    <div v-else>
      <button @click="handleAddToCollection(gameDetails.id, gameDetails.name, undefined, gameDetails.first_release_date, gameDetails.total_rating, gameDetails.platforms, store.uid )">Add to Collection</button>
    </div>
  </div>
</template>