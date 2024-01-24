<template>
    <div>
        <form @submit.prevent="updateProfilePicture">
            <label for="profile_picture">Profile Picture</label>
            <!-- Use type="file" for file input -->
            <input type="file" id="profile_picture" name="profile_picture" @change="handleFileChange"/> <hr/>
            <button type="submit">Update Profile Picture</button>
        </form>
    </div>
    <div>
        <form @submit.prevent="handleEmailUpdate">
            <label for="email">E-Mail</label>
            <input type="text" id="email" name="email" v-model="email"/>
            <button type="submit">Update E-Mail</button>
        </form>
    </div>
    <div>
        <form @submit.prevent="handlePasswordUpdate">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" v-model="password"/>

            <label for="passwordConfirm">Confirm Password</label>
            <input type="password" id="passwordConfirm" name="passwordConfirm" v-model="passwordConfirm"/>
            <button type="submit">Update Password</button>
        </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import {Cloudinary} from "@cloudinary/url-gen";
  import {store} from '../store'
  import { getDatabase, ref as dbRef, update } from 'firebase/database';
  import { getAuth, verifyBeforeUpdateEmail, updatePassword  } from "firebase/auth";
  
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

  } catch (error) {
    console.error('Error uploading profile picture to Cloudinary:', error.message);
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

  } catch (error) {
    // Handle any errors that occurred during the verification process
    console.error('Error sending verification email:', error.message);
    // You can display an error message to the user
  }
};

const handlePasswordUpdate = () => {
  console.log('Updating password:', password.value);
  if (password.value !== passwordConfirm.value) {
    console.log("Passwords do not match!")
    return
  }
  updatePassword(auth.currentUser, passwordConfirm.value)
  .then(() => {
    console.log("Password update successful!")
  }).catch((error) => {
    console.log("An error occured while updating password", error)
  })
};
  </script>
  