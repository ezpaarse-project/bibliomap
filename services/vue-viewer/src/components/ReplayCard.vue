<template>
  <div class="live">
    <span class="live-circle" />
    <span class="live-text">REPLAY</span>
  </div>
</template>

<style lang='scss'>
  .live {
    color: red;
    z-index: 1000;
    width: 100px;
  }

  .liveWithLegend {
    margin: 0 0 20px 330px;
  }

  .liveWithoutLegend {
    margin: 0 0 20px 30px;
  }

  .live .live-text {
    font-size: 20px;
    text-transform: uppercase;
    font-weight: bold;
    color: #c0392b;
    text-shadow: 0px 0px 20px red;
    float: right;
    margin: -5px 0 0 5px;
  }

  .live .live-circle {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: red;
    display: inline-block;
    animation: ripple 0.7s linear infinite;
    margin-right: 10px;
  }

  @keyframes ripple {
    0% {
      box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.3),
                  0 0 0 1px rgba(255, 0, 0, 0.3),
                  0 0 0 5px rgba(255, 0, 0, 0.3),
                  0 0 0 10px rgba(255, 0, 0, 0.3);
    }
    100% {
      box-shadow: 0 0 0 1px rgba(255, 0, 0, 0.3),
                  0 0 0 5px rgba(255, 0, 0, 0.3),
                  0 0 0 10px rgba(255, 0, 0, 0.3),
                  0 0 0 15px rgba(255, 0, 0, 0);
    }
  }
</style>
