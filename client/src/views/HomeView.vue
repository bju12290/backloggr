<script>
  import { store } from '../store.js'
  import { Swiper, SwiperSlide } from 'swiper/vue';
  import { Autoplay, EffectFade } from 'swiper/modules';
    import 'swiper/css';
    import 'swiper/css/effect-fade';

    export default {
    components: {
      Swiper,
      SwiperSlide,
    },
    setup() {
      return {
        modules: [EffectFade, Autoplay],
        store
      };
    },
  };
</script>

<template>
  <div class="header-animation flex lg:flex-row flex-col">
    <div class="lg:ml-5 lg:w-1/2 h-96 lg:h-screen flex justify-center items-center">
      <div class="text-center flex flex-col justify-center items-center">
        <h1 class="dark:text-dark-text titillium-web-black md:text-8xl text-6xl">Welcome to 
          <span class="jittery-text"><span>Backloggr</span></span>
        </h1>
        <div class="text-center flex flex-col justify-center items-center" v-if="store.signedIn">
          <router-link to="/collectionmanager/"><button class="hover:scale-105 transition-all duration-500 text-lg rounded mt-10 w-1/2 w-[270px] h-[45px] titillium-web-bold bg-light-accent">Collection Manager</button></router-link>
          <router-link to="/search"><button class="hover:scale-105 transition-all duration-500 text-md rounded mt-3 w-1/3 w-[230px] h-[35px] titillium-web-semibold bg-light-primary dark:bg-dark-primary">Search Games</button></router-link>
        </div>
        <div class="text-center flex flex-col justify-center items-center" v-else>
          <router-link to="/signup/"><button class="hover:scale-105 transition-all duration-500 text-lg rounded mt-10 w-1/2 w-[270px] h-[45px] titillium-web-bold bg-light-accent">Sign Up</button></router-link>
          <router-link to="/login/"><button class="hover:scale-105 transition-all duration-500 text-md rounded mt-3 w-1/3 w-[230px] h-[35px] titillium-web-bold bg-light-primary dark:bg-dark-primary">Login</button></router-link>
        </div>
      </div>
    </div>
    <div class="lg:mr-5 lg:w-1/2 h-96 lg:h-screen flex justify-center items-center flex-col">
      <h1 class="dark:text-dark-text titillium-web-black md:text-6xl text-4xl">How it Works</h1>
      <div class="w-1/2 flex justify-center items-center text-center">
        <swiper
          :loop="true"
          :grabCursor="true"
          :effect="'fade'"
          :fadeEffect="{
            crossFade: true
          }"
          :autoplay="{
            delay: 2500,
            disableOnInteraction: false,
          }"
          :modules="modules"
        >
          <swiper-slide>
            <div class="flex flex-col md:flex-row justify-center items-center w-1/2">
              <h2 class="text-2xl md:text-3xl titillium-web-bold dark:text-dark-text">Add Your Games</h2>
              <img src="https://res.cloudinary.com/ddv5jvvvg/image/upload/v1708899413/light_add_games_nc1czn.png"/>
            </div>
          </swiper-slide>
          <swiper-slide>
            <div class="flex flex-col md:flex-row justify-center items-center w-1/2">
              <h2 class="text-2xl md:text-3xl titillium-web-bold dark:text-dark-text">Organize With Ease</h2>
              <img src="https://res.cloudinary.com/ddv5jvvvg/image/upload/v1708899414/light_organize_games_lj0fja.png"/>
            </div>
          </swiper-slide>
          <swiper-slide>
            <div class="flex flex-col md:flex-row justify-center items-center w-1/2">
              <h2 class="text-2xl titillium-web-bold dark:text-dark-text">Get Game Suggestions</h2>
              <img src="https://res.cloudinary.com/ddv5jvvvg/image/upload/v1708899414/light_game_recommendations_u0ier6.png"/>
            </div>
          </swiper-slide>
          <swiper-slide>
            <div class="flex flex-col md:flex-row justify-center items-center w-1/2">
              <h2 class="text-2xl md:text-3xl titillium-web-bold dark:text-dark-text">Clear Your Backlog</h2>
              <img src="https://res.cloudinary.com/ddv5jvvvg/image/upload/v1708899504/Untitled_design_1_lhmozg.png"/>
            </div>
          </swiper-slide>
        </swiper>
      </div>
    </div>
  </div>
</template>

<style>

.swiper-slide {
  display: flex;
  justify-content: center;
  align-items: center;
}

.swiper {
  width: 100%;
  height: 100%;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.header-animation {
  animation: fadeIn 2s ease-out forwards;
}

@keyframes jitter {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-1px, -1px); }
  20% { transform: translate(-1px, 1px); }
  30% { transform: translate(1px, 1px); }
  40% { transform: translate(1px, -1px); }
  50% { transform: translate(0px, 2px); }
  60% { transform: translate(-1px, 0px); }
  70% { transform: translate(1px, 1px); }
  80% { transform: translate(-1px, -1px); }
  90% { transform: translate(1px, 0px); }
}

.jittery-text span {
  display: inline-block;
  transition: transform 0.3s; 
}

.jittery-text:hover span {
  animation: jitter 0.3s infinite;
}
</style>
