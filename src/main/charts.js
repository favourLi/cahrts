import Node from './node.js'
import Utils from './Utils'

export default class Charts{
    constructor(data) {
        this.styles = {
            radius: 40,
            activeColor: '#2826f7', // 选中节点的颜色
            notActiveColor: '#6d9eeb' // 未选中节点颜色
        }
        this.id = 0
        this.root = new Node(data, null)
        this.root.id = this.id++

        // 移动参数
        this.distance = {}
        this.move = {}
        this.moveTo = {}
        this.origin = {}
        this.scale = 1
        this.allScale = 1
    }

    // 给Node节点增加ID属性
    addNodeId(children) {
        children.map(v => {
            v.id = this.id++
            if (v.children) {
                this.addNodeId(v.children)
            }
        })
    }

    // 求得子节点角度
    angle(node, bool) {
        let children = node.children
        if (!node.children || node.children.length == 0) return

        let arr = []
        for(let i = 0; i < children.length; i++) {
            arr.push(new Node(children[i], node))
        }
        if (bool) {
            Utils.arrange(arr, Math.PI / 2)
        } else {
            Utils.arrange(arr, Math.PI / arr.length)
            Utils.shrinkAngle(node.angle - Math.PI / 2, node.angle + Math.PI / 2, arr)
        }

        let newChildren = []
        console.log(Object.assign(children))
        for(let i = 0; i < children.length; i++) {
            for(let j = 0; j < arr.length; j++) {
                if (children[i].order == arr[j].order) {
                    newChildren[j] = children[i]
                    children[i].angle = arr[j].angle
                }
            }
        }
        node.children = newChildren

        for(let i of children) {
            this.angle(i)
        }
    }

    // 提供ID返回对应节点
    getNodeById(id, children) {
        let child = children || this.root.children
        let theNode
        for(let item of child) {
            if (item.id == id) {
                theNode = item
            }
            if (item.children && item.children.length) {
                if (this.getNodeById(id, item.children)) {
                    theNode = this.getNodeById(id, item.children)
                }
            }
        }
        return theNode
    }

    // 修改点击节点及其父子节点的颜色
    changeNodeColor(node) {
        let color = this.styles.notActiveColor
        this.root.styles.color = color
        this.changeAllNodeColor(color, this.root)
        let activeColor = this.styles.activeColor
        node.styles.color = activeColor
        if (node.parent) {
            node.parent.styles.color = activeColor
        }
        if (node.children && node.children.length) {
            node.children.map(v => {
                v.styles.color = activeColor
            })
        }
    }

    // 修改所有Node颜色
    changeAllNodeColor(color, node) {
        node.styles.color = color
        if (node.children && node.children.length) {
            node.children.map(v => {
                this.changeAllNodeColor(color, v)
            })
        }
    }

    // 开始绘画
    start() {
        this.ctx.beginPath()
        this.ctx.arc(this.root.x, this.root.y, this.root.circleRadius, 0, Math.PI * 2)
        this.ctx.fillStyle = this.root.styles.color
        this.ctx.fill()
        this.root.children.sort((a, b) => a.numChild <= b.numChild)
        for(let [i, v] of this.root.children.entries()) {
            this.drawNode(v, this.root)
        }
    }
    
