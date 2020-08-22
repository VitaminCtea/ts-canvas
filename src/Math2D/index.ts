import { Vec2 } from '@/dataStructure/index'

export class Math2D {
    public static distance(x0: number, y0: number, x1: number, y1: number): number {
        const diffX: number = x1 - x0
        const diffY: number = y1 - y0
        return Math.sqrt(diffX * diffX + diffY * diffY)
    }

    public static toRadian(degree: number): number {
        return degree * Math.PI / 180 
    }

    public static toDegree(radian: number): number {
        return radian * 180 / Math.PI
    }

    public static isEquals(len1: number, len2: number): boolean {
        return Math.abs(len1 - len2) < Number.EPSILON
    }

    public static projectPointOnLineSegment(pt: Vec2, start: Vec2, end: Vec2, closePoint: Vec2): boolean {
        const v0: Vec2 = Vec2.create()  // 鼠标位置点的方向向量
        const v1: Vec2 = Vec2.create()  // 起始点的方向向量
        Vec2.difference(pt, start, v0)
        Vec2.difference(end, start, v1)
        const d: number = v1.toUnitVector()  // 转换单位向量
        const t: number = Vec2.dotProduct(v0, v1)   // 将v0投影在v1上, 获取投影长度t
        // 如果投影长度t < 0, 说明鼠标位置点在线段的起点范围之外
        // 处理的方式是: closePoint设置线段起点并且返回false
        if (t < 0) {
            closePoint.x = start.x
            closePoint.y = start.y
            return false
        } else if (t > d) {
            // 如果投影长度 > 线段的长度, 说明鼠标位置点超过线段终点范围
            // 处理的方式是: closePoint设置线段终点并且返回false
            closePoint.x = end.x
            closePoint.y = end.y
            return false
        } else {
            // 说明鼠标位置点位于线段起点和终点之间
            // 使用scaleAdd方法计算出相对全局坐标(左上角)的坐标便宜信息
            // 只有此时才返回true
            Vec2.scaleAdd(start, v1, t, closePoint)
            return true
        }
    }
    public static isPointInCircle(pt: Vec2, center: Vec2, radius: number): boolean {
        const diff: Vec2 = Vec2.difference(pt, center)
        const len: number = diff.squaredLength
        // 如果一个点在圆的半径范围之内, 说明发生了碰撞
        // 避免使用Math.sqrt方法
        if (len <= radius * radius) return true
        return false
    }
    // 点与线段及圆的碰撞检测算法
    public static isPointOnLineSegment(pt: Vec2, start: Vec2, end: Vec2, radius: number = 2): boolean {
        const closePoint: Vec2 = Vec2.create()
        if (!Math2D.projectPointOnLineSegment(pt, start, end, closePoint)) return false
        return Math2D.isPointInCircle(pt, closePoint, radius)
    }
    // 点与矩形的碰撞检测算法
    public static isPointInRect(ptX: number, ptY: number, x: number, y: number, w: number, h: number): boolean {
        if (ptX >= x && ptX <= x + w && ptY >= y && ptY <= y + h) return true
        return false
    }
    /**
     * 点与椭圆的碰撞检测算法
     * @param ptX {number} 点P的X坐标
     * @param ptY {number} 点P的Y坐标
     * @param centerX {number} 椭圆的中心点定义的X轴坐标点
     * @param centerY {number} 椭圆的中心点定义的Y轴坐标点
     * @param radiusX {number} 椭圆的X轴半径
     * @param radiusY {number} 椭圆的Y轴半径
     * 在这种情况下, 一个点P(ptX, ptY)如果在椭圆的内部, 那么要满足如下公式:
     * (ptX - centerX)² / radiusX² + (ptY - centerY)² / radiusY² <= 1.0
     */
    public static isPointInEllipse(ptX: number, ptY: number, centerX: number, centerY: number, radiusX: number, radiusY: number): boolean {
        const diffX: number = ptX - centerX
        const diffY: number = ptY - centerY
        return (diffX * diffX) / (radiusX * radiusX) + (diffY * diffY) / (radiusY * radiusY) <= 1.0
    }
    // 计算三角形两条边向量的叉积
    public static sign(v0: Vec2, v1: Vec2, v2: Vec2): number {
        const e1: Vec2 = Vec2.difference(v0, v2)    // e1 = v2 -> v0边向量
        const e2: Vec2 = Vec2.difference(v1, v2)    // e2 = v2 -> v1边向量
        return Vec2.crossProduct(e1, e2)    // 获取e1 cross e2的值
    }
    // 点与三角形的碰撞检测算法
    public static isPointInTriangle(pt: Vec2, v0: Vec2, v1: Vec2, v2: Vec2): boolean {
        // 计算三角形三个顶点与点pt形成的三个子三角形的边向量的叉积
        const b1: boolean = Math2D.sign(v0, v1, pt) < 0.0
        const b2: boolean = Math2D.sign(v1, v2, pt) < 0.0
        const b3: boolean = Math2D.sign(v2, v0, pt) < 0.0
        // 三角形三条边的方向都一致, 说明点在三角形内部
        // 否则就在三角形外部
        return ((b1 === b2) && (b2 === b3))
    }
    // 点与任意凸边形的碰撞检测
    public static isPointInPolygon(pt: Vec2, points: Vec2[]): boolean {
        if (points.length < 3) return false
        // 以points[0]为共享点, 遍历多边形点集, 构建三角形, 调用isPointInTriangle方法
        // 一旦点与某个三角形发生碰撞, 就返回true
        for (let i: number = 2; i < points.length; i++) {
            if (Math2D.isPointInTriangle(pt, points[0], points[i - 1], points[i])) return true
        }
        // 没有和多边形中的任何三角形发生碰撞, 返回false
        return false
    }
    // 判断凸边形的算法
    public static isConvex(points: Vec2[]): boolean {
        // 第一个三角形的顶点顺序
        const sign: boolean = Math2D.sign(points[0], points[1], points[2]) < 0
        // 从第二个三角形开始遍历
        let j: number
        let k: number
        for (let i: number = 1; i < points.length; i++) {
            j = (i + 1) % points.length
            k = (i + 2) % points.length
            // 如果当前的三角形的顶点方向和第一个三角形的顶点方向不一致, 说明是凹边形
            if (sign !== Math2D.sign(points[i], points[j], points[k]) < 0) return false
        }
        // 凸边形
        return true
    }
}