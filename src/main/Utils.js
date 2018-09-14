import Node from './node'
import Point from './Point'

export default function Utils() {
    this.name = 'Utils'
}

Utils.__proto__.arrange = arrange
Utils.__proto__.shrinkAngle = shrinkAngle
Utils.__proto__.transfer2Node = transfer2Node
Utils.__proto__.sortChildren = sortChildren
Utils.__proto__.setNodeAttr = setNodeAttr
Utils.__proto__.changeNodeAttr = changeNodeAttr
Utils.__proto__.findNodeByCoord = findNodeByCoord
Utils.__proto__.calcNodeRect = calcNodeRect
Utils.__proto__.getOrigin = getOrigin
Utils.__proto__.getDistance = getDistance
Utils.__proto__.testCons = testCons

// 获取缩放中心点
function getOrigin(first, second) {
    return {
        x: (first.x + second.x) / 2,
        y: (first.y + second.y) / 2
    };
}

// 获取缩放距离
function getDistance(start, stop) {
    return Math.sqrt(Math.pow((stop.x - start.x), 2) + Math.pow((stop.y - start.y), 2)) 
}

// 判断坐标是否在节点矩形区域内部
function isInRect(coord, node) {
    let isInX = false
    if (coord.x >= node.rect[0].x && coord.x <= node.rect[1].x) {
        isInX = true
    }
    let isInY = false
    if (coord.y >= node.rect[0].y && coord.y <= node.rect[1].y) {
        isInY = true
    }
    return isInX && isInY
}

// 判断坐标是否在节点内部
function isInNode(coord, node) {
    let isInX = false
    if (coord.x >= node.x - node.circleRadius * 1.2 && coord.x <= node.x + node.circleRadius * 1.2) {
        isInX = true
    }
    let isInY = false
    if (coord.y >= node.y - node.circleRadius * 1.2 && coord.y <= node.y + node.circleRadius * 1.2) {
        isInY = true
    }
    return isInX && isInY
}

// 根据坐标找到对应节点
function findNodeByCoord(coord, node) {
    let theNode
    if (node.children && node.children.length && isInChildRect(coord, node.children)) {
        node.children.map(v => {
            if (isInRect(coord, v)) {
                theNode = findNodeByCoord(coord, v)
            }
        })
    } else if (isInNode(coord, node)) {
        theNode = node
    }
    return theNode
}
// 判断坐标是否在节点的子节点矩形区域内部
function isInChildRect(coord, children) {
    let isInChild = false
    children.map(v => {
        if (v.children && v.children.length) {
            if(isInChildRect(coord, v.children)) {
                isInChild = true
            }
        }
        if (isInRect(coord, v)) {
            isInChild = true
        }
    })
    return isInChild
}

// 修改对应节点的radius，节点的X,Y会随之修改
function setNodeAttr(node) {
    node.radius = 40
    if (node.children && node.children.length) {
        node.children.map((v, i) => {
            setNodeAttr(v)
        })
    }
    calcNodeRect(node)
}

// 如果碰撞则修改于当前节点碰撞的节点的radius
function changeNodeAttr(node, root) {
    root.children.sort((a, b) => {
        return a.order - b.order
    }).map(v => {
        if (v !== node) {
            while(testCons(v, node)) {
                v.radius += 1
                refresh(getFlevel(v).children)
                calcNodeRect(getFlevel(v))
            }
            while(testRectLineIntersect(node, v, v.parent)) {
                v.radius += 1
                node.radius += 1
                refresh(getFlevel(v).children)
                calcNodeRect(getFlevel(v))
                refresh(getFlevel(node).children)
                calcNodeRect(getFlevel(node))
            }
        }
    })
    if (node.children && node.children.length) {
        node.children.map(v => {
            changeNodeAttr(v, node)
        })
    }
}

function getFlevel(node) {
    if (node.data.level != 1) {
        return getFlevel(node.parent)
    } else {
        return node
    }
}

// 测试矩形区域碰撞
function testCons(node1, node2) {
    let minx1 = node1.rect[0].x
    let minx2 = node2.rect[0].x
    let maxx1 = node1.rect[1].x
    let maxx2 = node2.rect[1].x

    let miny1 = node1.rect[0].y
    let miny2 = node2.rect[0].y
    let maxy1 = node1.rect[1].y
    let maxy2 = node2.rect[1].y

    let xCollision = false;
    if ((minx2 >= minx1 && minx2 <= maxx1) || (maxx2 >= minx1 && maxx2 <= maxx1) || (minx1 >= minx2 && minx1 <= maxx2) || (maxx1 >= minx2 && maxx1 <= maxx2)) {
		xCollision = true;
    }

	let yCollision = false;
    if ((miny2 >= miny1 && miny2 <= maxy1) || (maxy2 >= miny1 && maxy2 <= maxy1) || (miny1 >= miny2 && miny1 <= maxy2) || (maxy1 >= miny2 && maxy1 <= maxy2)) {
		yCollision = true;
    }
	return xCollision && yCollision;
}

// 刷新节点
function refresh(children) {
    children.map(v => {
        v.refresh()
        if (v.children && v.children.length) {
            refresh(v.children)
        }
        calcNodeRect(v)
    })
}

// 计算Node的矩形区域
function calcNodeRect(node) {
    let arr = []
    let min = new Point(getMinX(node, node.x - node.circleRadius), getMinY(node, node.y - node.circleRadius))
    let max = new Point(getMaxX(node, node.x + node.circleRadius), getMaxY(node, node.y + node.circleRadius))
    arr.push(min, max)
    node.rect = arr
}

