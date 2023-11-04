<script setup>
import { store } from './store'
import Navbar from './components/Navbar.vue'
import { RouterView } from 'vue-router'
import { getAuth } from "firebase/auth";
import { getDatabase, ref, child, get } from "firebase/database";
import router from './router';

const auth = getAuth()

auth.onAuthStateChanged((user) => {
  if (user) {
    store.setSignedIn(true)
    const uid = user.uid
    const dbRef = ref(getDatabase());
            get(child(dbRef, `data/users/${uid}`)).then((snapshot) => {
                if (snapshot.exists()) {
                    store.userData = snapshot.val()
                    console.log(store.userData)
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
