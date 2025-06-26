<template>
  <header class="bg-zinc-900/80 backdrop-blur-sm shadow-md p-1 inset-x-0 top-5 flex items-center justify-between fixed z-10 max-w-2xl mx-auto rounded-full border-1 border-gray-100/10">
    <!-- Left: Search Bar -->
    <div class="flex-1 max-w-md">
      <input 
        type="text" 
        placeholder="Zoek naar artiest/album..." 
        v-model="localSearchQuery"
        @input="onSearchInput"
        class="w-full px-4 py-2 text-gray-900 focus:outline-none text-white"
      />
    </div>

    <!-- Right: Controls -->
    <div class="flex items-center space-x-4 ml-4">
      <!-- Sort Controls -->
      <div>
        <label for="sort" class="text-sm text-gray-600 dark:text-gray-400 mr-2">Sort:</label>
        <select 
          id="sort" 
          v-model="localSortOption" 
          @change="$emit('sort-change', localSortOption)"
          class="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="alphabetical">A-Z</option>
          <option value="random">Random</option>
        </select>
      </div>

      <!-- Zoom Controls -->
      <div class="flex items-center">
        <label class="text-sm text-gray-600 dark:text-gray-400 mr-2">Zoom:</label>
        <button @click="decreaseZoom" class="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-l-md bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 disabled:opacity-50" :disabled="localZoomLevel <= 1">-</button>
        <span class="px-3 py-1 border-t border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">{{ localZoomLevel }}</span>
        <button @click="increaseZoom" class="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-r-md bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 disabled:opacity-50" :disabled="localZoomLevel >= 5">+</button>
      </div>

      <!-- View Mode (Placeholder) -->
      <div>
        <label for="view" class="text-sm text-gray-600 dark:text-gray-400 mr-2">View:</label>
        <select 
          id="view" 
          v-model="localViewMode" 
          @change="$emit('view-mode-change', localViewMode)"
          class="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="grid">Grid</option>
          <!-- Add other view modes later -->
        </select>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, watch } from 'vue';

// Simple debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const props = defineProps({
  currentSort: String,
  currentZoom: Number,
  currentViewMode: String,
});

const emit = defineEmits(['search', 'sort-change', 'zoom-change', 'view-mode-change']);

const localSearchQuery = ref('');
const localSortOption = ref(props.currentSort);
const localZoomLevel = ref(props.currentZoom);
const localViewMode = ref(props.currentViewMode);

// Debounce search input
const debouncedSearch = debounce((query) => {
  emit('search', query);
}, 300);

const onSearchInput = () => {
  debouncedSearch(localSearchQuery.value);
};

const increaseZoom = () => {
  if (localZoomLevel.value < 5) {
    localZoomLevel.value++;
    emit('zoom-change', localZoomLevel.value);
  }
};

const decreaseZoom = () => {
  if (localZoomLevel.value > 1) {
    localZoomLevel.value--;
    emit('zoom-change', localZoomLevel.value);
  }
};

// Watch for prop changes if needed (e.g., if parent could reset controls)
watch(() => props.currentSort, (newVal) => localSortOption.value = newVal);
watch(() => props.currentZoom, (newVal) => localZoomLevel.value = newVal);
watch(() => props.currentViewMode, (newVal) => localViewMode.value = newVal);

</script>
