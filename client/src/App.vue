<script setup>
import { store } from './store'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import { RouterView } from 'vue-router'
import { getAuth } from "firebase/auth";
import { getDatabase, ref, child, get } from "firebase/database";
import './App.css'



const auth = getAuth()

auth.onAuthStateChanged((user) => {
  if (user) {
    store.setSignedIn(true)
    store.setAuthInit(true)
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

            get(child(dbRef, `data/usernames/${uid}`)).then((snapshot) => {
              if (snapshot.exists()) {
                const username = snapshot.val();  // Get the username value
                store.setUsername(username);  // Store the username in the store
              } else {
                console.log("No username available");
              }
            }).catch((error) => {
              console.error("Error fetching username:", error);
            });


  } else {
    // No user is signed in.
    store.setSignedIn(false)
    store.userData = {}
    store.setUid('')
    store.setUsername('');
  }
});

</script>

<template> 
  <div :class="{ 'dark': store.theme === 'dark' }" class="app-container bg-light-background dark:bg-dark-background">
    <header>
      <div class="wrapper">
        <nav>
          <Navbar />
        </nav>
      </div>
    </header>
    <div class="transition-all duration-300 bg-light-background dark:bg-dark-background min-h-screen">
      <main class="content">
        <RouterView />
      </main>
    </div>
    <Footer />
    </div>
</template>


<style>
html, body {
  height: 100%;
}

body {
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1 0 auto;
}
</style>
