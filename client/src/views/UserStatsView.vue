

<template>
  <div class="pb-40">
  <div id="tooltip" class="absolute text-sm bg-gray-200 p-2 rounded shadow-lg hidden z-50"></div>

    <div class="flex flex-col text-center items-center justify-center">
      <p class="titillium-web-black text-4xl text-light-text dark:text-dark-text">Status</p>
      <div class="mt-5 flex w-[100px] h-[25px] bg-light-secondary dark:bg-dark-primary rounded-md justify-center items-center text-center">
        <div @click="toggleChart('status')" class="cursor-pointer flex justify-center items-center text-center toggle-div w-[50px] h-[25px] bg-light-accent rounded-l-md" :class="{'hidden-visibility' : !statusChartIsBar}">
          <p class="visible text-xl" :class="{'text-dark-text dark:text-dark-text titillium-web-light' : !statusChartIsBar, 'text-light-text dark:text-light-text titillium-web-bold' : statusChartIsBar}">Bar</p>
        </div>
        <div @click="toggleChart('status')" class="cursor-pointer flex justify-center items-center text-center toggle-div w-[50px] h-[25px] bg-light-accent rounded-r-md" :class="{'hidden-visibility' : statusChartIsBar}">
          <p class="visible text-xl" :class="{'text-dark-text dark:text-dark-text titillium-web-light' : statusChartIsBar, 'text-light-text dark:text-light-text titillium-web-bold' : !statusChartIsBar}">Pie</p>
        </div>
      </div>
    </div>

    <div class="relative h-[600px] w-full max-w-4xl mx-auto pt-5">
      <div class="absolute inset-0 top-0 left-0 right-0 bottom-0" :class="{'hidden-visibility' : !statusChartIsBar}">

        <div ref="d3StatusBarContainer" class="w-full max-w-4xl mx-auto pt-5"></div>

      </div>
      <div class="absolute inset-0 top-0 left-0 right-0 bottom-0" :class="{'hidden-visibility' : statusChartIsBar}">

        <div ref="d3StatusPieContainer" class="w-full max-w-4xl mx-auto pt-5"></div>

      </div>
    </div>

    <div class="flex flex-col text-center items-center justify-center mt-44">
      <p class="titillium-web-black text-4xl text-light-text dark:text-dark-text">Platforms</p>
      <div class="mt-5 flex w-[100px] h-[25px] bg-light-secondary dark:bg-dark-primary rounded-md justify-center items-center text-center">
        <div @click="toggleChart('platform')" class="cursor-pointer flex justify-center items-center text-center toggle-div w-[50px] h-[25px] bg-light-accent rounded-l-md" :class="{'hidden-visibility' : !platformChartIsBar}">
          <p class="visible text-xl" :class="{'text-dark-text dark:text-dark-text titillium-web-light' : !platformChartIsBar, 'text-light-text dark:text-light-text titillium-web-bold' : platformChartIsBar}">Bar</p>
        </div>
        <div @click="toggleChart('platform')" class="cursor-pointer flex justify-center items-center text-center toggle-div w-[50px] h-[25px] bg-light-accent rounded-r-md" :class="{'hidden-visibility' : platformChartIsBar}">
          <p class="visible text-xl" :class="{'text-dark-text dark:text-dark-text titillium-web-light' : platformChartIsBar, 'text-light-text dark:text-light-text titillium-web-bold' : !platformChartIsBar}">Pie</p>
        </div>
      </div>
    </div>

    <div class="relative h-[600px] w-full max-w-4xl mx-auto pt-5">
      <div class="absolute inset-0 top-0 left-0 right-0 bottom-0" :class="{'hidden-visibility' : !platformChartIsBar}">

        <div ref="d3PlatformsBarContainer" class="w-full max-w-4xl mx-auto pt-5"></div>

      </div>
      <div class="absolute inset-0 top-0 left-0 right-0 bottom-0" :class="{'hidden-visibility' : platformChartIsBar}">

        <div ref="d3PlatformsPieContainer" class="w-full max-w-4xl mx-auto pt-5"></div>

      </div>
    </div>

    <div class="flex flex-col text-center items-center justify-center mt-44">
      <p class="titillium-web-black text-4xl text-light-text dark:text-dark-text">Genres</p>
      <div class="mt-5 flex w-[100px] h-[25px] bg-light-secondary dark:bg-dark-primary rounded-md justify-center items-center text-center">
        <div @click="toggleChart('genre')" class="cursor-pointer flex justify-center items-center text-center toggle-div w-[50px] h-[25px] bg-light-accent rounded-l-md" :class="{'hidden-visibility' : !genreChartIsBar}">
          <p class="visible text-xl" :class="{'text-dark-text dark:text-dark-text titillium-web-light' : !genreChartIsBar, 'text-light-text dark:text-light-text titillium-web-bold' : genreChartIsBar}">Bar</p>
        </div>
        <div @click="toggleChart('genre')" class="cursor-pointer flex justify-center items-center text-center toggle-div w-[50px] h-[25px] bg-light-accent rounded-r-md" :class="{'hidden-visibility' : genreChartIsBar}">
          <p class="visible text-xl" :class="{'text-dark-text dark:text-dark-text titillium-web-light' : genreChartIsBar, 'text-light-text dark:text-light-text titillium-web-bold' : !genreChartIsBar}">Pie</p>
        </div>
      </div>
    </div>

    <div class="relative h-[600px] w-full max-w-4xl mx-auto pt-5 pb-5">
      <div class="absolute inset-0 top-0 left-0 right-0 bottom-0" :class="{'hidden-visibility' : !genreChartIsBar}">

        <div ref="d3GenresBarContainer" class="w-full max-w-4xl mx-auto pt-5"></div>

      </div>
      <div class="absolute inset-0 top-0 left-0 right-0 bottom-0" :class="{'hidden-visibility' : genreChartIsBar}">

        <div ref="d3GenresPieContainer" class="w-full max-w-4xl mx-auto pt-5"></div>

      </div>
    </div>
  </div>
  </template>