// 按children数量排序数据
function sortChildren(children) {
    children.sort((a, b) => {
        return a.numChild - b.numChild
    }).map((v, i) => {
        if (v.children) {
            v.children = sortChildren(v.children)
        }
        v.order = i + 1
    })
    return children
}

// 将子节点转换为Node
function transfer2Node(children, root) {
    let arr = children.map(v => {
        let node = new Node(v, root)
        if (node.children) {
            node.children = transfer2Node(node.children, node)
        }
        return node
    })
    return arr
}

// 求得节点的角度
function arrange(arr, maxAngle) {
    let N = arr.length
    for(let i = 0; i < N; i++) {
        arr[i].angle = maxAngle + Math.PI * 2 / N * i
    }
    arr[0].order = N
    arr[0].x = arr[0].order * Math.cos(arr[0].angle)
    arr[0].y = 0 - arr[0].order * Math.sin(arr[0].angle)

    for(let i = 0; i < N; i++) {
        let sumX = 0, sumY = 0;
        for(let j = 0; j < N; j++) {
            if (arr[j].order) {
                sumX += arr[j].x;
                sumY += arr[j].y;
            }
        }
        let min = 100000
        let index = -1
        let order = N - i - 1
        for(let j = 0; j < N; j++) {
            if (!arr[j].order) {
                let absX = Math.abs(sumX + order * Math.cos(arr[j].angle))
                let absY = Math.abs(sumY - order * Math.sin(arr[j].angle))
                if (absX + absY < min) {
                    index = j;
                    min = absX + absY;
                }
            }
        }

        if (index >= 0) {
            arr[index].order = order
            arr[index].x = arr[index].order * Math.cos(arr[index].angle);
            arr[index].y = 0 - arr[index].order * Math.sin(arr[index].angle);
        }
    }

}

// 合并角度
function shrinkAngle(min, max, arr) {
    for(let i of arr) {
        i.angle = min + (max - min) / (2 * Math.PI) * i.angle
    }
}

// 测试线段与矩形是否相交
function testRectLineIntersect(root, node1, node2) {
    let minx = root.rect[0].x
    let miny = root.rect[0].y
    let maxx = root.rect[1].x
    let maxy = root.rect[1].y

    let A1 = new Point(minx, miny)
    let A2 = new Point(minx, maxy)
    let A3 = new Point(maxx, maxy)
    let A4 = new Point(maxx, miny)

    let point1 = new Point(node1.x, node1.y)
    let point2 = new Point(node2.x, node2.y)
    
    if (
        testLineLineIntersect(A1, A2, point1, point2) ||
        testLineLineIntersect(A2, A3, point1, point2) ||
        testLineLineIntersect(A3, A4, point1, point2) ||
        testLineLineIntersect(A4, A1, point1, point2)
    ) {
        return true
    }
    return false
}

// 测试两条线段是否相交
function testLineLineIntersect(A1, A2, B1, B2) {
    let T1 = cross(A1, A2, B1)
    let T2 = cross(A1, A2, B2)
    let T3 = cross(B1, B2, A1)
    let T4 = cross(B1, B2, A2)

    if (((T1 * T2) > 0) || ((T3 * T4) > 0)) {    // 一条线段的两个端点在另一条线段的同侧，不相交。（可能需要额外处理以防止乘法溢出，视具体情况而定。）
        return false;
    } else if(T1 == 0 && T2 == 0) {
        // 两条线段共线，利用快速排斥实验进一步判断。此时必有 T3 == 0 && T4 == 0。
        let xIntersect = false;
        if ((B1.x >= A1.x && B1.x <= A2.x) || (B1.x >= A1.x && B2.x >= A1.x)) {
            xIntersect = true;
        }

        let yIntersect = false;
        if ((B1.y >= A1.y && B1.y <= A2.y) || (B1.y >= A1.y && B2.y >= A1.y)) {
            yIntersect = true;
        }
        
        return xIntersect && yIntersect;
    } else {                                    // 其它情况，两条线段相交。
        return true;
    }
}

function cross(A, B, C) {
    let cross1 = (C.x - A.x) * (B.y - A.y)
    let cross2 = (C.y - A.y) * (B.x - A.x)
    return (cross1 - cross2)
}

function getMinX(root, min) {
    if (root.x - root.circleRadius < min) {
        min = root.x - root.circleRadius ;
    }
    if (root.children && root.children.length > 0) {
        for (let node of root.children) {
            let tmp = getMinX(node, min);
            if (tmp < min) {
                min = tmp;
            }
        }
    }

    return min;
}

function getMinY(root, min) {
    if (root.y - root.circleRadius  < min) {
        min = root.y - root.circleRadius ;
    }
    if (root.children && root.children.length > 0) {
        for (let node of root.children) {
            let tmp = getMinY(node, min);
            if (tmp < min) {
                min = tmp;
            }
        }
    }

    return min;
}

function getMaxX(root, max) {
    if (root.x + root.circleRadius  > max) {
        max = root.x + root.circleRadius ;
    }
    if (root.children && root.children.length > 0) {
        for (let node of root.children) {
            let tmp = getMaxX(node, max);
            if (tmp > max) {
                max = tmp;
            }
        }
    }

    return max;
}

function getMaxY(root, max) {
    if (root.y + root.circleRadius  > max) {
        max = root.y + root.circleRadius ;
    }
    if (root.children && root.children.length > 0) {
        for (let node of root.children) {
            let tmp = getMaxY(node, max);
            if (tmp > max) {
                max = tmp;
            }
        }
    }

    return max;
}