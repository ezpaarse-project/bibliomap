<template>
  <div class="playing">
    <div class="playing-circle-container">
      <span class="playing-circle"><v-icon icon="mdi-play-circle" /></span>
      <span class="playing-circle-background" />
      <span class="second-playing-circle-background" />
    </div>
    <span class="playing-text">{{ t('player.playing') }}</span>
  </div>
</template>
<script setup lang="ts">
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
</script>
<style lang='scss' scoped>
  .playing {
    z-index: 1000;
    width: 110px;
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .playingWithLegend {
    margin: 0 0 20px 330px;
  }

  .playingWithoutLegend {
    margin: 0 0 20px 30px;
  }

  .playing .playing-text {
    font-size: 20px;
    text-transform: uppercase;
    font-weight: bold;
    color: green;
    text-shadow: 0px 0px 20px darkgreen;
    float: right;
    margin: -5px 0 5px;
    white-space: nowrap;
  }

  .playing-circle-container{
    display: flex;
  }

  .playing .playing-circle{
    height: 18px;
    width: 18px;
    color: darkgreen;
    text-shadow: 0px 0px 20px darkgreen;
    margin-right: 10px;
    margin-bottom: 9px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: playing-animation ease-out 4s infinite;
    z-index: 1002;
  }

  .playing .playing-circle-background{
    opacity: .5;
    height: 18px;
    width: 18px;
    background: rgba(0, 100, 0, 1);
    border-radius: 50%;
    text-shadow: 0px 0px 20px rgba(0, 100, 0, 1);
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: playing-background-animation ease-out 4s infinite;
    z-index: 1001;
  }

  .second-playing-circle-background {
    opacity: 0;
    height: 18px;
    width: 18px;
    background: rgba(0, 100, 0, 1);
    border-radius: 50%;
    text-shadow: 0px 0px 20px rgba(0, 100, 0, 1);
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: playing-background-animation ease-out 4s infinite;
    z-index: 1001;
    animation-delay: 2s;
  }

  @keyframes playing-animation {
    0%{
      transform: scale(1.8);
    }
    50%{
      transform: scale(1.2);
    }
    100%{
      transform: scale(1.2);
    }
  }

  @keyframes playing-background-animation {
    0%{
      transform: scale(1.5);
      opacity: .2;
    }
    50%{
      transform: scale(4);
      opacity: 0;
    }
    100%{
      transform: scale(3);
      opacity: 0;
    }
  }
</style>
