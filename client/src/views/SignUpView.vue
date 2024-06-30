<script>
import { RouterLink } from 'vue-router'
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { store } from '../store'
import { getDatabase, ref, set } from 'firebase/database';
import NotificationPopup from '@/components/NotificationPopup.vue';

const auth = getAuth() 

export default {
  components: {
    NotificationPopup,
  },
  data() {
    return {
      email: '',
      password: '',
      notificationMessage: '',
      notificationColor: 'green',
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
    getErrorMessage(errorCode) {
        switch (errorCode) {
            case 'auth/invalid-email':
                return 'Invalid email address.';
            case 'auth/user-disabled':
                return 'This user has been disabled.';
            case 'auth/missing-password':
                return 'Password field cannot be blank!'
            case 'auth/invalid-login-credentials':
                return 'Incorrect username or password.';
            case 'auth/missing-email':
              return 'Email field cannot be blank!'
            case 'auth/email-already-in-use':
              return 'Email address already in use!'
            default:
                return 'An error occurred. Please try again.';
        }
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
          this.notificationMessage = "Verification email sent! Check your inbox!"
          this.notificationColor = 'green';
          if (this.$refs.notificationPopup) {
                this.$refs.notificationPopup.show(); 
            }
          this.$router.push({ name: 'collection-manager' });
        })
        .catch((error) => {
          console.error('Error sending email verification:', error.message);
          this.notificationMessage = this.getErrorMessage(error.code)
          this.notificationColor = 'red';
          if (this.$refs.notificationPopup) {
              this.$refs.notificationPopup.show(); 
          }
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
          console.log(errorCode, errorMessage)
          this.notificationMessage = this.getErrorMessage(error.code)
          this.notificationColor = 'red';
          if (this.$refs.notificationPopup) {
              this.$refs.notificationPopup.show(); 
          }
      })
    }
  },
};

</script>

<template>
    <main>
      <notification-popup ref="notificationPopup" :bg-color="notificationColor" :message="notificationMessage"></notification-popup>
    <div class="montserrat-medium flex justify-center">
        <form class="mt-5 w-screen max-w-screen-sm bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 justify-center">
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
            <input v-model="password" @input="handlePass" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="******************">
            </div>
            <div class="flex items-center justify-evenly">
            <button @click="handleSignUp" class="bg-light-primary dark:bg-dark-primary text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:scale-105 transition-all duration-500" type="button">
                Sign Up
            </button>
            <RouterLink to="/login" class="inline-block align-baseline font-bold text-sm text-light-accent dark:text-dark-accent">
                Have an Account?
            </RouterLink>
            </div>
        </form>
</div>
    </main>
</template>