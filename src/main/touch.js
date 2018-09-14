export default class Touch{
  constructor() {
    this.name = 'Touch'
  }

}
let distance = {}
let move = {}
let moveTo = {}
let origin = {}
let scale = 1
let allScale = 1
Touch.__proto__.handleTouch = handleTouch
Touch.__proto__.setScaleAnimation = setScaleAnimation
Touch.__proto__.setTransform = setTransform

// 触摸事件处理方法
function handleTouch (e) {
  switch(e.type) {
    case 'touchstart':
      if (e.touches.length === 1) {
        move = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        }
        origin = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        }
        // scale = 1.5
        // Touch.setScaleAnimation();
      } else if (e.touches.length > 1) {
        distance.start = getDistance({
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        }, {
          x: e.touches[1].clientX,
          y: e.touches[1].clientY
        })
      }
      break;
    case 'touchmove':
      if (e.touches.length === 1) {
        moveTo = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        }
        Touch.setTransform()
      } else if (e.touches.length === 2) {
        distance.stop = getDistance({
            x: e.touches[0].clientX, 
            y: e.touches[0].clientY  
        }, {
            x: e.touches[1].clientX, 
            y: e.touches[1].clientY
        });
        origin = getOrigin({
            x: e.touches[0].clientX, 
            y: e.touches[0].clientY
        }, {
            x: e.touches[1].clientX, 
            y: e.touches[1].clientY
        });
        scale = distance.stop/distance.start
        distance.start = distance.stop
        Touch.setScaleAnimation();
      }
      break;
    case 'touchend':
        // scale = 1;
        // Touch.setScaleAnimation();
        break;
    case 'touchcancel':
        scale = 1;
        Touch.setScaleAnimation();
        break;
    default:;
  }
}
  
function setScaleAnimation() {
  // this.ctx.clearRect(-this.cw/2, -this.ch/2, this.cw, this.ch)
  // this.ctx.clearRect(0, 0, this.cw, this.ch)
  console.log(this.ctx)
  this.ctx.scale(scale, scale)
  allScale = scale * allScale
  this.ctx.translate(-(origin.x * scale - origin.x) / scale, -(origin.y * scale - origin.y) / scale)
}

function setTransform() {
  let x = moveTo.x - move.x
  let y = moveTo.y - move.y
  console.log(x, y)
  this.ctx.translate(3,3)
  // this.ctx.clearRect(-this.cw/2, -this.ch/2, this.cw, this.ch)
  // this.ctx.translate(x/allScale, y/allScale)
  move = moveTo
}