<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getDatabase, ref as dbRef, get, onChildChanged } from "firebase/database";
import { fetchGameImage } from '../utils/utils.js'
import AOS from 'aos';
import 'aos/dist/aos.css';
import ClipLoader from 'vue-spinner/src/ClipLoader.vue'

const route = useRoute();
const database = getDatabase();

const uid = ref('');
const gameCollection = ref({});
const userName = ref('');
const userProfilePicture = ref('')

const statusCounts = computed(() => {
  const counts = {
    'playing': 0,
    'completed': 0,
    'backlog': 0,
    'dropped': 0,
    'never-played': 0
  };

  if (gameCollection.value && typeof gameCollection.value === 'object') {
    Object.values(gameCollection.value).forEach(game => {
      if (game.game_status && counts.hasOwnProperty(game.game_status.toLowerCase())) {
        counts[game.game_status.toLowerCase()]++;
      }
    });
  }
  return counts;
});

onMounted(async () => {
  AOS.init();
  try {
    uid.value = route.params.uid; // Retrieve UID from route parameters
    console.log('UID:', uid.value);
    
    // Ensure that the database reference is created after the UID is available
    const userGameCollectionRef = dbRef(database, `data/users/${uid.value}/game_collection`);
    const userNameRef = dbRef(database, `data/users/${uid.value}/username`)
    const userProfilePictureRef = dbRef(database, `data/users/${uid.value}/profile_picture`)

    get(userNameRef).then((snapshot) => {
        if (snapshot.exists()) {
            userName.value = snapshot.val()
            console.log('Username:', userName.value)
        } else {
            console.log("No data available.")
        }
    })

    get(userProfilePictureRef).then((snapshot) => {
        if (snapshot.exists()) {
            userProfilePicture.value = snapshot.val()
            console.log('User PFP:', userProfilePicture.value)
        } else {
            console.log("No data available.")
        }
    })

    get(userGameCollectionRef).then((snapshot) => {
      if (snapshot.exists()) {
        gameCollection.value = snapshot.val();
        console.log('Game Collection:', gameCollection.value);
      } else {
        console.log("No data available");
      }
    }).then(() => {
        fetchImages(gameCollection.value)
    }).catch((error) => {
      console.error('Error reading game collection:', error);
    });
  } catch (error) {
    console.error('Failed to fetch User Info:', error);
  }
});

const fetchImages = async (gameCollection) => {
    for (const game in gameCollection) {
        try {
            console.log(gameCollection[game].game_name)
            // Wait for the image fetch to complete
            const gameImage = await fetchGameImage(null, gameCollection[game].game_name);
            console.log(gameImage)
            gameCollection[game] = {
            ...gameCollection[game],
            imageLoaded: true,
            image: gameImage
            }

            console.log(gameCollection[game])
        } catch (error) {
            // Handle any errors that occur during fetch
            console.error(`Error loading image for game ID ${gameCollection[game]}:`, error);
            gameCollection[game].imageLoaded = false;
        }
    }
}
</script>

<template>
    <div class="w-full p-5">
        <div class="p-5 bg-light-primary dark:bg-dark-primary rounded-md flex flex-col md:flex-row justify-between">
            <div class="flex flex-col items-left text-center">
                <img class="rounded-full max-w-[300px]" :src="userProfilePicture"/>
                <p class="text-light-text dark:text-dark-text titillium-web-black text-5xl">{{ userName}}</p>
            </div>
            <div class="pt-16 md:pt-0 flex flex-col md:flex-row w-full md:justify-evenly md:pr-32 text-center text-light-text dark:text-dark-text titillium-web-black">
                <div class="gap-5 flex flex-col text-5xl justify-center">
                    <p>Total Games</p>
                    <p>{{ Object.keys(gameCollection).length }}</p>
                </div>
                <div class="pt-16 md:pt-0 gap-5 flex flex-col text-xl justify-center">
                    <p>Playing</p>
                    <p>{{ statusCounts.playing }}</p>
                    <p>Completed</p>
                    <p>{{ statusCounts.completed }}</p>
                    <p>Backlog</p>
                    <p>{{ statusCounts.backlog }}</p>
                </div>
                <div class="gap-5 flex flex-col text-xl justify-center">
                    <p>Dropped</p>
                    <p>{{ statusCounts.dropped }}</p>
                    <p>Never Played</p>
                    <p>{{ statusCounts['never-played'] }}</p>
                </div>
            </div>
        </div>
        <div class="text-light-text dark:text-dark-text grid lg:grid-cols-3 gap-4 pt-5">
        <div class="" v-for="(game, key) in gameCollection">
            <div class="rounded shadow-xl bg-light-primary dark:bg-dark-primary/50 p-4" data-aos="fade-up">
                <div class="flex flex-row">
                    <div class="min-h-[160px] max-h-[160px] min-w-[106.66px] max-w-[106.66px]">
                        <router-link :to="'/game/' + key">
                            <img v-if="game.imageLoaded" :src="game.image || 'https://res.cloudinary.com/ddv5jvvvg/image/upload/v1699694058/no_cover_img_t5agly.jpg'" alt="Game Cover" class="rounded hover:scale-105 transition-all duration-500 cursor-pointer max-w-none min-h-40 max-h-40" />
                            <div v-else class="flex justify-center content-center">
                                <clip-loader color="#14FFEB" size="90px"></clip-loader>
                            </div>
                        </router-link>
                    </div>
                    <div class="flex justify-between w-full">
                        <div class="p-2 flex flex-col gap-1">
                                <p class="text-xl line-clamp-1 titillium-web-bold">{{ game.game_name }}</p>
                                <p class="line-clamp-1 titillium-web-semibold">First Release</p>
                                <p class="titillium-web-light text-sm">{{  game.release_year }}</p>
                                <p class="line-clamp-1 titillium-web-semibold">Review Score</p>
                                <p class="line-clamp-1 titillium-web-light text-sm">{{ game.popularity ? game.popularity?.toFixed(2) : "No Rating Found" }}</p>
                            </div>
                            <div class="p-2 pt-3 flex flex-col gap-1">
                                <p class="line-clamp-1 titillium-web-semibold">Status</p>
                                <p class="line-clamp-1 titillium-web-light text-sm">{{ game.game_status.charAt(0).toUpperCase() + game.game_status.slice(1)}} </p>
                                <p class="line-clamp-1 titillium-web-semibold">Platform</p>
                                <p class="line-clamp-1 titillium-web-light text-sm">{{ game.platform.abbreviation }} </p>
                            </div>
                        </div>
                    </div>
            </div>
        </div>
        </div>
    </div>
</template>