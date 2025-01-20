<template>
    <NuxtLink :to="link">
        <div class="album">
            <div class="text">
                <h4 class="title">{{ title }}</h4>
                <h5 class="artist">{{ artist }}</h5>
            </div>
            <img loading="lazy" :src="image" :width="size" :height="size" :alt="'Image of album ' + title">
        </div>
    </NuxtLink>
</template>

<script setup>
const props = defineProps({
    title: {
        type: String
    },
    artist: {
        type: String
    },
    image: {
        type: String,
    },
    link: {
        type: String
    },
    size: {
        type: Number,
    },
});


const computedSize = computed(() => {
    return `${props.size}px`;
});

</script>

<style scoped lang="scss">
* {
    text-decoration: none;
}
.album {
    width: v-bind(computedSize);
    height: v-bind(computedSize);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    cursor: pointer;
    transition: transform 200ms ease-in-out;
    background-color: rgba(255, 255, 255, 0.1);
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.02) 100%);
    background-size: 150% 100%;
    animation: bgScroll 2s infinite linear;
    user-select: none;

    img {
        position: absolute;
        left: 0;
        top: 0;
        opacity: 1;
        z-index: 0;

    }

    &::before {
        //scrim
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 75%);
        opacity: 0;
        z-index: 1;
    }

    .text {

        flex-direction: column;
        gap: 8px;

        color: white;
        padding: 16px;
        z-index: 2;


        opacity: 0;
        transform: translateY(8px);
        transition: all 200ms ease-in-out;

        .title {
            font-weight: bold;
            font-size: 16px;
            margin: 0;
        }

        .artist {
            font-weight: normal;
            font-size: 14px;
            margin: 0;
        }
    }

    &:hover {
        z-index: 1;
        transform: translateY(-8px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);

        &::before {
            opacity: 1;
        }

        .text {
            display: flex;
            transform: translateY(0);
            opacity: 1;
        }
    }
}

@keyframes bgScroll {
    0% {
        background-position: 100% 0%;
    }

    100% {
        background-position: -200% 0%;
    }
}
</style>
