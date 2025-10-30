<template>
  <div v-if="allPortals.length > 1" :flat="true">
    <v-card-text class="text-h6">{{ t('fabButton.settings-dialog.portals-section.title') }}</v-card-text>
    <div
      class="d-flex flex-column flex-wrap px-4"
      style="gap: 4px; max-height: 300px; overflow-y: auto;"
    >
    <v-row>
      <v-col
        cols="12"
        sm="6"
        class="pa-0"
        v-for="portal in allPortals"
        :key="portal.name"
      >
      <v-checkbox
        v-model="shownPortals[portal.name]"
        class="ma-0"
        :color="portal.color || 'primary'"
        hide-details
        :label="t(`drawer-custom.portals.${portal.name}.title`)"
      />
      </v-col>
    </v-row>
    </div>
    <v-card-actions>
      <v-btn class="mr-4" color="primary" @click="checkAll">{{ t('fabButton.settings-dialog.portals-section.select-all') }}</v-btn>
      <v-spacer />
      <v-btn color="primary" @click="uncheckAll">{{ t('fabButton.settings-dialog.portals-section.select-none') }}</v-btn>
    </v-card-actions>
  </div>
</template>

<script setup lang="ts">

  import initialConfig from '@/assets/config.json';
  import { useConfigStore } from '@/stores/config';

  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();

  const { config } = storeToRefs(useConfigStore());
  const allPortals = initialConfig.drawerParams.portalSection.portals;

  const userPortalConfig = config.value.drawerParams.portalSection.portals;

  const shownPortals = reactive<Record<string, boolean>>(
    Object.fromEntries(userPortalConfig.map(p => [p.name, true]))
  );

  watch(
    shownPortals,
    () => {
      config.value.drawerParams.portalSection.portals = allPortals.filter(
        portal => shownPortals[portal.name]
      );
    },
    { deep: true }
  );

  function changeAll (check: boolean) {
    for (const portal of allPortals) {
      shownPortals[portal.name] = check;
    }
  }

  function checkAll () {
    changeAll(true);
  }

  function uncheckAll (){
    changeAll(false);
  }

</script>
