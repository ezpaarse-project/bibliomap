<template>
  <v-card flat>
    <v-card-title>
      {{ t('drawer.fields.title') }}
    </v-card-title>
    <v-select
      v-model="fieldIdentifier"
      :items="headers"
      :label="t('drawer.fields.placeholder')"
    />
  </v-card>
  <div v-if="fields && fields.length > 0" class="portals-component">
    <a
      v-for="{name, color} in fields"
      :key="name"
      class="anchor"
      target="_blank"
    >
      <v-list-item class="portal-list-element">

        <v-tooltip
          :disabled="!countStore.getCountOfField(name.length ? name.toUpperCase() : 'UNKNOWN')"
          location="right"
        >
          <template #activator="{ props }">
            <div class="portal-list-item" v-bind="props">
              <div class="portal-container">
                <div class="portal-title-container">
                  <h3 class="title-font">{{ name.length ? name.toUpperCase() : 'UNKNOWN' }}</h3>
                </div>
              </div>
              <v-chip
                :color="color"
                variant="flat"
              >
                {{ countStore.getCountOfField(name.length ? name.toUpperCase() : 'UNKNOWN') }}
              </v-chip>
            </div>
          </template>
          <div>
            <div
              v-for="mime in countStore.getMimeInField(name.length ? name.toUpperCase() : 'UNKNOWN')"
              :key="mime"
            >
              {{ mime }}: {{ countStore.getCountOfFieldAndMime(name.length ? name.toUpperCase() : 'UNKNOWN', mime) }}
            </div>
          </div>
        </v-tooltip>
      </v-list-item>
    </a>
  </div>
</template>

<script setup lang="ts">
  import { useEcCountStore } from '@/stores/ec-count';
  import { useSortFieldStore } from '@/stores/sort-field';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
  const countStore = useEcCountStore();

  const { fields, headers, fieldIdentifier } = storeToRefs(useSortFieldStore());
</script>

<style lang="scss">
  .anchor{
    text-decoration: none;
    color: inherit;
    z-index: 100;
  }
  .portals-component{
    margin: .5rem 0;
  }
  .portal-list-element{
    background-color: white;
    transition: filter 0.2s ease-in-out;
  }
  .portal-list-element:hover{
      filter: brightness(0.8);
  }
  .portal-list-item{
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .portal-container{
    display: flex;
    height: 3rem;
    margin: .1rem 0;
    gap: 1rem;
  }
  .portal-title-container{
    display: flex;
    flex-direction: column;
    justify-content: center;
    h3{
      font-size: 16px;
      font-weight: bold;
    }
    p{
      font-size: 12px;
    }
  }
</style>
