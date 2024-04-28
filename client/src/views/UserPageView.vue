<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getDatabase, ref as dbRef, get, onChildChanged } from "firebase/database";
import { fetchGameImage } from '../utils/utils.js'
import AOS from 'aos';
import 'aos/dist/aos.css';
import ClipLoader from 'vue-spinner/src/ClipLoader.vue'
import GridLoader from 'vue-spinner/src/GridLoader.vue'
import * as d3 from 'd3';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { trueColor } from '@cloudinary/url-gen/qualifiers/colorSpace';

const route = useRoute();
const database = getDatabase();
const modules = [Pagination, EffectFade]

const uid = ref('');
const gameCollection = ref({});
const userName = ref('');
const userProfilePicture = ref('')
const isUserPfpLoading = ref(true)
const isUsernameLoading = ref(true)
const isCollectionLoading = ref(true)
const areAllImagesLoaded = ref(false)

const d3StatusPieContainer = ref(null)
const d3PlatformsPieContainer = ref(null)
const d3GenresPieContainer = ref(null)
const platformThemeColors = ['#0b1719','#25545b','#2b6169','#33747d','#3b8791','#4aa9b5','#5ab3be','#65bac4','#73c3cd','#7fcbd4','#a2e1e9']

const isLoading = computed(() => {
  if (isUserPfpLoading.value || isUserPfpLoading.value || isCollectionLoading.value) {
    return true
  } else {
    return false
  }
})

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

const platformCounts = computed(() => {
  if (!gameCollection.value || typeof gameCollection.value !== 'object') {
    return {}; // Return an empty object if gameCollection.value is null or not an object
  }

  const platformSet = new Set();
  Object.values(gameCollection.value).forEach(game => {
    if (game.platform && game.platform.abbreviation) {
      platformSet.add(game.platform.abbreviation);
    }
  });

  // Initialize counts for each platform
  const counts = {};
  platformSet.forEach(platform => {
    counts[platform] = 0;  // Initialize each platform count to zero
  });

  // Second pass to count each occurrence
  Object.values(gameCollection.value).forEach(game => {
    if (game.platform && game.platform.abbreviation && counts.hasOwnProperty(game.platform.abbreviation)) {
      counts[game.platform.abbreviation]++;
    }
  });
  console.log(counts)
  return counts;
});

const genreCounts = computed(() => {
  if (!gameCollection.value || typeof gameCollection.value !== 'object') {
    return {}; // Return an empty object if gameCollection.value is null or not an object
  }

  const genreSet = new Set();
  // First pass to collect unique genres
  Object.values(gameCollection.value).forEach(game => {
    if (game.genre) {
      genreSet.add(game.genre);  // Assume genre is a string and directly addable to the set
    }
  });

  // Initialize counts for each genre
  const counts = {};
  genreSet.forEach(genre => {
    counts[genre] = 0;  // Initialize each genre count to zero
  });

  // Second pass to count each occurrence
  Object.values(gameCollection.value).forEach(game => {
    if (game.genre && counts.hasOwnProperty(game.genre)) {
      counts[game.genre]++;
    }
  });
  console.log(counts)
  return counts;
});

watch(statusCounts, (newCounts) => {
  const formattedData = Object.entries(newCounts).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1), // Capitalize first letter
    count
  }));
  drawPieChart(formattedData, d3StatusPieContainer.value);
});

watch(platformCounts, (newCounts) => {
  const formattedData = Object.entries(newCounts).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1), // Capitalize first letter
    count
  }));
  drawPieChart(formattedData, d3PlatformsPieContainer.value);
});

watch(genreCounts, (newCounts) => {
  const formattedData = Object.entries(newCounts).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1), // Capitalize first letter
    count
  }));
  drawPieChart(formattedData, d3GenresPieContainer.value);
});

