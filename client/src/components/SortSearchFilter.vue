<!-- 
    - Make Checkbox Input to Filter By Every Platform Type in Users Collection :check:
        - Take platforms from users collection and put them in one array in userData store :check:
        - v-for over the array and make a checkbox for each :check:
        - Use the checkboxes value to filter the CollectionGrid :check:
    - Make Searchbox to Search For Game's in User's Collection :check:
        - Use the value in the search box to filter by game title :check:
    - Make input boxes to filter by release year :check:
        - Use the values in the input boxes to filter if the game's release year falls between the years of release the user inputs. :check:
    - Make Sort by A-Z, Z-A, Popularity High to Low, Low to High, Release Date High to Low, Low to High, Status :check:
        - Create a dropdown with each option :check:
        - Create Sort By methods :check:
            - Game Title, A to Z, Z to A :check:
            - Popularity Based off of IGDB Rating, High to Low, Low to High :check:
            - Release Date, High to Low, Low to High :check:
            - Game Status, Completed > Playing > Backlog > Dropped :check:
    - Sort by Status and Filter by Status in User's Collection :check:
        - Create checkboxes for each game status value :check:
 -->

 <script>
import { ref, watchEffect, watch } from 'vue';
import { store } from '../store'; 

export default {
  setup() {
  const uniquePlatforms = ref(new Set());
  const selectedPlatforms = ref(store.selectedPlatforms);
  const searchTerm = ref('');
  const releaseYearStart = ref()
  const releaseYearEnd = ref()
  const selectedStatuses = ref([]);
  const selectedSort = ref(store.selectedSort);

  const updatePlatforms = (platform) => {
    const isUncategorized = platform === 'Uncategorized';

    if (isUncategorized) {
      const uncategorizedIndex = selectedPlatforms.value.indexOf('Uncategorized');

      if (uncategorizedIndex !== -1) {
        selectedPlatforms.value.splice(uncategorizedIndex, 1);
      } else {
        selectedPlatforms.value.push('Uncategorized');
      }
    } else {
      const platformIndex = selectedPlatforms.value.indexOf(platform);

      if (platformIndex !== -1) {
        selectedPlatforms.value.splice(platformIndex, 1);
      } else {
        selectedPlatforms.value.push(platform);
      }
    }

    store.setSelectedPlatforms(selectedPlatforms.value);
  };

  const updateStatuses = (gameStatus) => {
  const statusIndex = selectedStatuses.value.indexOf(gameStatus);

  if (statusIndex !== -1) {
    // If the status is already in the array, remove it
    selectedStatuses.value.splice(statusIndex, 1);
  } else {
    // If the status is not in the array, add it
    selectedStatuses.value.push(gameStatus);
  }

  store.setSelectedStatuses(selectedStatuses.value);
};

    const updateSortValue = () => {
      store.setSortValue(selectedSort.value);
    };  

  watch(searchTerm, (newSearchTerm) => {
      store.setSearchTerm(newSearchTerm);
    });

  watch(releaseYearStart, (newReleaseYearStart) => {
    store.setReleaseYearStart(newReleaseYearStart)
  })

  watch(releaseYearEnd, (newReleaseYearEnd) => {
    store.setReleaseYearEnd(newReleaseYearEnd)
  })

  watchEffect(() => {
    console.log(store.userData.game_collection)
    const gameCollection = store.userData.game_collection;
    uniquePlatforms.value.clear();

    if (gameCollection) {
      for (const gameId in gameCollection) {
        const game = gameCollection[gameId];
        console.log(game)
        const platform = game.platform?.abbreviation || 'Uncategorized';
        uniquePlatforms.value.add(platform);
      }

      // Convert Set to array and sort it with "Uncategorized" at the end
      const sortedPlatforms = Array.from(uniquePlatforms.value).filter(platform => typeof platform === 'string').sort((a, b) => {
        if (a === 'Uncategorized') return 1;
        if (b === 'Uncategorized') return -1;
        return a.localeCompare(b);
      });

      // Update uniquePlatforms with the sorted array
      uniquePlatforms.value = new Set(sortedPlatforms);
    }
  });

    return {
      uniquePlatforms,
      selectedPlatforms,
      updatePlatforms,
      updateStatuses,
      updateSortValue,
      searchTerm,
      releaseYearStart,
      releaseYearEnd,
      selectedSort,
      selectedStatuses,
    };
  },
};
</script>
 
 <template>
  <div class="m-3 text-light-text dark:text-dark-text">
  <form class="mb-1">
    <label for="search" hidden>Search for a Game</label>
    <input class="placeholder:dark:text-dark-textcontrast placeholder:text-light-primary bg-light-tertiary dark:bg-dark-secondary mt-1 block w-full rounded-md p-1" id="search" type="text" placeholder="Search your collection..." v-model="searchTerm"/> <br/>
  </form>
  <form class="mb-1 flex flex-col">
    <label class="titillium-web-bold text-lg" for="releaseYearStart">Release Year</label>
    <input class="placeholder:dark:text-dark-textcontrast placeholder:text-light-primary rounded-md p-1 bg-light-tertiary dark:bg-dark-secondary mt-1 block" id="releaseYearStart" placeholder="1958" v-model="releaseYearStart"/>
    <label for="releaseYearEnd" hidden>Release Year End</label>
    <input class="placeholder:dark:text-dark-textcontrast placeholder:text-light-primary rounded-md p-1 bg-light-tertiary dark:bg-dark-secondary mt-1 block" id="releaseYearEnd" placeholder="2023" v-model="releaseYearEnd"/>
  </form>
  <h2 class="titillium-web-bold text-lg">Platform</h2>
   <div class="flex justify-center items-center flex-wrap m-1 gap-2 text-center">
     <div class="" v-for="(platform, i) in uniquePlatforms" :key="i">
      <div
      :class="{'platform-selected': selectedPlatforms?.includes(platform)}"
      class="cursor-pointer bg-light-primary dark:bg-dark-primary w-[100px] rounded-md" @click="updatePlatforms(platform)">
        {{ platform }}
      </div>
       <!-- <label class="mt-100">
         <input
           type="checkbox"
           @change="updatePlatforms(platform)"
         />
         {{ platform }}
       </label> -->
     </div>
    </div>

   <h2 class="titillium-web-bold text-lg">Status</h2>
   <div class="flex flex-wrap justify-center items-center m-1 gap-2 text-center">
    <div 
    :class="{'status-selected': selectedStatuses?.includes('playing')}"
    class="cursor-pointer bg-light-primary dark:bg-dark-primary w-[100px] rounded-md" @click="updateStatuses('playing')">
      Playing
    </div>
    <div 
    :class="{'status-selected': selectedStatuses?.includes('completed')}"
    class="cursor-pointer bg-light-primary dark:bg-dark-primary w-[100px] rounded-md" @click="updateStatuses('completed')">
      Completed
    </div>
    <div 
    :class="{'status-selected': selectedStatuses?.includes('backlog')}"
    class="cursor-pointer bg-light-primary dark:bg-dark-primary w-[100px] rounded-md" @click="updateStatuses('backlog')">
      Backlog
    </div>
    <div 
    :class="{'status-selected': selectedStatuses?.includes('dropped')}"
    class="cursor-pointer bg-light-primary dark:bg-dark-primary w-[100px] rounded-md" @click="updateStatuses('dropped')">
      Dropped
    </div>
    <div 
    :class="{'status-selected': selectedStatuses?.includes('never-played')}"
    class="cursor-pointer bg-light-primary dark:bg-dark-primary w-[100px] rounded-md" @click="updateStatuses('never-played')">
      Never Played
    </div>
   </div>
   <!-- <form class="m-1">
    <div></div>
    <input @change="updateStatuses('playing')" id="playingFilter" type="checkbox"/>
    <label for="playingFilter"> Playing</label>
    <div></div>
    <input @change="updateStatuses('completed')" id="completedFilter" type="checkbox"/>
    <label for="completedFilter"> Completed</label>
    <div></div>
    <input @change="updateStatuses('backlog')" id="backlogFilter" type="checkbox"/>
    <label for="backlogFilter"> Backlog</label>
    <div></div>
    <input @change="updateStatuses('dropped')" id="droppedFilter" type="checkbox"/>
    <label for="droppedFilter"> Dropped</label>
  </form> -->
  <form class="mt-3">
    <label class="titillium-web-bold text-lg" for="sort">Sort By</label>
    <select class="w-full w-48 p-1 rounded bg-light-tertiary dark:bg-dark-secondary" id="sort" v-model="selectedSort" @change="updateSortValue">
      <option value="AtoZ">Name: A to Z</option>
      <option value="ZtoA">Name: Z to A</option>
      <option value="PopHighToLow">Popularity: High to Low</option>
      <option value="PopLowToHigh">Popularity: Low to High</option>
      <option value="Newest">Release Date: Newest First</option>
      <option value="Oldest">Release Date: Oldest First</option>
      <option value="Status">Status</option>
    </select>
  </form>
</div>
 </template>

 <style scoped>
  .platform-selected, .status-selected {
    background-color: #14FFEB;
    color: #393939;
    font-weight: 700;
  }
 </style>