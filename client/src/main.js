
// -- FIREBASE INITILIZATION -- //
import { store } from './store'
import { initializeApp } from 'firebase/app'
import { VueFire, VueFireAuth } from 'vuefire'
import { getAuth, onAuthStateChanged, GoogleAuthProvider } from "firebase/auth";

export const provider = new GoogleAuthProvider()

const firebaseConfig = {
    apiKey: "AIzaSyA-Lp7iHnkrHYSXSe3O78QUtgY0hPC-PKg",
    authDomain: "video-game-collection-tracker.firebaseapp.com",
    projectId: "video-game-collection-tracker",
    storageBucket: "video-game-collection-tracker.appspot.com",
    messagingSenderId: "703733032783",
    appId: "1:703733032783:web:32e310a0af77597bdf473a",
    measurementId: "G-8KJYMPQ2G8"
  };

export const firebaseApp = initializeApp(firebaseConfig)

const app = createApp(App)
app.use(VueFire, {
    firebaseApp,
    modules: [
      VueFireAuth(),
    ],
  })

  export const auth = getAuth();
  
  // -------------------------------------------------- //

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

app.use(router)

app.mount('#app')
