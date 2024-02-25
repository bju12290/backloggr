<template>
    <div v-if="visible" :style="{ backgroundColor: bgColor }" @click="hide" class="notification-popup roboto-regular text-centervvv">
      {{ message }}
    </div>
  </template>
  
  <script>
  export default {
    props: {
      bgColor: { // Renamed from 'color' to 'bgColor' for clarity
        type: String,
        required: true
      },
      message: {
        type: String,
        required: true
      }
    },
    data() {
      return {
        visible: false
      };
    },
    methods: {
      show() {
        this.visible = true;
        setTimeout(() => this.hide(), 3000); // Auto-hide after 3 seconds
      },
      hide() {
        this.visible = false;
      }
    },
  };
  </script>
  
  <style scoped>
  .notification-popup {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 20px;
    color: white; /* Set text color to white for better contrast */
    border-radius: 5px;
    /* Add more styling as needed */
  }
  </style>
  