    // 开始绘画
    draw(canvas) {
        this.ch = window.getComputedStyle(canvas, false).height.replace('px', '')
        this.cw = window.getComputedStyle(canvas, false).width.replace('px', '')
        
        // 将子节点转换为Node对象
        this.root.children = Utils.transfer2Node(this.root.children, this.root)

        // 将子节点order赋值
        let children = Utils.sortChildren(this.root.children)

        // 给子节点id赋值
        this.addNodeId(children)

        // 给子节点angle赋值
        this.angle(this.root, true)

        // 求出子节点半径和坐标
        this.root.x = this.cw / 2
        this.root.y = this.ch / 2
        for(let [index, item] of children.entries()) {
            Utils.setNodeAttr(item)
        }

        // 计算碰撞修改子节点半径和坐标
        for(let [index, item] of children.entries()) {
            Utils.changeNodeAttr(item, this.root)
        }
        Utils.calcNodeRect(this.root)
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')
        this.start()

        // 点击事件
        this.canvas.onclick = (el) => {
            let pos = { x: el.clientX, y: el.clientY }
            let node = Utils.findNodeByCoord(pos, this.root)
            if (!node) return
            if (this.activeNode == node) {
                this.activeNode = null
                this.changeAllNodeColor(this.styles.activeColor, this.root)
            } else {
                this.activeNode = node
                this.changeNodeColor(node)
            }
            this.show(node.id, el.clientY - node.circleRadius * 4, el.clientX)
            this.clearCtx()
            this.start()
        }

        // 触摸开始事件
        this.canvas.ontouchstart = (e) => {
            if (e.touches.length === 1) {
                this.move = {
                  x: e.touches[0].clientX,
                  y: e.touches[0].clientY
                }
              } else if (e.touches.length > 1) {
                this.distance.start = Utils.getDistance({
                  x: e.touches[0].clientX,
                  y: e.touches[0].clientY
                }, {
                  x: e.touches[1].clientX,
                  y: e.touches[1].clientY
                })
              }
        }

        // 触摸移动事件
        this.canvas.ontouchmove = (e) => {
            if (e.touches.length === 1) {
              this.moveTo = {
                  x: e.touches[0].clientX,
                  y: e.touches[0].clientY
              }
              this.setTransform()
            } else if (e.touches.length === 2) {
              this.distance.stop = Utils.getDistance({
                  x: e.touches[0].clientX, 
                  y: e.touches[0].clientY  
              }, {
                  x: e.touches[1].clientX, 
                  y: e.touches[1].clientY
              });
              this.origin = Utils.getOrigin({
                  x: e.touches[0].clientX / this.allScale, 
                  y: e.touches[0].clientY / this.allScale
              }, {
                  x: e.touches[1].clientX / this.allScale, 
                  y: e.touches[1].clientY / this.allScale
              });
              this.scale = this.distance.stop/this.distance.start
              this.distance.start = this.distance.stop
              this.setScaleNode(this.origin.x, this.origin.y)
            }
            e.preventDefault();
        }

        // 触摸结束事件
        this.canvas.ontouchend = (e) => {
            if (e.touches.length === 2) {
                this.scale = 1
                this.setScaleNode(e.touches[0].clientX, e.touches[0].clientY)
            }
        }

        // 触摸取消事件
        this.canvas.ontouchcancel = (e) => {
            if (e.touches.length === 2) {
                this.scale = 1
                this.setScaleNode(e.touches[0].clientX, e.touches[0].clientY)
            }
        }
    }

    // 缩放
    setScaleNode(x, y) {
        this.clearCtx()
        this.root.circleRadius *= this.scale
        this.allScale *= this.scale
        this.root.x = x - (x - this.root.x) * this.scale
        this.root.y = y - (y - this.root.y) * this.scale
        this.scaleChildren(this.root.children, this.scale)
        Utils.calcNodeRect(this.root)
        this.start()
    }

    // 缩放递归
    scaleChildren(children, scale) {
        children.map(v => {
            v.radius *= scale
            v.circleRadius *= scale
            Utils.calcNodeRect(v)
            v.refresh()
            if (v.children && v.children.length) {
                this.scaleChildren(v.children, scale)
            }
        })
    }

    // 拖动
    setTransform() {
        this.clearCtx()
        let x = this.moveTo.x - this.move.x
        let y = this.moveTo.y - this.move.y
        this.root.x += x
        this.root.y += y
        this.transfomNode(this.root.children, x, y)
        Utils.calcNodeRect(this.root)
        this.start()
        this.move = this.moveTo
      }

      // 拖动递归
      transfomNode(children, x, y) {
        children.map(v => {
            v.x += x
            v.y += y
            Utils.calcNodeRect(v)
            v.refresh()
            if (v.children && v.children.length) {
                this.transfomNode(v.children, x, y)
            }
        })
    }

    // 清空canvas
    clearCtx() {
        let LTX = this.root.rect[0].x - 20
        let LTY = this.root.rect[0].y - 20
        let RBX = this.root.rect[1].x + 20
        let RBY = this.root.rect[1].y + 20
        this.ctx.clearRect(LTX, LTY, Math.abs(RBX - LTX), Math.abs(RBY - LTY))
    }

    // 绘画子节点
    drawNode(node, root) {
        this.ctx.beginPath()
        this.ctx.arc(node.x, node.y, node.circleRadius, 0, Math.PI * 2)
        this.ctx.fillStyle = node.styles.color
        this.ctx.fill()
        this.ctx.moveTo(node.x, node.y)
        this.ctx.lineTo(root.x, root.y)
        this.ctx.save()
        this.ctx.fillStyle = '#ffffff'
        this.ctx.textAlign = 'center'
        this.ctx.textBaseline = 'middle'
        this.ctx.font = '12px sans-serif'
        this.ctx.fillText(node.id, node.x, node.y)
        this.ctx.globalCompositeOperation = 'destination-over'
        this.ctx.stroke()
        this.ctx.restore()
        if (node.children) {
            node.children.sort((a, b) => a.numChild > b.numChild)
            for(let [i, v] of node.children.entries()) {
                this.drawNode(v, node)
            }
        }
    }

}