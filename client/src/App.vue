<script setup>
import { store } from './store'
import Navbar from './components/Navbar.vue'
import { RouterView } from 'vue-router'
import { getAuth } from "firebase/auth";
import { getDatabase, ref, child, get } from "firebase/database";
import './App.css'


const auth = getAuth()

auth.onAuthStateChanged((user) => {
  if (user) {
    store.setSignedIn(true)
    const uid = user.uid
    store.setUid(uid)
    const dbRef = ref(getDatabase());
            get(child(dbRef, `data/users/${uid}`)).then((snapshot) => {
                if (snapshot.exists()) {
                    store.userData = snapshot.val()
                } else {
                    console.log("No data available");
                }
                }).catch((error) => {
                console.error(error);
                });
  } else {
    // No user is signed in.
    store.setSignedIn(false)
    store.userData = {}
    store.setUid('')
  }
});

</script>

<template> 
  <div :class="{ 'dark': store.theme === 'dark' }">
    <header>
      <div class="wrapper">
        <nav>
          <Navbar />
        </nav>
      </div>
    </header>
    <div class="bg-light-background dark:bg-dark-background min-h-screen">
      <RouterView />
    </div>
    </div>
</template>


<style>
</style>
