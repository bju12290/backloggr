
import { initializeApp } from 'firebase/app'
import { VueFire, VueFireAuth } from 'vuefire'
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getDatabase } from 'firebase/database'
import { store } from './store.js'


export const provider = new GoogleAuthProvider()

const savedTheme = localStorage.getItem('theme') || 'light'; // Default to 'light' if nothing is saved
store.theme = savedTheme

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
};

export const firebaseApp = initializeApp(firebaseConfig)

export const db = getDatabase(firebaseApp);

const app = createApp(App) // Initializes the Vue App

app.data = {
  bgColor: '#000'
}

app.use(VueFire, {
    firebaseApp,
    modules: [
      VueFireAuth(),
    ],
  })

  export const auth = getAuth();
  

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './App.css'

app.use(router)

app.mount('#app') // Takes app instances and mounts it to the dom at the id of #app
