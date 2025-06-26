<template>
  <div class="h-screen bg-zinc-950">
    <Navigation 
      @search="handleSearch" 
      @sort-change="handleSortChange" 
      @zoom-change="handleZoomChange"
      @view-mode-change="handleViewModeChange"
      :current-sort="sortOption"
      :current-zoom="zoomLevel"
      :current-view-mode="viewMode"
    />
    <main class="h-screen">
      <div v-if="loading" class="flex items-center justify-center h-full">
        <div class="text-xl text-gray-400">Loading your music library...</div>
      </div>
      
      <div v-else-if="error" class="flex items-center justify-center h-full">
        <div class="text-xl text-red-600">{{ error }}</div>
      </div>
      <AlbumCollection 
        v-else
        :albums="albums" 
        :search-query="searchQuery"
        :sort-option="sortOption"
        :zoom-level="zoomLevel"
        :view-mode="viewMode"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import Navigation from './components/Navigation.vue';
import AlbumCollection from './components/AlbumCollection.vue';
import { useAlbumData } from './composables/useAlbumData';

const { albums, loading, error } = useAlbumData();
const searchQuery = ref('');
const sortOption = ref('random'); // 'alphabetical' or 'random'
const zoomLevel = ref(3); // 1-5
const viewMode = ref('grid'); // 'grid', 'list', etc.

const handleSearch = (query) => {
  searchQuery.value = query;
};

const handleSortChange = (option) => {
  sortOption.value = option;
};

const handleZoomChange = (level) => {
  zoomLevel.value = level;
};

const handleViewModeChange = (mode) => {
  viewMode.value = mode;
};
</script>
