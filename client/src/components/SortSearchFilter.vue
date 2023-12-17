<!-- 
    - Make Checkbox Input to Filter By Every Platform Type in Users Collection :check:
        - Take platforms from users collection and put them in one array in userData store :check:
        - v-for over the array and make a checkbox for each :check:
        - Use the checkboxes value to filter the CollectionGrid :check:
    - Make Searchbox to Search For Game's in User's Collection
        - Use the value in the search box to filter by game title
    - Make input boxes to filter by release year
        - Use the values in the input boxes to filter if the game's release year falls between the years of release the user inputs.
    - Make Sort by A-Z, Z-A, Popularity High to Low, Low to High, Release Date High to Low, Low to High, Status
        - Create a dropdown with each option
        - Create Sort By methods
            - Game Title, A to Z, Z to A
            - Popularity Based off of IGDB Rating, High to Low, Low to High
            - Release Date, High to Low, Low to High
            - Game Status, Completed > Playing > Backlog > Dropped
    - Sort by Status and Filter by Status in User's Collection
        - Create checkboxes for each game status value
 -->

 <script>
import { ref, watchEffect, watch } from 'vue';
import { store } from '../store'; 

export default {
  setup() {
  const uniquePlatforms = ref(new Set());
  const selectedPlatforms = ref(store.selectedPlatforms);
  const searchTerm = ref('');

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

  watch(searchTerm, (newSearchTerm) => {
      store.setSearchTerm(newSearchTerm);
    });

  watchEffect(() => {
    const gameCollection = store.userData.game_collection;
    uniquePlatforms.value.clear();

    if (gameCollection) {
      for (const gameId in gameCollection) {
        const game = gameCollection[gameId];
        const platform = game.platform || 'Uncategorized';
        uniquePlatforms.value.add(platform);
      }

      // Convert Set to array and sort it with "Uncategorized" at the end
      const sortedPlatforms = Array.from(uniquePlatforms.value).sort((a, b) => {
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
      searchTerm, // Include the function in the return object
    };
  },
};
</script>
 
 <template>
  <form>
    <label for="search" hidden>Search for a Game</label>
    <input id="search" type="text" placeholder="Search for a game..." v-model="searchTerm"/>
  </form>
   <form>
     <div v-for="(platform, i) in uniquePlatforms" :key="i">
       <label class="mt-100">
         <input
           type="checkbox"
           @change="updatePlatforms(platform)"
         />
         {{ platform }}
       </label>
     </div>
   </form>
 </template>