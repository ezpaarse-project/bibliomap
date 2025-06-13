<template>
  <div class="replay">
    <div class="replay-circle-container">
      <span class="replay-circle"><v-icon icon="mdi-autorenew" /></span>
      <span class="replay-circle-background"><v-icon icon="mdi-autorenew" /></span>
    </div>
    <span class="replay-text">LOADING</span>
  </div>
</template>

<style scoped lang='scss'>
.replay {
  z-index: 1000;
  width: 110px;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.replayWithLegend {
  margin: 0 0 20px 330px;
}

.replayWithoutLegend {
  margin: 0 0 20px 30px;
}

.replay .replay-text {
  font-size: 20px;
  text-transform: uppercase;
  font-weight: bold;
  color: darkgreen;
  text-shadow: 0px 0px 20px darkgreen;
  float: right;
  margin: -5px 0 5px;
  white-space: nowrap;
}

.replay-circle-container{
  display: flex;
}

.replay .replay-circle{
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
  animation: replay-animation ease-out 4s infinite;
  z-index: 1002;
}

.replay .replay-circle-background{
  opacity: .5;
  height: 18px;
  width: 18px;
  color: rgba(0, 100, 0, 1);
  text-shadow: 0px 0px 20px rgba(0, 100, 0, 1);
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: replay-background-animation ease-out 4s infinite;
  z-index: 1001;
}

@keyframes replay-animation {
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

@keyframes replay-background-animation {
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
