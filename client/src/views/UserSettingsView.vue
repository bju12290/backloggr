<template>
  <notification-popup ref="notificationPopup" :bg-color="notificationColor" :message="notificationMessage"></notification-popup>
  <div class="p-3 titillium-web-medium text-light-text dark:text-dark-text">
    <div class="flex flex-col md:flex-row items-start md:items-center md:justify-center">
      
      <!-- Left Column for Profile Picture -->
      <div class="flex flex-col items-center w-full mt-16 md:w-1/2 md:pr-8">
        <img class="w-44 h-44 rounded-full object-cover" :src="store.userData.profile_picture ? store.userData.profile_picture : 'https://res.cloudinary.com/ddv5jvvvg/image/upload/v1705911583/defaultpfp.jpg'" alt="Profile Picture"/>
        <div class="w-full md:w-1/2">
          <label class="titillium-web-bold" for="username">Profile Picture</label> <hr class="border-none"/>
          <input class="mt-2 titillium-web-regular w-full p-1 rounded bg-light-secondary dark:bg-dark-secondary
          file:bg-light-accent dark:file:bg-dark-accent file:border file:border-none file:rounded file:opacity-60 file:text-dark-primary
          " type="file" id="profile_picture" name="profile_picture" @change="handleFileChange"/>
        </div>
          <div class="w-full md:w-1/2">
            <label class="titillium-web-bold" for="username">Username</label> <hr class="border-none"/>
            <input class="mt-2 titillium-web-regular w-full p-1 rounded bg-light-secondary dark:bg-dark-secondary
            file:bg-light-accent dark:file:bg-dark-accent file:border file:border-none file:rounded file:opacity-60 file:text-dark-primary
            " type="text" id="username" name="username" v-model="username"/>
          </div>
          <button @click="updateProfilePicture" class="text-dark-primary mt-[1.7rem] md:w-1/2 w-full titillium-web-regular shadow-md p-2 rounded-xl border-solid border-2 border-light-accent dark:border-dark-accent bg-light-accent dark:bg-dark-accent" type="submit">Update Profile</button>
      </div>

      <!-- Right Column for Email and Password -->
      <div class="w-full mt-[6.5rem] md:w-1/2 md:pl-8">
        <div class="mt-5">
          <label class="titillium-web-bold" for="email">E-Mail</label> <hr class="border-none"/>
          <input class="md:max-w-[600px] monsterrat-regular w-full p-1 rounded bg-light-secondary dark:bg-dark-secondary" type="text" id="email" name="email" v-model="email"/>
          <button @click="handleEmailUpdate" class="text-dark-primary md:max-w-[600px] mt-5 w-full titillium-web-regular shadow-md p-2 rounded-xl bg-light-accent dark:bg-dark-accent border-solid border-2 border-light-accent dark:border-dark-accent" type="submit">Update E-Mail</button>
        </div>
        
        <div class="mt-5">
          <label class="titillium-web-bold" for="password">Password</label> <hr class="border-none"/>
          <input class="md:max-w-[600px] titillium-web-regular w-full p-1 rounded bg-light-secondary dark:bg-dark-secondary" type="password" id="password" name="password" v-model="password"/> <hr class="border-none"/>
          <label class="mt-3 titillium-web-bold" for="passwordConfirm">Confirm Password</label> <hr class="border-none"/>
          <input class="md:max-w-[600px] titillium-web-regular w-full p-1 rounded bg-light-secondary dark:bg-dark-secondary" type="password" id="passwordConfirm" name="passwordConfirm" v-model="passwordConfirm"/>
          <button @click="handlePasswordUpdate" class="text-dark-primary md:max-w-[600px] mt-5 w-full titillium-web-regular shadow-md p-2 rounded-xl bg-light-accent dark:bg-dark-accent border-solid border-2 border-light-accent dark:border-dark-accent" type="submit">Update Password</button>
        </div>
      </div>

    </div>
  </div>
</template>



  
  <script setup>
  import { ref } from 'vue';
  import {Cloudinary} from "@cloudinary/url-gen";
  import {store} from '../store'
  import { getDatabase, ref as dbRef, update, get, set } from 'firebase/database';
  import { getAuth, verifyBeforeUpdateEmail, updatePassword  } from "firebase/auth";
  import NotificationPopup from '@/components/NotificationPopup.vue';

  const notificationPopup = ref(null);
  const notificationMessage = ref('')
  const notificationColor = ref('green')

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

const customUpdateNotification = (color, message) => {
  notificationColor.value = color
  notificationMessage.value = message
  notificationPopup.value.show()
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
  const username = ref('')
  
  let selectedProfilePicture = null;

const handleFileChange = (event) => {
  selectedProfilePicture = event.target.files[0];
};

const updateProfilePicture = async () => {
  try {
    let imageUpdated = false;
    let userNameUpdated = false;
    const url = 'https://api.cloudinary.com/v1_1/ddv5jvvvg/image/upload'; // Replace with your Cloudinary cloud name
    const uploadPreset = 'vg-collection-tracker-pfps'; // Replace with your Cloudinary upload preset

    const formData = new FormData();
    formData.append('file', selectedProfilePicture);
    formData.append('upload_preset', uploadPreset);
    if (formData.length > 0) {
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

      imageUpdated = true;
      console.log('Firebase Realtime Database updated successfully.');
      }
    
      if (username.value.length > 0) {
        updateUsername(store.uid, username.value)
        userNameUpdated = true
      }

    if (userNameUpdated && imageUpdated) {
      customUpdateNotification("green", "Profile Picture and Username Updated!")
    }

    if (userNameUpdated && !imageUpdated) {
      customUpdateNotification("green", "Username Updated!")
    }

    if (!userNameUpdated && imageUpdated) {
      customUpdateNotification("green", "Profile Picture Updated!")
    }

    if (!userNameUpdated && !imageUpdated) {
      customUpdateNotification("red", "No info was updated, did you include a file and/or a username?")
    }

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


const updateUsername = async (uid, newUsername) => {
  try {
    if (newUsername.length > 0) {
      const db = getDatabase();
      const usernameRef = dbRef(db, `data/usernames/${uid}`);

      // Get all usernames to check for uniqueness
      const allUsernamesRef = dbRef(db, 'data/usernames');
      const allUsernamesSnap = await get(allUsernamesRef);
      let isUsernameTaken = false;
      
      allUsernamesSnap.forEach((childSnapshot) => {
        if (childSnapshot.val() === newUsername && childSnapshot.key !== uid) {
          isUsernameTaken = true;
        }
      });

      if (isUsernameTaken) {
        console.log('Username is already taken.');
        customUpdateNotification("red", "Username is taken!")
        return;
      }

      // Set the new username for the user
      await set(usernameRef, newUsername);
      console.log('Firebase Realtime Database updated successfully with new username.');
    }
  } catch (error) {
    console.error('Error updating username:', error.message);
    updateErrorNotification(error);
  }
};
</script>