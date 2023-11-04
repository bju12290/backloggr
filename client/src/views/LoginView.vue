<script>
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getDatabase, ref, child, get } from "firebase/database";
import { store } from '../store'

const provider = new GoogleAuthProvider();

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
    handleSignIn() {
        signInWithEmailAndPassword(auth, this.email, this.password)
            .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            // ...
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
        });
    },
    signinPopup() {
        signInWithPopup(auth, provider)
            .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            // IdP data available using getAdditionalUserInfo(result)
            // ...
    }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            // ...
    });
    }
  },
};

</script>

<template>
    <div class="flex justify-center">
        <form class="w-screen max-w-screen-sm bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 justify-center">
            <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="Email">
                Email
            </label>
            <input v-model="email" @input="handleEmail" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="email" type="text" placeholder="Email">
            </div>
            <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
                Password
            </label>
            <input v-model="password" @input="handlePass" class="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="******************">
            <p class="text-red-500 text-xs italic">Please choose a password.</p>
            </div>
            <div class="flex items-center justify-evenly">
            <button @click="handleSignIn" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                Sign In
            </button>
            <button @click="signinPopup" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                Sign In With Google
            </button>
            <a class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="#">
                Forgot Password?
            </a>
            </div>
        </form>
</div>
</template>
  