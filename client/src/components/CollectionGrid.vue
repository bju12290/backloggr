<template>
    <div>
      <h2>User's Game Collection</h2>
      <div class="grid grid-cols-3 gap-4">
        <div v-for="(game, id) in store.userData.game_collection" :key="id">
          <div class="border p-4">
            <h3 class="line-clamp-1">{{ gameData[id]?.name || 'Loading...' }}</h3>
            <img :src="gameData[id]?.image || 'https://res.cloudinary.com/ddv5jvvvg/image/upload/v1699694058/no_cover_img_t5agly.jpg'" alt="Game Cover" class="max-h-40" />
            <h4>{{ store.userData.game_collection[id].game_status }}</h4>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watchEffect } from 'vue';
  import { store } from '../store';

  const gameData = ref({});
  const loading = ref(true);

  const fetchGameDetails = async () => {
    try {
      for (const id in store.userData.game_collection) {
        const gameId = parseInt(id);

        const gameInfoResponse = await fetch(`https://us-central1-video-game-collection-tracker.cloudfunctions.net/getGameDataViaId?query=${gameId}&limit=1`);
        const gameInfo = await gameInfoResponse.json();

        const steamGridDBResponse = await fetch(`https://us-central1-video-game-collection-tracker.cloudfunctions.net/getSteamGridDBData?query=${gameInfo[0].name}`);
        const steamGridDBData = await steamGridDBResponse.json();

        const artTypeResponse = await fetch(`https://us-central1-video-game-collection-tracker.cloudfunctions.net/getGrid?query=${steamGridDBData.data[0]?.id}`);
        const artTypeData = await artTypeResponse.json();

        gameData.value[id] = {
          name: gameInfo[0].name,
          image: artTypeData.data[0]?.url || "https://res.cloudinary.com/ddv5jvvvg/image/upload/v1699694058/no_cover_img_t5agly.jpg",
        };
      }
    } catch (error) {
      console.error('Error fetching game details:', error);
    } finally {
      loading.value = false;
    }
  };

  // Use watchEffect to observe changes in store.userData.game_collection
  watchEffect(() => {
    if (store.userData.game_collection && Object.keys(store.userData.game_collection).length > 0) {
      fetchGameDetails();
    }
  });

  onMounted(fetchGameDetails);
</script>