onMounted(async () => {
  AOS.init();
  try {
    userName.value = route.params.username; // Retrieve username from route parameters
    console.log('Username:', userName.value);
    
    // Fetch UID based on the username
    const usernamesRef = dbRef(database, `data/usernames`);
    get(usernamesRef).then((snapshot) => {
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          if (childSnapshot.val() === userName.value) {
            uid.value = childSnapshot.key;
            console.log('UID:', uid.value);

            // Fetch user data after retrieving UID
            fetchUserData(uid.value);
          }
        });
      } else {
        console.log("Username does not exist.");
      }
    }).catch((error) => {
      console.error('Error fetching UID by username:', error);
    });
  } catch (error) {
    console.error('Failed to initialize user page:', error);
  }
});

function fetchUserData(uid) {
  const userGameCollectionRef = dbRef(database, `data/users/${uid}/game_collection`);
  const userProfilePictureRef = dbRef(database, `data/users/${uid}/profile_picture`);

  // Username already loaded, no need to fetch again
  isUsernameLoading.value = false;

  get(userProfilePictureRef).then((snapshot) => {
    if (snapshot.exists()) {
      userProfilePicture.value = snapshot.val();
      console.log('User PFP:', userProfilePicture.value);
    } else {
      console.log("Profile picture not available.");
    }
  }).finally(() => {
    isUserPfpLoading.value = false
  });

  get(userGameCollectionRef).then((snapshot) => {
    if (snapshot.exists()) {
      gameCollection.value = snapshot.val();
      console.log('Game Collection:', gameCollection.value);
      fetchImages(gameCollection.value); // Assuming this function exists
      drawPieChart(statusCounts, d3StatusPieContainer.value); // Assuming this function exists
    } else {
      console.log("Game collection not available.");
    }
  }).finally(() => {
    isCollectionLoading.value = false
  }).catch((error) => {
    console.error('Error reading game collection:', error);
  });
}

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

function drawPieChart(data, selector) {
  if (!selector || !data) return;

  // Clear the previous chart
  d3.select(selector).selectAll('*').remove();

  const margin = { top: 20, right: 30, bottom: 50, left: 60 };
  const svgWidth = Math.min(document.documentElement.clientWidth, window.innerWidth, 500) - margin.left - margin.right;
  const svgHeight = Math.max(svgWidth * 0.75, 150);
  const radius = Math.min(svgWidth, svgHeight) / 2 - margin.top;

  const color = d3.scaleOrdinal(platformThemeColors);

  const svg = d3.select(selector)
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight)
    .append('g')
    .attr('transform', `translate(${svgWidth / 2}, ${svgHeight / 2})`);

  const pie = d3.pie()
    .value(d => d.count)
    .sort(null);

  const path = d3.arc()
    .outerRadius(radius)
    .innerRadius(0);

  const arcHover = d3.arc()
    .outerRadius(radius * 1.05)  // Increase radius for hover effect
    .innerRadius(0);

  const arcs = svg.selectAll('.arc')
    .data(pie(data))
    .enter()
    .append('g')
    .attr('class', 'arc cursor-pointer');  // Tailwind cursor-pointer class

  arcs.append('path')
    .attr('d', path)
    .attr('fill', d => color(d.data.status))
    .attr('stroke', d => color(d.data.status))  // Use the same color for the stroke
    .attr('stroke-width', '1px')  // Adjust stroke width as needed, usually 1px is enough
    .on('mouseover', (event, d) => {
      d3.select(event.currentTarget)
        .transition()
        .duration(200)
        .attr('d', arcHover);
      
      // Tooltip show logic (TailwindCSS for styling)
      const [x, y] = [event.pageX + 20, event.pageY + 10];
      d3.select('#tooltip')
        .style('left', x + 'px')
        .style('top', y + 'px')
        .classed('hidden', false)
        .html(`${d.data.status}<br>Count: ${d.data.count}`);
    })
    .on('mouseout', (event, d) => {
      d3.select(event.currentTarget)
        .transition()
        .duration(200)
        .attr('d', path);
      
      // Tooltip hide logic
      d3.select('#tooltip')
        .classed('hidden', true);
    });
}
</script>

