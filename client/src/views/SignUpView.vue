<script>
import { RouterLink } from 'vue-router'
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { store } from '../store'
import { getDatabase, ref, set } from 'firebase/database';

const auth = getAuth() 

export default {
  data() {
    return {
      email: '',
      password: ''
    };
  },
  methods: {
    handleEmail(event) {
      this.email = event.target.value
      console.log(this.email)
    },
    handlePass(event) {
      this.password = event.target.value
      console.log(this.password)
    },
    handleSignUp() {
        createUserWithEmailAndPassword(auth, this.email, this.password)
            .then((userCredential) => {
            // Signed up
            store.setSignedIn(true)
            const user = userCredential.user;
            const uid = user.uid

        sendEmailVerification(auth.currentUser)
          .then(() => {
          // Email verification sent!
            console.log('Email verification sent!');
          })
          .catch((error) => {
            console.error('Error sending email verification:', error.message);
          });

            const db = getDatabase()
            set(ref(db, 'data/users/' + uid), {
                username: '',
                email: this.email,
                profile_picture : '',
                game_collection: {}
  });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            // ..
        })
    }
  },
};

</script>

<template>
    <main>
    <div class="flex justify-center">
        <form class="w-screen max-w-screen-sm bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 justify-center">
            <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="Email">
                Email
            </label>
            <input v-model="email" @input="handleEmail" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Email">
            </div>
            <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
                Password
            </label>
            <input v-model="password" @input="handlePass" class="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="******************">
            <p class="text-red-500 text-xs italic">Please choose a password.</p>
            </div>
            <div class="flex items-center justify-evenly">
            <button @click="handleSignUp" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                Sign Up
            </button>
            <RouterLink to="/login" class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
                Have an Account?
            </RouterLink>
            </div>
        </form>
</div>
    </main>
</template>