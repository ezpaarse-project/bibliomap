<template>
  <div class="drawer-elements-container">
    <div>
      <v-list-item>
        <v-card :flat="true">
          <v-card-title
            class="text-h4 justify-center"
            style="white-space: normal; overflow: visible;"
          >{{ t('info-card.title') }}</v-card-title>
          <v-card-text><p v-html="t('info-card.p1')" /></v-card-text>
        </v-card>
      </v-list-item>
      <v-list-item>
        <v-card :flat="true">
          <a href="https://bib.cnrs.fr/">
            <img :alt="t('info-card.img1-alt')" class="bibcnrs-img" src="@/assets/bibCnrs.png">
          </a>
          <v-card-text
            class="text-caption text-center"
            style="white-space: normal; overflow: visible;"
          >
            <p v-html="t('info-card.img1-caption')" />
          </v-card-text>
        </v-card>
      </v-list-item>
      <v-list-item>
        <v-card :flat="true">
          <div class="ez-logos">
            <a href="http://ezpaarse.couperin.org/"><img alt="ezPAARSE" src="@/assets/logo-ezpaarse.png"></a>
            <a href="https://ang.couperin.org//"><img alt="AnalogIST" src="@/assets/logo-analogist.png"></a>
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
            <a href="http://www.couperin.org/"><img alt="Couperin" src="@/assets/logo-couperin.jpg"></a>
            <a href="http://www.cnrs.fr/"><img alt="CNRS" src="@/assets/logo.svg"></a>
            <a href="http://www.univ-lorraine.fr/"><img alt="Université de Lorraine" src="@/assets/logo-universite-de-lorraine.png"></a>
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
      max-width: 70%;
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
        max-width: 70%;
        height: auto;
        display: block;
        margin: 0 auto;
      }
    }
  }
</style>
