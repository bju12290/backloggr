<template>
  <notification-popup ref="notificationPopup" :bg-color="notificationColor" :message="notificationMessage"></notification-popup>
  <div class="p-3 montserrat-medium text-light-text dark:text-dark-text">
    <div class="flex flex-col md:flex-row items-start md:items-center md:justify-center">
      
      <!-- Left Column for Profile Picture -->
      <div class="flex flex-col items-center w-full mt-16 md:w-1/2 md:pr-8">
        <img class="w-44 h-44 rounded-full object-cover" :src="store.userData.profile_picture ? store.userData.profile_picture : 'https://res.cloudinary.com/ddv5jvvvg/image/upload/v1705911583/defaultpfp.jpg'" alt="Profile Picture"/>
          <input class="mt-2 montserrat-regular md:w-1/2 w-full p-1 border rounded bg-light-secondary dark:bg-dark-secondary" type="file" id="profile_picture" name="profile_picture" @change="handleFileChange"/>
        <button @click="updateProfilePicture" class="mt-[1.7rem] md:w-1/2 w-full montserrat-regular shadow-md p-2 rounded-xl border-solid border-2 border-light-accent dark:border-dark-accent bg-light-accent dark:bg-dark-accent" type="submit">Update Profile Picture</button>
      </div>

      <!-- Right Column for Email and Password -->
      <div class="w-full mt-5 md:w-1/2 md:pl-8">
        <div class="mt-5">
          <label class="montserrat-bold" for="email">E-Mail</label> <hr class="border-none"/>
          <input class="md:max-w-[600px] monsterrat-regular w-full p-1 border rounded bg-light-secondary dark:bg-dark-secondary" type="text" id="email" name="email" v-model="email"/>
          <button @click="handleEmailUpdate" class="md:max-w-[600px] mt-5 w-full montserrat-regular shadow-md p-2 rounded-xl border-solid border-2 border-light-accent dark:border-dark-accent bg-light-accent dark:bg-dark-accent" type="submit">Update E-Mail</button>
        </div>
        
        <div class="mt-5">
          <label class="montserrat-bold" for="password">Password</label> <hr class="border-none"/>
          <input class="md:max-w-[600px] montserrat-regular w-full p-1 border rounded bg-light-secondary dark:bg-dark-secondary" type="password" id="password" name="password" v-model="password"/> <hr class="border-none"/>
          <label class="mt-3 montserrat-bold" for="passwordConfirm">Confirm Password</label> <hr class="border-none"/>
          <input class="md:max-w-[600px] montserrat-regular w-full p-1 border rounded bg-light-secondary dark:bg-dark-secondary" type="password" id="passwordConfirm" name="passwordConfirm" v-model="passwordConfirm"/>
          <button @click="handlePasswordUpdate" class="md:max-w-[600px] mt-5 w-full montserrat-regular shadow-md p-2 rounded-xl border-solid border-2 border-light-accent dark:border-dark-accent bg-light-accent dark:bg-dark-accent" type="submit">Update Password</button>
        </div>
      </div>

    </div>
  </div>
</template>



  
  <script setup>
  import { ref } from 'vue';
  import {Cloudinary} from "@cloudinary/url-gen";
  import {store} from '../store'
  import { getDatabase, ref as dbRef, update } from 'firebase/database';
  import { getAuth, verifyBeforeUpdateEmail, updatePassword  } from "firebase/auth";
  import NotificationPopup from '@/components/NotificationPopup.vue';

  const notificationPopup = ref(null);
  const notificationMessage = ref('')
  const notificationColor = ref('green')

const profilePictureUpdatedNotification = () => {
  notificationColor.value = 'green'
  notificationMessage.value = "Successfully Updated Profile Picture!"
  notificationPopup.value.show();
}

const emailUpdateNotification = () => {
  notificationColor.value = 'green'
  notificationMessage.value = "Email Successfully Updated!"
  notificationPopup.value.show();
}

const passwordUpdateNotification = () => {
  notificationColor.value = 'green'
  notificationMessage.value = "Password Successfully Updated!"
  notificationPopup.value.show();
}

const updateErrorNotification = (error) => {
  notificationMessage.value = "An error occured! Please try again! Error Message: " + error
  if (error === 'Firebase: Error (auth/requires-recent-login).') {
    notificationMessage.value = "Recent authentication is required for an email/password update! Please try logging out, and logging in again!"
  }
  if (error === 'Firebase: Error (auth/missing-new-email).') {
    notificationMessage.value = "Please enter a new e-mail address to update to!"
  }
  if (error === "No Match") {
    notificationMessage.value = "Password don't match!"
  }
  notificationColor.value = "red"
  notificationPopup.value.show();
}
  
  const auth = getAuth();

  const cld = new Cloudinary({cloud: {cloudName: '<ddv5jvvvg>',},});
  
  const email = ref('')
  const password = ref('')
  const passwordConfirm = ref('')
  
  let selectedProfilePicture = null;

const handleFileChange = (event) => {
  selectedProfilePicture = event.target.files[0];
};

const updateProfilePicture = async () => {
  try {
    const url = 'https://api.cloudinary.com/v1_1/ddv5jvvvg/image/upload'; // Replace with your Cloudinary cloud name
    const uploadPreset = 'vg-collection-tracker-pfps'; // Replace with your Cloudinary upload preset

    const formData = new FormData();
    formData.append('file', selectedProfilePicture);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Error uploading profile picture to Cloudinary');
    }

    const cloudinaryData = await response.json();
    console.log('Uploaded Profile Picture URL:', cloudinaryData.url);

    // Update Firebase Realtime Database with the Cloudinary URL
    const db = getDatabase();
    const userRef = dbRef(db, `data/users/${store.uid}`);
    
    await update(userRef, {
      profile_picture: cloudinaryData.url,
    });

    console.log('Firebase Realtime Database updated successfully.');
    profilePictureUpdatedNotification()

  } catch (error) {
    console.error('Error uploading profile picture to Cloudinary:', error.message);
    updateErrorNotification(error)
  }
};

const handleEmailUpdate = async () => {
  const newEmail = email.value; // Replace with the new email you want to set
  const actionCodeSettings = {
    url: 'https://vgtracky.page.link/NLtk/?email=' + newEmail,
    iOS: {
      bundleId: 'com.example.ios'
    },
    android: {
      packageName: 'com.example.android',
      installApp: true,
      minimumVersion: '12'
    },
    handleCodeInApp: true
  };

  try {
    // Send a verification email to the new email address
    await verifyBeforeUpdateEmail(auth.currentUser, newEmail, actionCodeSettings);
    // Prompt the user to check their email for the verification link

    // You can provide a user-friendly message here to inform the user to check their email.
    emailUpdateNotification()
  } catch (error) {
    // Handle any errors that occurred during the verification process
    console.error(error.message);
    // You can display an error message to the user
    updateErrorNotification(error.message)
  }
};

const handlePasswordUpdate = () => {
  console.log('Updating password:', password.value);
  if (password.value !== passwordConfirm.value) {
    console.log("Passwords do not match!")
    updateErrorNotification("No Match")
    return
  }
  updatePassword(auth.currentUser, passwordConfirm.value)
  .then(() => {
    console.log("Password update successful!")
    passwordUpdateNotification()
  }).catch((error) => {
    console.log("An error occured while updating password", error)
    updateErrorNotification(error)
  })
};
  </script>
  