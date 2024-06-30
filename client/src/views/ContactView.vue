<template>
<h1 class="md:text-left text-center text-light-text dark:text-dark-text pt-16 md:pl-16 titillium-web-black text-6xl md:text-9xl">Contact</h1>
<p class="p-2 text-center md:text-left md:pr-8 md:pl-20 pt-6 text-light-text dark:text-dark-text titillium-web-semibold text-2xl">Questions, Comments, Bug Reports, or Feedback? Let me know!</p>
<div class="titillium-web-regular text-light-text dark:text-dark-text flex lg:flex-row flex-col lg:justify-between justify-center lg:mx-32 mx-8">
    <div class="flex flex-col gap-3 lg:w-1/2">
        <form @submit.prevent="submitContactForm" class="flex flex-col gap-3">
            <label class="titillium-web-bold text-lg" for="name">Name: </label>
            <input v-model="contact.name" class="placeholder:dark:text-dark-textcontrast placeholder:text-light-primary rounded-md p-1 bg-light-tertiary dark:bg-dark-secondary block" type="text" id="name"/>

            <label class="titillium-web-bold text-lg" for="email">E-mail:</label>
            <input v-model="contact.email" class="placeholder:dark:text-dark-textcontrast placeholder:text-light-primary rounded-md p-1 bg-light-tertiary dark:bg-dark-secondary block" type="text" id="email"/>

            <select v-model="contact.messageType" class="w-full w-48 p-1 rounded bg-light-tertiary dark:bg-dark-secondary">
                <option class="disabled:dark:text-dark-textcontrast disabled:text-light-primary" selected disabled>Message Type:</option>
                <option>Feedback</option>
                <option>Bug Report</option>
                <option>Question</option>
                <option>Other</option>
            </select>
            
            <label class="titillium-web-bold text-lg" for="message">Message: </label>

            <textarea v-model="contact.message" class="resize-none p-1 w-full rounded bg-light-tertiary dark:bg-dark-secondary" name="message" id="message" rows="10" cols="30"></textarea>
            <button type="submit" class="place-self-center hover:scale-105 transition-all duration-500 text-lg rounded mt-10 w-1/2 md:w-[270px] h-[45px] titillium-web-bold bg-light-accent">Send</button>
        </form>
    </div>
    <div class="flex flex-col justify-center items-center">
        <svg width="500" height="500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M26 34C26 32.8954 26.8954 32 28 32H73C74.1046 32 75 32.8954 75 34V65C75 66.1046 74.1046 67 73 67H28C26.8954 67 26 66.1046 26 65V34ZM27.4142 33.9102C27.6429 33.4075 28.2358 33.1854 28.7385 33.4142L49.9059 43.0455L71.0734 33.4142C71.576 33.1854 72.169 33.4075 72.3977 33.9102C72.6264 34.4129 72.4044 35.0058 71.9017 35.2346L49.9081 45.2418L49.9048 45.2347L49.902 45.241L27.9102 35.2346C27.4075 35.0058 27.1854 34.4129 27.4142 33.9102Z" fill="#14FFEB"/>
        </svg>
    </div>
</div>
</template>

<script>
import { getDatabase, ref as dbRef, push } from "firebase/database";

export default {
  data() {
    return {
      contact: {
        name: '',
        email: '',
        messageType: '',
        message: ''
      }
    };
  },
  methods: {
    submitContactForm() {
      if (this.validateForm()) {
        const db = getDatabase();
        const contactsRef = dbRef(db, 'contacts');
        push(contactsRef, {
          ...this.contact,
          createdAt: Date.now()
        })
        .then(() => {
          alert('Your message has been sent successfully!');
          this.resetForm();
        })
        .catch((error) => {
          console.error("Error submitting contact form: ", error);
          alert('There was an issue sending your message. Please try again.');
        });
      } else {
        alert('Please fill in all fields correctly.');
      }
    },
    validateForm() {
      return this.contact.name && this.contact.email && this.contact.messageType && this.contact.message;
    },
    resetForm() {
      this.contact = {
        name: '',
        email: '',
        messageType: '',
        message: ''
      };
    }
  }
}
</script>