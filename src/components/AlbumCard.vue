<template>
  <a :href="album.link" target="_blank" rel="noopener noreferrer"
    class="album-card relative overflow-hidden flex flex-col p-2 transition-all duration-200 ease-out group hover:z-100 hover:scale-101"
    :style="cardStyle"
    
    @mouseenter="$emit('card-hover-start')" 
    @mouseleave="$emit('card-hover-end')">
    <div
      class="wrapper w-full h-full flex flex-col relative rounded-lg overflow-hidden group-hover:shadow-md transition-all duration-200 ease-out">
      <div class="album-image w-full h-full object-cover flex-shrink-0  ">
        <img v-if="album.img" :src="album.img" :alt="album.album + ' cover'" class="w-full object-cover"
        loading="lazy" @error="onImageError" />
        <div v-else class="animate-pulse bg-zinc-800 h-full w-full object-cover">
      </div>

      </div>
      <div
        class="scrim absolute top-0 left-0 w-full h-full bg-linear-to-t from-black to-transparent opacity-0 group-hover:opacity-70 transition-all duration-0 ease-out">
      </div>
      <div
        class="p-2 flex flex-col justify-between flex-grow absolute bottom-0 group-hover:opacity-100 opacity-0 translate-y-1 group-hover:translate-y-0 transition-all duration-100 ease-out">
        <h3 class="font-bold text-zinc-100 mb-2 truncate" :title="album.album" :style="titleStyle">
          {{ album.album }}
        </h3>
        <p class="text-xs text-zinc-300 truncate mb-3" :title="album.artist" :style="artistStyle">
          {{ album.artist }}
        </p>
      </div>
    </div>

  </a>
</template>

<script setup>
import { computed, defineEmits } from 'vue'; // Added defineEmits

const props = defineProps({
  album: Object,
  zoomLevel: Number,
});

const emit = defineEmits(['card-hover-start', 'card-hover-end']); // Defined emits


// --- Dynamic Styling based on Zoom Level ---

// Define base sizes and scaling factors
const baseWidth = 150;
const baseHeight = 150; // Matches AlbumCollection baseItemSize
const widthScale = 40;
const heightScale = 40; // Matches AlbumCollection zoomIncrement
const baseFontSize = 14; // Base font size in px for title
const artistFontSizeRatio = 0.85; // Artist font size relative to title

const cardWidth = computed(() => baseWidth + (props.zoomLevel - 1) * widthScale);
const cardHeight = computed(() => baseHeight + (props.zoomLevel - 1) * heightScale); // Use height from props if passed directly

const cardStyle = computed(() => ({
  width: `${cardWidth.value}px`,
  // Height is set by the parent RecycleScroller via :style binding
}));

const titleStyle = computed(() => ({
  fontSize: `${baseFontSize + (props.zoomLevel - 1) * 1.5}px`,
  lineHeight: '1.2',
}));

const artistStyle = computed(() => ({
  fontSize: `${(baseFontSize + (props.zoomLevel - 1) * 1.5) * artistFontSizeRatio}px`,
  lineHeight: '1.1',
}));

</script>

<style scoped>
.album-card {
  /* Add any fixed styles here */
  /* Ensure text truncation works */
  min-width: 0;
}

/* Consider adding aspect ratio for the image container if needed */
</style>
