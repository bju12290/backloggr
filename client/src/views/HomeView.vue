<script setup>
  import {store} from '../store.js'
</script>

<template>
  <div class="roboto-bold mx-3 h-[75vh] flex flex-col justify-center items-center px-4 py-8">
    <h1 class="playfair-display-thick text-center text-3xl md:text-5xl text-light-text dark:text-dark-text mb-10">
      Welcome to Backloggr!
    </h1>
    <div class="flex gap-4" v-if="store.signedIn">
      <router-link to="/collectionmanager" class="btn bg-light-secondary dark:bg-dark-secondary hover:bg-light-accent hover:dark:bg-dark-accent text-light-text dark:text-dark-text roboto-bold py-2 px-4 rounded">
        My Collection
      </router-link>
      <router-link to="/search" class="btn bg-light-secondary dark:bg-dark-secondary hover:bg-light-accent hover:dark:bg-dark-accent text-light-text dark:text-dark-text roboto-bold py-2 px-4 rounded">
        Search Games
      </router-link>
    </div>
    <div class="flex gap-4" v-else>
      <router-link to="/login" class="text-center w-[90px] btn bg-light-secondary dark:bg-dark-secondary hover:bg-light-accent hover:dark:bg-dark-accent text-light-text dark:text-dark-text roboto-bold py-2 px-4 rounded">
        Login
      </router-link>
      <router-link to="/signup" class="text-center w-[90px] btn bg-light-secondary dark:bg-dark-secondary hover:bg-light-accent hover:dark:bg-dark-accent text-light-text dark:text-dark-text roboto-bold py-2 px-4 rounded">
        Sign Up
      </router-link>
    </div>
  </div>
  <!-- LARGE SCREEN HOW IT WORKS SECTION -->
  <div class="mx-3 hidden md:flex roboto-bold text-light-text dark:text-dark-text roboto-bold mx-3 flex-col justify-center items-center px-4 py-8 gap-16">
    <h1 class="playfair-display-thick text-center text-3xl md:text-5xl mb-10">How It Works</h1>
    <div class="place-items-center grid md:grid-cols-2 h-[500px] md:gap-64">
      <p class="lg:text-4xl text-3xl playfair-display-medium mx-3 px-4 py-8">Add Your Games</p>
      <img class="h-auto object-contain md:object-scale-down" :src="store.theme === 'dark' ? 'https://res.cloudinary.com/ddv5jvvvg/image/upload/v1707774938/dark_add_games_gpokhr.png' : 'https://res.cloudinary.com/ddv5jvvvg/image/upload/v1707774939/light_add_games_scissk.png'"/>
    </div>
    <div class="mt-10 mx-3 place-items-center grid md:grid-cols-2 h-[500px] md:gap-64">
      <img class="h-auto object-contain md:object-scale-down" :src="store.theme === 'dark' ? 'https://res.cloudinary.com/ddv5jvvvg/image/upload/v1707774938/dark_organize_games_wbjrs4.png' : 'https://res.cloudinary.com/ddv5jvvvg/image/upload/v1707774940/light_organize_games_dutmrq.png'"/>
      <p class="lg:text-4xl text-3xl playfair-display-medium mx-3 px-4 py-8">Organize Easily</p>
    </div>
    <div class="mt-10 mx-3 place-items-center grid md:grid-cols-2 h-[500px] md:gap-64">
      <div class="mx-3 px-4 py-8 gap-3">
        <p class="lg:text-4xl text-3xl playfair-display-medium mx-3 px-4">Get Through Your Backlog</p>
        <p class="lg:text-3xl text-2xl playfair-display-medium mx-3 px-4">One Game at a Time</p>
        <p class="mx-3 px-4 montserrat-regular text-sm">Recommendation Functionality Coming Soon</p>
      </div>
      <img class="h-auto object-contain md:object-scale-down" :src="store.theme === 'dark' ? 'https://res.cloudinary.com/ddv5jvvvg/image/upload/v1707774938/dark_game_recommendations_uaobn4.png' : 'https://res.cloudinary.com/ddv5jvvvg/image/upload/v1707774939/light_game_recommendations_y2emjb.png'"/>
    </div>
  </div>
  <!-- MOBILE HOW IT WORKS SECTION -->
  <div class="text-center md:hidden roboto-bold text-light-text dark:text-dark-text roboto-bold mx-3 flex-col justify-center items-center px-4 py-8">
    <h1 class="playfair-display-thick text-center text-3xl md:text-5xl mb-10">How It Works</h1>
    <div class="place-items-center grid h-[500px]">
      <p class="text-3xl playfair-display-medium mx-3 px-4 py-8">Add Your Games</p>
      <img class="max-w-[300px] h-auto object-contain md:object-scale-down" :src="store.theme === 'dark' ? 'https://res.cloudinary.com/ddv5jvvvg/image/upload/v1707774938/dark_add_games_gpokhr.png' : 'https://res.cloudinary.com/ddv5jvvvg/image/upload/v1707774939/light_add_games_scissk.png'"/>
    </div>
    <div class="place-items-center grid h-[500px]">
      <p class="text-3xl playfair-display-medium mx-3 px-4 py-8">Organize Easily</p>
      <img class="max-w-[300px] h-auto object-contain md:object-scale-down" :src="store.theme === 'dark' ? 'https://res.cloudinary.com/ddv5jvvvg/image/upload/v1707774938/dark_organize_games_wbjrs4.png' : 'https://res.cloudinary.com/ddv5jvvvg/image/upload/v1707774940/light_organize_games_dutmrq.png'"/>
    </div>
    <div class="place-items-center grid h-[500px]">
      <div class="mx-3 px-4 py-8 gap-3">
        <p class="text-3xl playfair-display-medium mx-3 px-4">Get Through Your Backlog</p>
        <p class="text-2xl playfair-display-medium mx-3 px-4">One Game at a Time</p>
        <p class="mx-3 px-4 montserrat-regular text-sm">Recommendation Functionality Coming Soon</p>
      </div>
      <img class="max-w-[300px] h-auto object-contain md:object-scale-down" :src="store.theme === 'dark' ? 'https://res.cloudinary.com/ddv5jvvvg/image/upload/v1707774938/dark_game_recommendations_uaobn4.png' : 'https://res.cloudinary.com/ddv5jvvvg/image/upload/v1707774939/light_game_recommendations_y2emjb.png'"/>
    </div>
  </div>
  <div class="mt-32 roboto-bold text-light-text dark:text-dark-text roboto-bold mx-3 flex flex-col justify-center items-center px-4 py-8">
    <h1 class="playfair-display-thick text-center text-3xl md:text-5xl mb-10">News and Updates</h1>
  </div>
</template>