<template>
    <div id="tooltip" class="absolute text-sm bg-gray-200 p-2 rounded shadow-lg hidden z-50"></div>
    <div class="w-full p-5">
        <div v-if="isLoading" class="flex justify-center items-center m-5 p-5 bg-light-primary dark:bg-dark-primary rounded-md flex xl:min-h-[388px] lg:min-h-[727px] min-h-[1407.5px]">
          <grid-loader color="#14FFEB" size="35px"></grid-loader>
        </div>
        <div v-else class="p-5 bg-light-primary dark:bg-dark-primary rounded-md flex flex-col xl:flex-row justify-evenly md:justify-between lg:min-h-[388px] md:min-h-[727px] min-h-[1407.5px]">
            <div class="flex flex-col md:items-left items-center text-center">
                <img class="rounded-full max-w-[300px]" :src="userProfilePicture"/>
                <p class="text-light-text dark:text-dark-text titillium-web-black text-5xl">{{ userName}}</p>
            </div>
            <div class="w-full pt-16 md:pt-0 flex flex-col md:flex-row text-center text-light-text dark:text-dark-text titillium-web-bold justify-evenly gap-3">
                <div class="gap-5 flex flex-col text-5xl justify-center">
                    <p class="titillium-web-black">Total Games</p>
                    <p class="titillium-web-regular">{{ Object.keys(gameCollection).length }}</p>
                </div>
                <div class="pt-16 md:pt-0 gap-3 flex flex-col text-xl justify-center">
                    <p>Playing</p>
                    <p class="titillium-web-regular">{{ statusCounts.playing }}</p>
                    <p>Completed</p>
                    <p class="titillium-web-regular">{{ statusCounts.completed }}</p>
                    <p>Backlog</p>
                    <p class="titillium-web-regular">{{ statusCounts.backlog }}</p>
                </div>
                <div class="gap-5 flex flex-col text-xl justify-center">
                    <p>Dropped</p>
                    <p class="titillium-web-regular">{{ statusCounts.dropped }}</p>
                    <p>Never Played</p>
                    <p class="titillium-web-regular">{{ statusCounts['never-played'] }}</p>
                </div>
                <div>
                  <Swiper
                    :pagination="{
                      dynamicBullets: true,
                    }"
                    :effect="'fade'"
                    :fadeEffect="{
                      crossFade: true
                    }"
                    :modules="modules"
                    class=""
                  >
                    <SwiperSlide class="">
                        <p class="text-center text-light-text dark:text-dark-text titillium-web-bold text-2xl">Status</p>
                        <div ref="d3StatusPieContainer" class=""></div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <p class="text-center text-light-text dark:text-dark-text titillium-web-bold text-2xl">Platforms</p>
                        <div ref="d3PlatformsPieContainer" class=""></div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <p class="text-center text-light-text dark:text-dark-text titillium-web-bold text-2xl">Genres</p>
                        <div ref="d3GenresPieContainer" class=""></div>
                    </SwiperSlide>
                  </Swiper>
                </div>
            </div>
        </div>
        <div class="flex justify-center items-center text-light-text dark:text-dark-text grid xl:grid-cols-3 lg:grid-cols-2 grid-cols-1 gap-1 p-5">
        <div class="m-2 flex flex-col justify-between bg-light-primary dark:bg-dark-primary/50 p-1 rounded shadow-xl" v-for="(game, key) in gameCollection" data-aos="fade-up">
            <div class="p-2 flex flex-col">
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
                            <div class="pt-3 flex flex-col gap-1 pr-3">
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

<style scoped>

  .swiper {
    max-width: 410px!important;
  }
  .swiper-slide {
    max-width: 410px!important;
  }
</style>