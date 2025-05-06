<template>
  <v-navigation-drawer
    v-if="include"
    v-model="drawer"
    :location="drawerLocation"
    :width="props.width"
  >
    <v-app-bar-nav-icon
      variant="text"
      @click.stop="drawer = !drawer"
    />
    <div class="drawer-elements-container">
      <div v-if="props.descriptionSection.include" :style="{ order: props.descriptionSection.index }">
        <v-list-item>
          <div class="description-section-item">
            <img v-if="props.descriptionSection.icon" alt="icon" :src="getIconUrl(props.descriptionSection.icon)">
            <span>{{ props.descriptionSection.content }}</span>
          </div>
        </v-list-item>
        <v-divider />
      </div>
      <div v-if="props.timerSection.include" :style="{ order: props.timerSection.index }">
        <Timer />
        <v-divider />
      </div>
      <div v-if="props.counterSection.include" :style="{ order: props.counterSection.index }">
        <Counter />
        <v-divider />
      </div>
      <div v-if="props.portalSection.include" :style="{ order: props.portalSection.index }">
        <Portals />
        <v-divider />
      </div>
    </div>
  </v-navigation-drawer>
  <v-btn
    v-if="include && !drawer"
    size="60"
    style="z-index: 1000;"
    @click="drawer = !drawer"
  >
    <v-icon>mdi-arrow-right</v-icon>
  </v-btn>
</template>

<script setup lang="ts">

  import { ref, watch } from 'vue'

  import config from '@/assets/config.json';

  const props = config.drawerParams;

  const include = !(!props || props.include === false);

  const drawer = ref(true)
  const group = ref(null)

  const drawerLocation = props.position || 'left' as 'left' | 'right' | 'top' | 'bottom' | 'end' | 'start' | undefined

  watch(group, () => {
    drawer.value = false
  })

  const getIconUrl = (iconName: string): string => {
    return new URL(`../assets/${iconName}`, import.meta.url).href;
  };

</script>
<style lang="scss">
  .drawer-elements-container{
    display: flex;
    flex-direction: column;
  }
  .description-section-item{
    display: flex;
    flex-direction: row;
    align-items: center;

    img{
      height: 100%;
      width: 100%;
      margin: .5rem;
    }

    span{
      text-align: center;
      font-size: 14px;
    }
  }
</style>
