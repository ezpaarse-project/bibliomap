<template>
  <v-list-item v-for="(value, key) in portals" :key="key">
    <div class="portal-list-item">
      <div class="portal-container">
        <img v-if="value.icon" :src="getIconUrl(value.icon)">
        <div>
          <h3>{{ key }}</h3>
          <p>{{ value.subtitle }}</p>
        </div>
      </div>
      <v-chip>0</v-chip>
    </div>
  </v-list-item>
</template>

<script setup lang="ts">
  import config from '@/assets/config.json';

  const portals = config.portals;

  const getIconUrl = (iconName: string): string => {
    const str = `../assets/${iconName}`
    return new URL(str, import.meta.url).href;
  };
</script>

<style lang="scss">
  .portal-list-item{
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .portal-container{
    display: flex;
    height: 3rem;
    margin: .1rem 0;
    gap: 1rem;

    h3{
      font-size: 16px;
      font-weight: normal;
    }
    p{
      font-size: 12px;
    }
  }
</style>
