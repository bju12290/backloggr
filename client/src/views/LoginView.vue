<script>
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import NotificationPopup from '@/components/NotificationPopup.vue';

const auth = getAuth();

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
      forgotPassword: false,
    };
  },
  methods: {
    handleEmail(event) {
      this.email = event.target.value;
    },
    handlePass(event) {
      this.password = event.target.value;
    },
    handleSignIn() {
      signInWithEmailAndPassword(auth, this.email, this.password)
        .then((userCredential) => {
          // Signed in
          this.$router.push({ name: 'collection-manager' });
        })
        .catch((error) => {
          // Error handling
          console.log(error)
          this.notificationMessage = this.getErrorMessage(error.code)
          this.notificationColor = 'red';
          if (this.$refs.notificationPopup) {
                this.$refs.notificationPopup.show(); 
            }
        });
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
            default:
                return 'An error occurred. Please try again.';
        }
    },
    setForgot() {
      this.forgotPassword === true ? this.forgotPassword = false : this.forgotPassword = true
    },
    async handleForgottenPassword() {
      try {
        await sendPasswordResetEmail(auth, this.email);
        // If successful, set a success message
        this.notificationMessage = "Success! Check your email for password reset instructions.";
        this.notificationColor = 'green'; // Assuming you want to show success messages in green
      } catch (error) {
        // If an error occurs, use the getErrorMessage function to set the notification message
        this.notificationMessage = this.getErrorMessage(error.code);
        this.notificationColor = 'red'; // Errors in red
      } finally {
        // Show the notification popup regardless of success or failure
        if (this.$refs.notificationPopup) {
          this.$refs.notificationPopup.show();
        }
      }
    },
  },
};
</script>

<template>
  <notification-popup ref="notificationPopup" :bg-color="notificationColor" :message="notificationMessage"></notification-popup>
  <div v-if="forgotPassword">
    <div class="flex justify-center">
        <form class="mt-5 w-screen max-w-screen-sm bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 justify-center">
            <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="Email">
                Email
            </label>
            <input @keyup.enter="handleSignIn" v-model="email" @input="handleEmail" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="email" type="text" placeholder="Email">
          </div>
          <div class="flex items-center justify-evenly">
          <button @click="handleForgottenPassword" class="bg-light-primary dark:bg-dark-primary text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                Send Password Reset Email
            </button>
            <a @click="setForgot" class="inline-block align-baseline font-bold text-sm text-light-accent dark:text-dark-accent" href="#">
                Back to login
            </a>
          </div>
          </form>
            </div>
          </div>
        
  <div v-else>
    <div class="montserrat-medium flex justify-center">
        <form class="mt-5 w-screen max-w-screen-sm bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 justify-center">
            <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="Email">
                Email
            </label>
            <input @keyup.enter="handleSignIn" v-model="email" @input="handleEmail" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="email" type="text" placeholder="Email">
            </div>
            <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
                Password
            </label>
            <input @keyup.enter="handleSignIn" v-model="password" @input="handlePass" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="******************">
            </div>
            <div class="flex items-center justify-evenly">
            <button @click="handleSignIn" class="bg-light-primary dark:bg-dark-primary text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                Sign In
            </button>
            <a @click="setForgot" class="inline-block align-baseline font-bold text-sm text-light-accent dark:text-dark-accent" href="#">
                Forgot Password?
            </a>
            </div>
        </form>
      </div>
</div>
</template>
  