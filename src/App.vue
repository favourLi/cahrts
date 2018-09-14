<template>
  <div id="app">
    <canvas id="canvas"></canvas>
    <div id="show" ref="showPop" v-show="show">{{showText}}</div>
  </div>
</template>

<script>
import data from './data/data.js'
import data1 from './data/data1.js'
import Charts from './main/charts.js'
import Utils from './main/Utils.js'

export default {
  name: 'app',
  data: function () {
    return {
      showText: '',
      show: false,
      t: null
    }
  },

  mounted() {
    let charts = new Charts(data1)
    window.charts = charts
    window.Utils = Utils
    let canvas = document.getElementById('canvas')
    let domApp = document.getElementById('app')
    let cw = window.getComputedStyle(domApp, false).width.replace('px', '')
    let ch = window.getComputedStyle(domApp, false).height.replace('px', '')
    let ctx = canvas.getContext('2d')
    canvas.width = cw
    canvas.height = ch
    charts.draw(canvas)
    charts.__proto__.show = this.showPop
    // 阻止滚动
    document.addEventListener('touchmove', function(event){
      // 判断默认行为是否可以被禁用
      if (event.cancelable) {
        // 判断默认行为是否已经被禁用
        if (event.defaultPrevented) {
          event.preventDefault();
        }
      }
    })

  },
  methods: {
    showPop(str, top, left) {
      this.show = true
      this.showText = str
      this.$refs.showPop.style.cssText = `top: ${top}px;left: ${left}px`
      if (this.t) clearTimeout(this.t)
      this.t = setTimeout(() => {
        this.show = false
      }, 1500)
    }
  }
}

</script>

<style lang="scss">
*{
  padding: 0;
  margin: 0;
}
#app {
  width: 100%;
  height: 100vh;
  display: flex;
}
#show{
  padding: 4px 10px;
  line-height: 30px;
  border-radius: 5px;
  background: rgba(0,0,0,0.7);
  position: fixed;
  top: 40vh;
  left: 50vw;
  transform: translate(-50%);
  z-index: 100;
  color: #fff;
}
</style>