<script setup>
import { ref, onMounted, computed, watchEffect, watch } from 'vue';
import * as d3 from 'd3';
import { store } from '../store';
import { getDatabase, ref as dbRef, get } from "firebase/database";


const d3StatusBarContainer = ref(null)
const d3StatusPieContainer = ref(null)
const d3PlatformsBarContainer = ref(null)
const d3PlatformsPieContainer = ref(null)
const d3GenresBarContainer = ref(null)
const d3GenresPieContainer = ref(null)

const database = getDatabase();
const userId = store.uid;
const userGameCollectionRef = dbRef(database, 'data/users/' + userId + '/game_collection');
const gameCollection = ref({});
const statusChartIsBar = ref(true)
const platformChartIsBar = ref(true)
const genreChartIsBar = ref(true)

const platformThemeColors = ['#0b1719','#25545b','#2b6169','#33747d','#3b8791','#4aa9b5','#5ab3be','#65bac4','#73c3cd','#7fcbd4','#a2e1e9']

// Watch for changes in the game collection
watchEffect(() => {
  gameCollection.value = store.userData.game_collection;
});

const toggleChart = (chartType) => {
  if (chartType === 'status') {
    statusChartIsBar.value = !statusChartIsBar.value
    console.log(statusChartIsBar.value)
  } else if (chartType === 'platform') {
    platformChartIsBar.value = !platformChartIsBar.value
    console.log(platformChartIsBar.value)
  } else if (chartType === 'genre') {
    genreChartIsBar.value = !genreChartIsBar.value
  }
}

get(userGameCollectionRef).then((snapshot) => {
  if (snapshot.exists()) {
    gameCollection.value = snapshot.val();
    console.log(gameCollection.value)
  } else {
    console.log("No data available");
  }
}).catch((error) => {
  console.error(error);
});

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

  return counts;
});

watch(statusCounts, (newCounts) => {
  const formattedData = Object.entries(newCounts).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1), // Capitalize first letter
    count
  }));
  drawBarChart(formattedData, d3StatusBarContainer.value);
  drawPieChart(formattedData, d3StatusPieContainer.value);
});

watch(platformCounts, (newCounts) => {
  const formattedData = Object.entries(newCounts).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1), // Capitalize first letter
    count
  }));
  drawBarChart(formattedData, d3PlatformsBarContainer.value);
  drawPieChart(formattedData, d3PlatformsPieContainer.value);
});

