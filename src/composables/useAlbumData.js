import { ref, onMounted } from 'vue';

export function useAlbumData() {
  const albums = ref([]);
  const loading = ref(true);
  const error = ref(null);

  onMounted(async () => {
    try {
      const response = await fetch('/library.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      albums.value = data;
      console.log(albums.value)
      albums.value.link = Math.random().toString(36).substring(7);
    } catch (e) {
      console.error("Failed to load library data:", e);
      error.value = "Failed to load music library. Please check the console for details.";
    } finally {
      loading.value = false;
    }
  });

  return { albums, loading, error };
}
