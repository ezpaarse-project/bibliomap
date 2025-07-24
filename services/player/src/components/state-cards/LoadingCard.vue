<template>
  <div class="loading">
    <div class="loading-icon-container">
      <span class="loading-icon"><v-icon icon="mdi-autorenew" /></span>
      <span class="loading-icon-background"><v-icon icon="mdi-autorenew" /></span>
    </div>
    <span class="loading-text">{{ t('player.loading') }}</span>
  </div>
</template>
<script setup lang="ts">
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
</script>
<style scoped lang='scss'>
.loading {
  z-index: 1000;
  width: 110px;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.loading .loading-text {
  font-size: 20px;
  text-transform: uppercase;
  font-weight: bold;
  color: darkgreen;
  text-shadow: 0px 0px 20px darkgreen;
  float: right;
  margin: -5px 0 5px;
  white-space: nowrap;
}

.loading-icon-container{
  display: flex;
}

.loading .loading-icon{
  height: 18px;
  width: 18px;
  color: darkgreen;
  text-shadow: 0px 0px 20px darkgreen;
  display: inline-block;
  margin-right: 10px;
  margin-bottom: 9px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: loading-animation ease-out 4s infinite;
  z-index: 1002;
}

.loading .loading-icon-background{
  opacity: .5;
  height: 18px;
  width: 18px;
  color: rgba(0, 100, 0, 1);
  text-shadow: 0px 0px 20px rgba(0, 100, 0, 1);
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: loading-background-animation ease-out 4s infinite;
  z-index: 1001;
}

@keyframes loading-animation {
  0%{
    transform: rotate(0deg) scale(1.8);
  }
  50%{
    transform: rotate(360deg) scale(1.2);
  }
  100%{
    transform: rotate(720deg) scale(1.2);
  }
}

@keyframes loading-background-animation {
  0%{
    transform: rotate(0deg) scale(1.5);
    opacity: .5;
  }
  50%{
    transform: scale(3);
    transform: rotate(360deg) scale(4);
    opacity: 0;
  }
  100%{
    transform: rotate(720deg) scale(3);
    opacity: 0;
  }
}
</style>
