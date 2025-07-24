<template>
  <div class="pause">
    <div class="pause-circle-container">
      <span class="pause-circle"><v-icon icon="mdi-pause-circle" /></span>
      <span class="pause-circle-background" />
      <span class="second-pause-circle-background" />
    </div>
    <span class="pause-text">{{ t('player.pause') }}</span>
  </div>
</template>
<script setup lang="ts">
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
</script>
<style lang='scss' scoped>
  .pause {
    z-index: 1000;
    width: 110px;
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .pauseWithLegend {
    margin: 0 0 20px 330px;
  }

  .pauseWithoutLegend {
    margin: 0 0 20px 30px;
  }

  .pause .pause-text {
    font-size: 20px;
    text-transform: uppercase;
    font-weight: bold;
    color: #555557;
    text-shadow: 0px 0px 20px #555557;
    float: right;
    margin: -5px 0 5px;
    white-space: nowrap;
  }

  .pause-circle-container{
    display: flex;
  }

  .pause .pause-circle{
    height: 18px;
    width: 18px;
    color: #555557;
    text-shadow: 0px 0px 20px #555557;
    margin-right: 10px;
    margin-bottom: 9px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: pause-animation ease-out 4s infinite;
    z-index: 1002;
  }

  .pause .pause-circle-background{
    opacity: .5;
    height: 18px;
    width: 18px;
    background: rgba(0, 0, 0, 1);
    border-radius: 50%;
    text-shadow: 0px 0px 20px rgba(0, 0, 0, 1);
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: pause-background-animation ease-out 4s infinite;
    z-index: 1001;
  }

  .second-pause-circle-background {
    opacity: 0;
    height: 18px;
    width: 18px;
    background: rgba(0, 0, 0, 1);
    border-radius: 50%;
    text-shadow: 0px 0px 20px rgba(0, 0, 0, 1);
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: pause-background-animation ease-out 4s infinite;
    z-index: 1001;
    animation-delay: 2s;
  }

  @keyframes pause-animation {
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

  @keyframes pause-background-animation {
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