watch(genreCounts, (newCounts) => {
  const formattedData = Object.entries(newCounts).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1), // Capitalize first letter
    count
  }));
  drawBarChart(formattedData, d3GenresBarContainer.value);
  drawPieChart(formattedData, d3GenresPieContainer.value);
});

function drawBarChart(data, selector) {
  if (!selector || !data) return;

  d3.select(selector).selectAll('*').remove();

  const margin = { top: 20, right: 30, bottom: 100, left: 60 };
  const svgWidth = 800 + margin.left + margin.right;
  const svgHeight = 600 + margin.top + margin.bottom;
  const effectiveWidth = svgWidth - margin.left - margin.right;
  const effectiveHeight = svgHeight - margin.top - margin.bottom;

  const svg = d3.select(selector)
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const xScale = d3.scaleBand()
    .domain(data.map(d => d.status))
    .range([0, effectiveWidth])
    .padding(0.1);

  const yMax = d3.max(data, d => d.count);
  const yScale = d3.scaleLinear()
    .domain([0, yMax])
    .range([effectiveHeight, 0]);

  const bars = svg.selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'fill-light-bar dark:fill-dark-bar cursor-pointer') // Tailwind classes for filling and cursor
    .attr('x', d => xScale(d.status))
    .attr('y', d => yScale(d.count))
    .attr('width', xScale.bandwidth())
    .attr('height', d => effectiveHeight - yScale(d.count))
    .attr('fill', 'teal')
    .on('mouseover', (event, d) => {
      const newWidth = xScale.bandwidth() * 1.1; // Increase width by 10%
      const newX = xScale(d.status) - (newWidth - xScale.bandwidth()) / 2; // Center the bar over the same spot

      d3.select(event.currentTarget)
        .transition()
        .duration(200)
        .attr('x', newX)
        .attr('width', newWidth)
        .attr('y', yScale(d.count) - 5)  // Move up slightly
        .attr('height', effectiveHeight - yScale(d.count) + 5); // Increase height slightly

      const [x, y] = [event.pageX + 20, event.pageY + 10];
      d3.select('#tooltip')
        .style('left', x + 'px')
        .style('top', y + 'px')
        .classed('hidden', false)
        .html(`${d.status}<br>Count: ${d.count}`);
    })
    .on('mouseout', (event, d) => {
      d3.select(event.currentTarget)
        .transition()
        .duration(200)
        .attr('x', xScale(d.status))
        .attr('width', xScale.bandwidth())
        .attr('y', yScale(d.count))
        .attr('height', effectiveHeight - yScale(d.count));

      d3.select('#tooltip')
        .classed('hidden', true);
    });

  svg.append('g')
    .attr('class', 'text-dark-primary dark:text-light-primary')
    .attr('transform', `translate(0, ${effectiveHeight})`)
    .call(d3.axisBottom(xScale))
    .selectAll('text') // Select all text elements in the x-axis group
    .style('text-anchor', 'end') // Set the text-anchor to 'end' to align text properly after rotation
    .attr('dx', '-0.8em') // Adjust the position along the x-axis
    .attr('dy', '0.15em') // Adjust the position along the y-axis
    .attr('transform', 'rotate(-45)'); // Rotate the text elements by -45 degrees

  svg.append('g')
    .attr('class', 'text-dark-primary dark:text-light-primary')
    .call(d3.axisLeft(yScale));
}


function drawPieChart(data, selector) {
  if (!selector || !data) return;

  // Clear the previous chart
  d3.select(selector).selectAll('*').remove();

  const margin = { top: 20, right: 30, bottom: 50, left: 60 };
  const svgWidth = 800 + margin.left + margin.right;
  const svgHeight = 600 + margin.top + margin.bottom;
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

<style>
.capitalize {
  text-transform: capitalize;
}

.bar-color {
  fill: #22646D;
}

.hidden-visibility {
    visibility: hidden;
}

.visible {
  visibility: visible !important;
}

.toggle-div {
    transition: opacity 0.3s ease-in-out;
}
</style>