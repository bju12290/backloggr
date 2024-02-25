<script>
  import {store} from '../store.js'
  import { Swiper, SwiperSlide } from 'swiper/vue';
  import { Autoplay, EffectCreative } from 'swiper/modules';
    import 'swiper/css';
    import 'swiper/css/effect-creative';
    import 'swiper/css/pagination';

    export default {
    components: {
      Swiper,
      SwiperSlide,
    },
    setup() {
      return {
        modules: [EffectCreative, Autoplay],
      };
    },
  };
</script>

<template>
  <div class="flex lg:flex-row flex-col">
    <div class="lg:w-1/2 h-screen flex justify-center items-center">
      <div class="text-center flex flex-col justify-center items-center">
        <h1 class="dark:text-dark-text titillium-web-black md:text-8xl text-6xl">Welcome to Backloggr</h1>
        <button class="text-lg rounded mt-10 w-1/2 md:w-[270px] h-[45px] titillium-web-bold bg-light-accent">Sign Up</button>
        <button class="text-md rounded mt-3 w-1/3 md:w-[230px] h-[35px] titillium-web-bold bg-light-primary dark:bg-dark-primary">Login</button>
      </div>
    </div>
    <div class="lg:w-1/2 h-screen flex justify-center items-center flex-col">
      <h1 class="dark:text-dark-text titillium-web-black md:text-6xl text-4xl">How it Works</h1>
      <div class="w-1/2 flex justify-center items-center text-center">
        <swiper
          :grabCursor="true"
          :effect="'creative'"
          :autoplay="{
            delay: 2500,
            disableOnInteraction: false,
          }"
          :creativeEffect="{
            prev: {
              shadow: true,
              translate: [0, 0, -800],
              rotate: [180, 0, 0],
            },
            next: {
              shadow: true,
              translate: [0, 0, -800],
              rotate: [-180, 0, 0],
            },
          }"
          :modules="modules"
          class="mySwiper4"
        >
          <swiper-slide>
            <div class="flex flex-row justify-center items-center w-1/2">
              <h2 class="text-3xl titillium-web-bold dark:text-dark-text">Add Your Games</h2>
              <img src="https://res.cloudinary.com/ddv5jvvvg/image/upload/v1708819696/light_add_games_m9ithf.png"/>
            </div>
          </swiper-slide>
          <swiper-slide>
            <div class="flex flex-row justify-center items-center w-1/2">
              <h2 class="text-3xl titillium-web-bold dark:text-dark-text">Organize With Ease</h2>
              <img src="https://res.cloudinary.com/ddv5jvvvg/image/upload/v1708819697/light_organize_games_smpemn.png"/>
            </div>
          </swiper-slide>
          <swiper-slide>
            <div class="flex flex-row justify-center items-center w-1/2">
              <h2 class="text-3xl titillium-web-bold dark:text-dark-text">Clear Your Backlog</h2>
              <img src="https://res.cloudinary.com/ddv5jvvvg/image/upload/v1708819696/light_game_recommendations_nuutpr.png"/>
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
  height: 300px !important;
}

.swiper {
  width: 100%;
  height: 100%;
}

.swiper-slide img {
  display: block;
  width: 100%;
}
</style>
