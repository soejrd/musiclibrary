<template>
  <!-- Responsive, centered container -->
  <div class="h-full relative flex justify-center" ref="containerRef">
    <!-- Inner wrapper for max-width -->
    <div class="w-full">
      <RecycleScroller v-if="filteredAndSortedAlbums.length > 0" class="scroller" :items="filteredAndSortedAlbums"
        :item-size="itemSize" key-field="id" v-slot="{ item }" :buffer="400" :gridItems="gridItemsCount">
        <AlbumCard :album="item" :style="{ height: `${itemSize}px` }" :zoom-level="zoomLevel"
          @card-hover-start="handleCardHoverStart" @card-hover-end="handleCardHoverEnd" />
      </RecycleScroller>

      <div v-else class="flex items-center justify-center h-full">
        <p class="text-gray-500 dark:text-gray-400">No albums found matching your criteria.</p>
      </div>
    </div>
    <!-- Scrim: Opacity controlled by isAnyCardHovered state -->
    <div
      class="scrim absolute top-0 left-0 w-full h-full bg-black/70 transition-opacity duration-300 pointer-events-none select-none z-1"
      :class="{ 'opacity-100': isAnyCardHovered, 'opacity-0': !isAnyCardHovered }"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'; // Added onUnmounted
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import AlbumCard from './AlbumCard.vue';

// Simple seeded pseudo-random number generator (Linear Congruential Generator - LCG)
function createSeededRandom(seed) {
  let state = seed % 2147483647; // Ensure state is within 32-bit signed integer range
  if (state <= 0) state += 2147483646;

  return function () {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646; // Return a value between 0 (inclusive) and 1 (exclusive)
  };
}

const props = defineProps({
  albums: Array,
  searchQuery: String,
  sortOption: String,
  zoomLevel: Number,
  viewMode: String, // Currently only 'grid' is implemented visually
});

const containerRef = ref(null); // Ref for the outer container
const wrapperRef = ref(null); // Ref for the inner wrapper
const observedWidth = ref(0); // Reactive variable for container width
let resizeObserver = null; // To hold the ResizeObserver instance

let randomSeed = Date.now(); // Initial seed for random sort
const isAnyCardHovered = ref(false); // State to track if any card is hovered

// --- Hover Handlers ---
const handleCardHoverStart = () => {
  isAnyCardHovered.value = true;
};

const handleCardHoverEnd = () => {
  isAnyCardHovered.value = false;
};

// --- Filtering ---
const filteredAlbums = computed(() => {
  if (!props.searchQuery) {
    return props.albums;
  }
  const query = props.searchQuery.toLowerCase();
  return props.albums.filter(album =>
    album.album.toLowerCase().includes(query) ||
    album.artist.toLowerCase().includes(query)
  );
});

// --- Sorting ---
const filteredAndSortedAlbums = computed(() => {
  let albumsToSort = [...filteredAlbums.value];

  //key fixen
  albumsToSort.forEach((album, index) => {
    album.id = index;
  });

  if (props.sortOption === 'alphabetical') {
    return albumsToSort.sort((a, b) => {
      const nameA = `${a.artist} - ${a.album}`.toLowerCase();
      const nameB = `${b.artist} - ${b.album}`.toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
  } else if (props.sortOption === 'random') {
    // Use Fisher-Yates shuffle with our custom seeded RNG
    const rng = createSeededRandom(randomSeed);
    for (let i = albumsToSort.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [albumsToSort[i], albumsToSort[j]] = [albumsToSort[j], albumsToSort[i]];
    }
    return albumsToSort;
  }

  // Finally, ensure all items passed to the scroller have a valid key
  return albumsToSort;
});

// Regenerate seed when random sort is selected
watch(() => props.sortOption, (newVal, oldVal) => {
  if (newVal === 'random' && oldVal !== 'random') {
    randomSeed = Date.now();
    // Force recompute (though changing seed should trigger it via filteredAndSortedAlbums)
  }
});

// --- Zoom & Item Size ---
// Base size and increment per zoom level
const baseItemSize = 150; // Adjust as needed
const zoomIncrement = 40; // Adjust as needed

const itemSize = computed(() => {
  // Calculate item size based on zoom level (adjust calculation as needed)
  // This is a simplified example; a real grid might need more complex calculations
  // based on container width and number of columns desired per zoom level.
  // For RecycleScroller, itemSize usually refers to the height in vertical lists.
  // For a grid, you might need a different virtual scroller or calculate row height.
  // Let's assume zoom affects height for now.
  // This calculates the height of each row in the grid.
  return baseItemSize + (props.zoomLevel - 1) * zoomIncrement;
});


//watch props.searchQuery
watch(() => props.searchQuery, (e) => {
  // Reset the random seed when search query changes
  if(e == ''){
    setGridSize();
  }
});

// --- Dynamic Grid Calculation ---
const itemGap = 16; // Assumed gap between items (Tailwind gap-4)
const maxWidthPixels = 1280; // Corresponds to max-w-7xl

const gridItemsCount = computed(() => {
  // Estimate the width of an item based on zoom level, similar to height calculation
  const estimatedItemWidth = baseItemSize + (props.zoomLevel - 1) * zoomIncrement;
  const effectiveItemWidth = estimatedItemWidth + itemGap; // Add gap

  // Use the observed width, but cap it at the max-w-7xl value
  const availableWidth = Math.min(observedWidth.value, maxWidthPixels);

  // Calculate how many items fit in the available width
  const count = Math.max(1, Math.floor(availableWidth / effectiveItemWidth)); // Ensure at least 1 item
  // console.log(`Zoom: ${props.zoomLevel}, ItemWidth: ${estimatedItemWidth}, EffectiveWidth: ${effectiveItemWidth}, AvailableWidth: ${availableWidth}, Count: ${count}`); // Debug log
  return count;
});


const setGridSize = (entry) => {
  wrapperRef.value = document.querySelector('.vue-recycle-scroller__item-wrapper');
  if(entry){
    observedWidth.value = entry.contentRect.width;
  }
  
  //in here cause it sometimes gets emptied
  const wrapperSize = itemSize.value * gridItemsCount.value;
  const offset = (observedWidth.value - wrapperSize) / 2;
  wrapperRef.value.style.transform = `translateX(${offset}px)`;

}



onMounted(() => {
  if (containerRef.value) {
    // Initialize width
    observedWidth.value = containerRef.value.offsetWidth;
    // Set up ResizeObserver
    resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        // Update observed width
        setGridSize(entry);
      }
    });
    resizeObserver.observe(containerRef.value);
  }
});

onUnmounted(() => {
  // Clean up observer
  if (resizeObserver && containerRef.value) {
    resizeObserver.unobserve(containerRef.value);
  }
  resizeObserver = null;
});

</script>

<style>
.scroller {
  height: 100%;
}

.hover {
  z-index: 2 !important;
}
</style>
