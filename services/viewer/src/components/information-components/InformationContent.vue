<template>
  <div class="drawer-elements-container">
    <div>
      <v-list-item>
        <v-card :flat="true">
          <v-card-title
            class="text-h4 justify-center title-font bold"
            style="white-space: normal; overflow: visible;"
          >{{ t('info-card.title') }}</v-card-title>
          <v-card-text><p v-html="t('info-card.p1')" /></v-card-text>
        </v-card>
      </v-list-item>
      <v-list-item>
        <v-card :flat="true">
          <div class="ez-logos">
            <a href="https://www.readmetrics.org/" target="_blank"><img alt="ReadMetrics" src="@/assets/logo-readmetrics.png"></a>
          </div>
          <v-card-text>
            <p v-html="t('info-card.p2')" />
          </v-card-text>
        </v-card>
      </v-list-item>
      <v-list-item>
        <v-card :flat="true">
          <v-card-text>{{ t('info-card.comment') }}</v-card-text>
        </v-card>
      </v-list-item>
      <v-list-item>
        <v-card :flat="true">
          <div class="org-logos">
            <a href="http://www.couperin.org/" target="_blank"><img alt="Couperin" src="@/assets/logo-couperin.jpg"></a>
            <a href="http://www.cnrs.fr/" target="_blank"><img id="cnrs-logo" alt="CNRS" src="@/assets/logo.svg"></a>
          </div>
        </v-card>
      </v-list-item>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
</script>

<style lang="scss">

  a{
    color: #039be5;
    text-decoration: none;
  }

  .bibcnrs-img{
    max-width: 90%;
    height: auto;
    display: block;
    margin: 1.5em auto;
  }
  .ez-logos{
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
    margin: 1em 0;

    a img{
      max-width: 50%;
      height: auto;
      display: block;
      margin: 0 auto;
    }
  }
  .org-logos{
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
    margin: 1em 0;

    a {
      width: 100%;
      img{
        max-width: 75%;
        height: auto;
        display: block;
        margin: 0 auto;
      }
      #cnrs-logo{
        max-width: 35%;
      }
    }
  }
</style>
