export default class Node{
    constructor(data, parent) {
        this.data = data
        this.parent = parent
        this.children = data.children
        this.id = null
        this.styles = {
            color: '#2826f7'
        }
        this.numChild = data.childLen
        if (this.numChild == 0) {
            this.circleRadius = 10
        } else {
            this.circleRadius = 12
        }
        this.order = null
        this.angle = null
        this.x = null
        this.y = null
        this.radius = null
        this.rect = null
        
        let radius = 0

        
        Object.defineProperty(this, "radius", {
            set: (value) => {
                if (typeof value === 'number') {
                    radius = value
                    this.refresh()
                }
            },
            get: () => radius
        }, {enumerable: true})

    }

    refresh() {
        let parentx = this.parent ? this.parent.x : 0
        let parenty = this.parent ? this.parent.y : 0
        this.x = this.radius * Math.cos(this.angle) + parentx
        this.y = 0 - this.radius * Math.sin(this.angle) + parenty
    }
}

