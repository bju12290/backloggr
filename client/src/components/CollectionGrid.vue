<!-- 
- Add Ability to Change Game Status Under Each Game :check:
- Show current game's status as current input selection :check:
- Add Ability to Remove Game From Collection :check:
- Add Ability to Select Platform :check:
- Map over IGDB's available platforms for each game and make those the options available for users to select for platforms :check:
- Make platforms work the same way game status does, show the currently selected platform. :check:
-->

<template>
    <div class="mt-16">
      <h2 class="">User's Game Collection</h2>
      <div class="grid grid-cols-3 gap-4">
        <div v-for="(game, id) in store.userData.game_collection" :key="id">
          <div class="border p-4">
            <h3 class="line-clamp-1">{{ gameData[id]?.name || 'Loading...' }}</h3>
            <img :src="gameData[id]?.image || 'https://res.cloudinary.com/ddv5jvvvg/image/upload/v1699694058/no_cover_img_t5agly.jpg'" alt="Game Cover" class="max-h-40" />
            <h4>{{ store.userData.game_collection[id].game_status }}</h4>
            <form @change="props.handleAddToCollection(id, gameData[id]?.name, store.userData.game_collection[id].game_status)" class="font-thin text-sm tracking-tight flex gap-2 flex-wrap place-content-center mt-5 ms-1">
                                <input
                                  v-model="store.userData.game_collection[id].game_status"
                                  :name="'status-' + (id ? id : '')"
                                  value="playing"
                                  type="radio"
                                />
                                <label for="playing">Playing</label>
                                
                                <input 
                                  v-model="store.userData.game_collection[id].game_status"
                                  :name="'status-' + (id ? id : '')" 
                                  value="completed" 
                                  type="radio" 
                                />
                                <label for="completed">Completed</label>
                                
                                <input 
                                  v-model="store.userData.game_collection[id].game_status"
                                  :name="'status-' + (id ? id : '')" 
                                  value="backlog" 
                                  type="radio" 
                                  />
                                <label for="backlog">Backlog</label>
                                
                                <div class="flex gap-2">
                                  <input 
                                    v-model="store.userData.game_collection[id].game_status"
                                    :name="'status-' + (id ? id : '')" 
                                    value="dropped" 
                                    type="radio" 
                                  />
                                  <label for="dropped">Dropped</label>
                                </div>
                              </form>
                              
                              <form @change="handlePlatform(id, store.userData.game_collection[id].platform)">
                                <label for="platform">Select Platform:</label>
                                <select id="platform" name="platform" v-model="store.userData.game_collection[id].platform">
                                  <option disabled value="">{{ 
                                    gameData[id]?.platforms?.length > 0
                                      ? "Please select a platform"
                                      : "Platform Info Not Found"
                                  }}</option>
                                  <template v-for="platformData in gameData[id]?.platforms">
                                    <template :key="platform.id" v-for="platform in platformData">
                                      <option  :value="platform.abbreviation">{{ platform.abbreviation }}</option>
                                    </template>
                                  </template>
                                </select>
                              </form>
                              <button @click="handleRemove(id)">Remove From Collection</button>
          </div>
        </div>
      </div>
    </div>
    <button @click="consoleLog">Console Log</button>
  </template>
  
  <script setup>
  import { ref, onMounted, watchEffect } from 'vue';
  import { store } from '../store';
  import { getDatabase, ref as dbRef, update, get, remove } from "firebase/database";

  const gameData = ref({});
  const loading = ref(true);
  const localSelectedStatus = ref({});
  const props = defineProps(['handleAddToCollection', 'selectedStatus']);

  const consoleLog = () => {
    console.log(props.selectedStatus)
    console.log(store.userData.game_collection)
  }

  const fetchGameDetails = async () => {
    try {
      for (const id in store.userData.game_collection) {
        const gameId = parseInt(id);

        const gameInfoResponse = await fetch(`https://us-central1-video-game-collection-tracker.cloudfunctions.net/getGameDataViaId?query=${gameId}&limit=1`);
        const gameInfoArray = await gameInfoResponse.json();
        const gameInfo = gameInfoArray[0]

        const steamGridDBResponse = await fetch(`https://us-central1-video-game-collection-tracker.cloudfunctions.net/getSteamGridDBData?query=${gameInfo.name}`);
        const steamGridDBData = await steamGridDBResponse.json();

        const artTypeResponse = await fetch(`https://us-central1-video-game-collection-tracker.cloudfunctions.net/getGrid?query=${steamGridDBData.data[0]?.id}`);
        const artTypeData = await artTypeResponse.json();

        let platformData = []
        if (gameInfo.platforms) {
          for (const platformId of gameInfo.platforms) {
          const platformResponse = await fetch(`https://us-central1-video-game-collection-tracker.cloudfunctions.net/getPlatforms?query=${platformId}`);
          const platform = await platformResponse.json();
          platformData.push(platform);
        }
        }
        gameData.value[id] = {
          name: gameInfo.name,
          image: artTypeData.data[0]?.url || "https://res.cloudinary.com/ddv5jvvvg/image/upload/v1699694058/no_cover_img_t5agly.jpg",
          platforms: platformData.length > 0 ? platformData : null,
        };

        console.log(gameData)

        localSelectedStatus.value[id] = props.selectedStatus[id] || 'playing';
      }
    } catch (error) {
      console.error('Error fetching game details:', error);
    } finally {
      loading.value = false;
    }
  };

  const uid = ref(null);

  const handleRemove = (gameId) => {
    const db = getDatabase();
    const gameRef = dbRef(db, `data/users/${uid.value}/game_collection/${gameId}`);

    remove(gameRef)
    .then(() => {
      console.log(`Game with ID ${gameId} removed successfully.`);
    })
    .catch((error) => {
      console.error(`Error removing game with ID ${gameId}: ${error.message}`);
    });
  }

  const selectedPlatform = ref('');

  const handlePlatform = (gameId, selectedPlatform) => {
    const db = getDatabase();
    const gameRef = dbRef(db, `data/users/${uid.value}/game_collection/${gameId}`);
    console.log(selectedPlatform)
    update(gameRef, {
        platform: selectedPlatform,
    })
    .then(() => {
    console.log(`Platform for game with ID ${gameId} updated successfully.`);
    })
    .catch((error) => {
    console.error(`Error updating platform for game with ID ${gameId}: ${error.message}`);
    });
  }

  // Use watchEffect to observe changes in store.userData.game_collection
watchEffect(() => {
  uid.value = store.uid;
  if (store.userData.game_collection && Object.keys(store.userData.game_collection).length > 0 && props.selectedStatus) {
    fetchGameDetails();
  }
});

  onMounted(fetchGameDetails);

</script>