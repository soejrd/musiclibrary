<template>
  <div class="container">
    <nav>
      <div class="wrapper">
        <div class="input">
          <MdiIcon icon="mdiArrowLeft" @click="searchQuery = ''" id="back-button"
            :class="{ hidden: searchQuery === '' }" />
          <input type="text" placeholder="Search for an album or artist" @input="debounceSearch"
            @focus="inputActive = true" @blur="inputActive = false">
        </div>
        <div class="controls">
          <MdiIcon v-show="sortMode === 'shuffle'" icon="mdiShuffle" @click="handleSortMode('alphabetical')" />
          <MdiIcon v-show="sortMode === 'alphabetical'" icon="mdiSortAlphabeticalVariant"
            @click="handleSortMode('shuffle')" />
          <MdiIcon v-show="viewMode === 'column'" icon="mdiViewColumn" @click="handleViewMode('screen')" />
          <MdiIcon v-show="viewMode === 'screen'" icon="mdiViewArray" @click="handleViewMode('column')" />
          <MdiIcon icon="mdiMagnifyPlus" @click="handleZoom(1)" />
          <MdiIcon icon="mdiMagnifyMinus" @click="handleZoom(-1)" />
        </div>
      </div>
    </nav>
    <div class="albums" id="albums-container" ref="albumsRef">
      <LazyAlbum v-for="(album, index) in visibleAlbums" :key="album.album" :title="album.album" :artist="album.artist"
        :image="album.img" :link="album.link" :size="zoomLevels[zoomLevel]" @mouseenter="handleAlbumHover($event, true)"
        @mouseleave="handleAlbumHover($event, false)" />
    </div>
    <div class="scrim" :style="{ opacity: albumHovered ? 1 : 0 }"></div>
  </div>
</template>

<script setup>
const { data: library_pre } = await useFetch('/library.json');
const library = ref(library_pre);
//initial random sorting


//variables and references
const sortMode = ref('shuffle') // or 'shuffle'
const viewMode = ref('column');
const containerWidth = ref('1200px');
const albumHovered = ref(false);
const batchSize = 24;
const visibleCount = ref(batchSize);
const loadMoreAlbums = useTemplateRef('albumsRef');
const albumsRef = ref('');
const inputActive = ref(false);
const zoomLevel = ref(4) // initial zoom level (256)
const zoomLevels = [96, 125, 162, 200, 270, 584];

let librarySorted = ref([...library.value]);
let libraryFiltered = ref([...library.value]);

const searchQuery = ref('');
let timeoutId;


onMounted(() => {
  albumsRef.value.focus;
  library.value = sortShuffle(library.value);
  handleSortMode('shuffle');


  const innerWidth = window.innerWidth;
});

const debounceSearch = (event) => {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    if (searchQuery.value !== event.target.value) {
      searchQuery.value = event.target.value;
      visibleCount.value = batchSize;
    }
  }, 200);
};

const handleViewMode = (newViewMode) => {
  if (newViewMode == 'column') {
    containerWidth.value = '1200px';
  } else {
    containerWidth.value = '100%';
  }
  viewMode.value = newViewMode;
};

const handleZoom = (delta) => {
  if (zoomLevel.value + delta !== zoomLevel.value) {
    if (zoomLevel.value + delta > zoomLevels.length - 1) return;
    if (zoomLevel.value + delta < 0) return;
    zoomLevel.value += delta;
  }
};

watch(searchQuery, () => {
  const originalAlbums = [...library.value];
  if (searchQuery.value == '') {
    libraryFiltered.value = originalAlbums;
  }
  const lowerCaseQuery = searchQuery.value.toLowerCase();
  const filteredAlbums = originalAlbums.filter(album => {
    return album.album.toLowerCase().includes(lowerCaseQuery) || album.artist.toLowerCase().includes(lowerCaseQuery);
  })
  libraryFiltered.value = filteredAlbums;
  handleSortMode();
})

