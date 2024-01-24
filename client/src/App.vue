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
  <header>
    <div class="wrapper">
      <nav>
        <Navbar />
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style>
:root[data-theme="light"] {
  --text: #0c0d0d;
  --background: #f3f5f6;
  --primary: #628ba7;
  --secondary: #97bad3;
  --accent: #6ba7d1;
}
:root[data-theme="dark"] {
  --text: #f2f3f3;
  --background: #090b0c;
  --primary: #58819d;
  --secondary: #2c4f68;
  --accent: #2e6994;
}
</style>
