<script setup>
import { ref } from 'vue'
import { searchGames, fetchGameImage, fetchPlatforms, handleAddToCollection, handleRemove } from '../utils/utils';
import { store } from '../store'

const searchResults = ref([])
const searchQuery = ref('')

const handleSearch = async () => {
    try {
        searchResults.value = await searchGames(searchQuery.value, 25);

        // Use Promise.all to wait for all image fetches to complete
        await Promise.all(searchResults.value.map(async (result) => {
            result.image = await fetchGameImage(result.id, result.name);
        }));

        await Promise.all(searchResults.value.map(async (result) => {
            result.platform_strings = await fetchPlatforms(result.id, result.platforms)
        }))

        console.log(searchResults.value);
    } catch (error) {
        console.error('Error in handleSearch:', error);
    }
}

</script>

<template>
    <label for="search">Search</label>
    <input @change="handleSearch" id="search" type="text" v-model="searchQuery"/>

    {{ searchResults.value }}

    <div v-for="result in searchResults" :key="result.id">
        <router-link :to="'/game/' + result.id"><img :src="result.image"></router-link>
        <router-link :to="'/game/' + result.id"><p>{{ result.name }}</p></router-link>
        <p v-for="string in result.platform_strings">{{ string }}</p>
        <div v-if="store.userData.game_collection[result.id]">
            <button @click="handleRemove(result.id, store.uid)">Remove from Collection</button>
        </div>
        <div v-else>
            <button @click="handleAddToCollection(result.id, result.name, undefined , result.first_release_date, result.total_rating, result.platforms, store.uid )">Add to Collection</button>
        </div>
    </div>
</template>