const sortShuffle = (array) => array.sort(() => Math.random() - 0.5);
const sortAlphabetical = (array) => array.sort((a, b) => a.album.localeCompare(b.album));

const handleSortMode = (newSortMode) => {
  visibleCount.value = batchSize; 
  window.scrollTo(0, 0);
  if (newSortMode !== undefined) {
    sortMode.value = newSortMode;
    

    if (newSortMode === 'shuffle') {
      librarySorted.value = sortShuffle([...libraryFiltered.value]);
    } else if (newSortMode === 'alphabetical') {
      librarySorted.value = sortAlphabetical([...libraryFiltered.value]);
    }
  } else {
    librarySorted.value = [...libraryFiltered.value];
    console.log('undefined..')
  }
  setupIntersectionObserver();
};

const setupIntersectionObserver = () => {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      visibleCount.value += batchSize;
      observer.unobserve(entries[0].target); // unobserve the current target
      observer.observe(albumsRef.value.children[albumsRef.value.children.length - 1]); // observe the new last child
    }
  }, { rootMargin: '100px',
  threshold:[0.01, 0.99]
   });
  setTimeout(() => {
    observer.observe(albumsRef.value.children[albumsRef.value.children.length - 1]);
    window.albumObserver = observer;
  }, 500);
}

setupIntersectionObserver();


watch(inputActive, () => {
  if (inputActive.value) {
    document.getElementsByTagName('nav')[0].classList.add('focused');
  } else {
    document.getElementsByTagName('nav')[0].classList.remove('focused');
  }
});



const visibleAlbums = computed(() => {
  return librarySorted.value.slice(0, visibleCount.value);
});

function handleAlbumHover(e, state) {
  albumHovered.value = state;
}



</script>


<style lang="scss">
$gap: 16px;


body {
  background-color: #141218;
  font-family: 'Inter', sans-serif;
  margin: 0;
  padding: 0;
}

.container {
  //max-width: 1200px;
  max-width: v-bind(containerWidth);
  padding: 0 $gap;
  margin: 0 auto;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

nav {
  position: fixed;
  top: 60px;
  left: 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  z-index: 10;
  width: calc(100% - 32px);
  padding: 0 16px;

  &.focused {

    .wrapper {
      //background-color: rgb(43 41 48 / 80%);
      background-color: hsl(from rgb(43 41 48 / 80%) h 5% 20%);
      border: 1px solid rgb(255 255 255 / 15%);
    }
  }

  .wrapper {
    width: 736px;
    max-width: 100%;
    height: 54px;
    background-color: #2B2930;
    background-color: rgb(43 41 48 / 80%);
    border-radius: 1000px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    border: 1px solid rgb(255 255 255 / 10%);
    backdrop-filter: blur(16px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    transition: all 100ms ease-out;

    .input {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 8px;
      width: 100%;
      overflow: hidden;

      svg {
        transition: all 200ms ease-out;

        &.hidden {
          //transform: translateX(-48px);
          width: 0px;
          //opacity: 0;
        }
      }

      input {
        background-color: transparent;
        border: none;
        font-size: 14px;
        width: 100%;
        color: white;

        &:focus {
          border: none;
          outline: none;
        }
      }
    }

    .controls {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 12px;
      border-left: 1px solid rgb(255 255 255 / 10%);
      height: 100%;
      padding-left: 12px;
    }

    svg {
      width: 24px;
      height: 24px;
      color: white;
      cursor: pointer;
      opacity: 0.5;

      &:hover {
        opacity: 1;
      }
    }
  }
}

.albums {
  display: flex;
  gap: $gap;
  flex-wrap: wrap;
  margin: 175px auto;
  justify-content: center;
}

.scrim {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(20, 18, 24, 0.75);
  pointer-events: none;
  z-index: 0;
  transition: opacity 200ms ease-out;
}
</style>