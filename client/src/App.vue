<script setup>
import { store } from './store'
import Navbar from './components/Navbar.vue'
import { RouterLink, RouterView } from 'vue-router'
import { getAuth, onAuthStateChanged, signOut, setPersistence, inMemoryPersistence } from "firebase/auth";
import router from './router';

const auth = getAuth()

auth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in.
    store.setSignedIn(true)
  } else {
    // No user is signed in.
    store.setSignedIn(false)
  }
});

</script>

<template>
  <header>
    <div class="wrapper">
      <nav>
        <Navbar />
      </nav>
    </div>
  </header>

  <RouterView />
</template>
