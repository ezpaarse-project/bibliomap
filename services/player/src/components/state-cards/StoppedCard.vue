<template>
  <div class="stopped">
    <div class="stopped-circle-container">
      <span class="stopped-circle"><v-icon icon="mdi-stop-circle" /></span>
      <span class="stopped-circle-background" />
      <span class="second-stopped-circle-background" />
    </div>
    <span class="stopped-text">{{ t('state-card.stopped') }}</span>
  </div>
</template>
<script setup lang="ts">
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
</script>
<style lang='scss' scoped>
  .stopped {
    z-index: 1000;
    width: 110px;
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .stoppedWithLegend {
    margin: 0 0 20px 330px;
  }

  .stoppedWithoutLegend {
    margin: 0 0 20px 30px;
  }

  .stopped .stopped-text {
    font-size: 20px;
    text-transform: uppercase;
    font-weight: bold;
    color:  #c0392b;
    text-shadow: 0px 0px 20px  #c0392b;
    float: right;
    margin: -5px 0 5px;
    white-space: nowrap;
  }

  .stopped-circle-container{
    display: flex;
  }

  .stopped .stopped-circle{
    height: 18px;
    width: 18px;
    color: #c0392b;
    text-shadow: 0px 0px 20px rgba(255, 0, 0, 0.3);
    margin-right: 10px;
    margin-bottom: 9px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: stopped-animation ease-out 4s infinite;
    z-index: 1002;
  }

  .stopped .stopped-circle-background{
    opacity: .5;
    height: 18px;
    width: 18px;
    background: rgba(255, 0, 0, 1);
    border-radius: 50%;
    text-shadow: 0px 0px 20px rgba(255, 0, 0, 1);
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: stopped-background-animation ease-out 4s infinite;
    z-index: 1001;
  }

  .second-stopped-circle-background {
    opacity: 0;
    height: 18px;
    width: 18px;
    background: rgba(255, 0, 0, 1);
    border-radius: 50%;
    text-shadow: 0px 0px 20px rgba(255, 0, 0, 1);
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: stopped-background-animation ease-out 4s infinite;
    z-index: 1001;
    animation-delay: 2s;
  }

  @keyframes stopped-animation {
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

  @keyframes stopped-background-animation {
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
