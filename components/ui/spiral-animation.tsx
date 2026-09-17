'use client'
import { useEffect, useRef } from 'react'
import { useTheme } from '@/components/theme-provider'
import { gsap } from 'gsap'

class Vector2D {
    constructor(public x: number, public y: number) {}
    
    static random(min: number, max: number): number {
        return min + Math.random() * (max - min)
    }
}

class Vector3D {
    constructor(public x: number, public y: number, public z: number) {}
    
    static random(min: number, max: number): number {
        return min + Math.random() * (max - min)
    }
}

class AnimationController {
    private timeline: gsap.core.Timeline
    private time = 0
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private width = 0
    private height = 0
    private background: string
    private foreground: string
    private stars: Star[] = []

    private readonly changeEventTime = 0.32
    public readonly cameraZ = -400
    private readonly cameraTravelDistance = 3400
    private readonly startDotYOffset = 28
    public readonly viewZoom = 100
    private readonly numberOfStars = 5000
    private readonly trailLength = 80
    
    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, background: string, foreground: string, onComplete: () => void) {
        this.canvas = canvas
        this.ctx = ctx
        this.background = background
        this.foreground = foreground
        this.resize()
        // Local seeded randomness keeps the supplied spiral consistent without changing Math.random.
        let seed = 1234
        const random = () => {
            seed = (seed * 9301 + 49297) % 233280
            return seed / 233280
        }
        for (let i = 0; i < this.numberOfStars; i++) {
            this.stars.push(new Star(this.cameraZ, this.cameraTravelDistance, random))
        }
        this.timeline = gsap.timeline({ onComplete })
        this.timeline.to(this, {
            time: 1,
            duration: 7,
            ease: "none",
            onUpdate: () => this.render()
        })
    }

    public resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        this.width = window.innerWidth
        this.height = window.innerHeight
        this.canvas.width = Math.round(this.width * dpr)
        this.canvas.height = Math.round(this.height * dpr)
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        this.render()
    }

    public showStill() {
        this.timeline.pause()
        this.time = 0.3
        this.render()
    }

    public ease(p: number, g: number): number {
        if (p < 0.5) 
            return 0.5 * Math.pow(2 * p, g)
        else
            return 1 - 0.5 * Math.pow(2 * (1 - p), g)
    }

    public easeOutElastic(x: number): number {
        const c4 = (2 * Math.PI) / 4.5
        if (x <= 0) return 0
        if (x >= 1) return 1
        return Math.pow(2, -8 * x) * Math.sin((x * 8 - 0.75) * c4) + 1
    }

    public map(value: number, start1: number, stop1: number, start2: number, stop2: number): number {
        return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1))
    }

    public constrain(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max)
    }

    public lerp(start: number, end: number, t: number): number {
        return start * (1 - t) + end * t
    }

    public spiralPath(p: number): Vector2D {
        p = this.constrain(1.2 * p, 0, 1)
        p = this.ease(p, 1.8)
        const numberOfSpiralTurns = 6
        const theta = 2 * Math.PI * numberOfSpiralTurns * Math.sqrt(p)
        const r = 170 * Math.sqrt(p)
        
        return new Vector2D(
            r * Math.cos(theta),
            r * Math.sin(theta) + this.startDotYOffset
        )
    }

    public rotate(v1: Vector2D, v2: Vector2D, p: number, orientation: boolean): Vector2D {
        const middle = new Vector2D(
            (v1.x + v2.x) / 2,
            (v1.y + v2.y) / 2
        )
        
        const dx = v1.x - middle.x
        const dy = v1.y - middle.y
        const angle = Math.atan2(dy, dx)
        const o = orientation ? -1 : 1
        const r = Math.sqrt(dx * dx + dy * dy)

        const bounce = Math.sin(p * Math.PI) * 0.05 * (1 - p)
        
        return new Vector2D(
            middle.x + r * (1 + bounce) * Math.cos(angle + o * Math.PI * this.easeOutElastic(p)),
            middle.y + r * (1 + bounce) * Math.sin(angle + o * Math.PI * this.easeOutElastic(p))
        )
    }

    public showProjectedDot(position: Vector3D, sizeFactor: number) {
        const t2 = this.constrain(this.map(this.time, this.changeEventTime, 1, 0, 1), 0, 1)
        const newCameraZ = this.cameraZ + this.ease(Math.pow(t2, 1.2), 1.8) * this.cameraTravelDistance
        
        if (position.z > newCameraZ) {
            const dotDepthFromCamera = position.z - newCameraZ

            const x = this.viewZoom * position.x / dotDepthFromCamera
            const y = this.viewZoom * position.y / dotDepthFromCamera
            const sw = 400 * sizeFactor / dotDepthFromCamera
            
            this.ctx.lineWidth = sw
            this.ctx.beginPath()
            this.ctx.arc(x, y, 0.5, 0, Math.PI * 2)
            this.ctx.fill()
        }
    }

    private drawStartDot() {
        if (this.time > this.changeEventTime) {
            const dy = this.cameraZ * this.startDotYOffset / this.viewZoom
            const position = new Vector3D(0, dy, this.cameraTravelDistance)
            this.showProjectedDot(position, 2.5)
        }
    }

    public render() {
        const ctx = this.ctx
        if (!ctx) return
        
        ctx.fillStyle = this.background
        ctx.fillRect(0, 0, this.width, this.height)
        
        ctx.save()
        ctx.translate(this.width / 2, this.height / 2)
        const scale = Math.min(this.width, this.height) / 560
        ctx.scale(scale, scale)

        const t1 = this.constrain(this.map(this.time, 0, this.changeEventTime + 0.25, 0, 1), 0, 1)
        const t2 = this.constrain(this.map(this.time, this.changeEventTime, 1, 0, 1), 0, 1)

        ctx.rotate(-Math.PI * this.ease(t2, 2.7))

        this.drawTrail(t1)

        ctx.fillStyle = this.foreground
        for (const star of this.stars) {
            star.render(t1, this)
        }

        this.drawStartDot()
        
        ctx.restore()
    }

    private drawTrail(t1: number) {
        for (let i = 0; i < this.trailLength; i++) {
            const f = this.map(i, 0, this.trailLength, 1.1, 0.1)
            const sw = (1.3 * (1 - t1) + 3.0 * Math.sin(Math.PI * t1)) * f
            
            this.ctx.fillStyle = this.foreground
            this.ctx.lineWidth = sw
            
            const pathTime = t1 - 0.00015 * i
            const position = this.spiralPath(pathTime)

            const basePos = position
            const offset = new Vector2D(position.x + 5, position.y + 5)
            const rotated = this.rotate(
                basePos, 
                offset, 
                Math.sin(this.time * Math.PI * 2) * 0.5 + 0.5, 
                i % 2 === 0
            )
            
            this.ctx.beginPath()
            this.ctx.arc(rotated.x, rotated.y, sw / 2, 0, Math.PI * 2)
            this.ctx.fill()
        }
    }

    public pause() {
        this.timeline.pause()
    }

    public resume() {
        this.timeline.play()
    }

    public destroy() {
        this.timeline.kill()
    }
}

class Star {
    private dx: number
    private dy: number
    private spiralLocation: number
    private strokeWeightFactor: number
    private z: number
    private angle: number
    private distance: number
    private rotationDirection: number
    private expansionRate: number
    private finalScale: number
    
    constructor(cameraZ: number, cameraTravelDistance: number, random: () => number) {
        this.angle = random() * Math.PI * 2
        this.distance = 30 * random() + 15
        this.rotationDirection = random() > 0.5 ? 1 : -1
        this.expansionRate = 1.2 + random() * 0.8
        this.finalScale = 0.7 + random() * 0.6
        
        this.dx = this.distance * Math.cos(this.angle)
        this.dy = this.distance * Math.sin(this.angle)
        
        this.spiralLocation = (1 - Math.pow(1 - random(), 3.0)) / 1.3
        this.z = (0.5 * cameraZ + random() * (cameraTravelDistance + 0.5 * cameraZ))
        
        const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t
        this.z = lerp(this.z, cameraTravelDistance / 2, 0.3 * this.spiralLocation)
        this.strokeWeightFactor = Math.pow(random(), 2.0)
    }
    
    render(p: number, controller: AnimationController) {
        const spiralPos = controller.spiralPath(this.spiralLocation)
        const q = p - this.spiralLocation
        
        if (q > 0) {
            const displacementProgress = controller.constrain(4 * q, 0, 1)

            const linearEasing = displacementProgress;
            const elasticEasing = controller.easeOutElastic(displacementProgress);
            const powerEasing = Math.pow(displacementProgress, 2);

            let easing;
            if (displacementProgress < 0.3) {

                easing = controller.lerp(linearEasing, powerEasing, displacementProgress / 0.3);
            } else if (displacementProgress < 0.7) {

                const t = (displacementProgress - 0.3) / 0.4;
                easing = controller.lerp(powerEasing, elasticEasing, t);
            } else {

                easing = elasticEasing;
            }

            let screenX, screenY;

            if (displacementProgress < 0.3) {

                screenX = controller.lerp(spiralPos.x, spiralPos.x + this.dx * 0.3, easing / 0.3);
                screenY = controller.lerp(spiralPos.y, spiralPos.y + this.dy * 0.3, easing / 0.3);
            } else if (displacementProgress < 0.7) {

                const midProgress = (displacementProgress - 0.3) / 0.4;
                const curveStrength = Math.sin(midProgress * Math.PI) * this.rotationDirection * 1.5;

                const baseX = spiralPos.x + this.dx * 0.3;
                const baseY = spiralPos.y + this.dy * 0.3;

                const targetX = spiralPos.x + this.dx * 0.7;
                const targetY = spiralPos.y + this.dy * 0.7;

                const perpX = -this.dy * 0.4 * curveStrength;
                const perpY = this.dx * 0.4 * curveStrength;
                
                screenX = controller.lerp(baseX, targetX, midProgress) + perpX * midProgress;
                screenY = controller.lerp(baseY, targetY, midProgress) + perpY * midProgress;
            } else {

                const finalProgress = (displacementProgress - 0.7) / 0.3;

                const baseX = spiralPos.x + this.dx * 0.7;
                const baseY = spiralPos.y + this.dy * 0.7;

                const targetDistance = this.distance * this.expansionRate * 1.5;
                const spiralTurns = 1.2 * this.rotationDirection;
                const spiralAngle = this.angle + spiralTurns * finalProgress * Math.PI;
                
                const targetX = spiralPos.x + targetDistance * Math.cos(spiralAngle);
                const targetY = spiralPos.y + targetDistance * Math.sin(spiralAngle);

                screenX = controller.lerp(baseX, targetX, finalProgress);
                screenY = controller.lerp(baseY, targetY, finalProgress);
            }

            const vx = (this.z - controller.cameraZ) * screenX / controller.viewZoom;
            const vy = (this.z - controller.cameraZ) * screenY / controller.viewZoom;
            
            const position = new Vector3D(vx, vy, this.z);

            let sizeMultiplier = 1.0;
            if (displacementProgress < 0.6) {

                sizeMultiplier = 1.0 + displacementProgress * 0.2;
            } else {

                const t = (displacementProgress - 0.6) / 0.4;
                sizeMultiplier = 1.2 * (1.0 - t) + this.finalScale * t;
            }
            
            const dotSize = 8.5 * this.strokeWeightFactor * sizeMultiplier;
            
            controller.showProjectedDot(position, dotSize);
        }
    }
}

interface SpiralAnimationProps {
    onComplete: () => void
}

export function SpiralAnimation({ onComplete }: SpiralAnimationProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const { theme } = useTheme()

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx) {
            onComplete()
            return
        }
        const isDark = theme === 'dark'
        let finished = false
        const finish = () => {
            if (finished) return
            finished = true
            onComplete()
        }
        const controller = new AnimationController(
            canvas, ctx, isDark ? '#0d0d0d' : '#f7f7f7', isDark ? '#ffffff' : '#202024', finish
        )
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (reducedMotion) {
            controller.showStill()
        }
        // Keep entry bounded even when a browser throttles animation frames.
        const completionTimer = setTimeout(finish, reducedMotion ? 450 : 7400)
        const resize = () => controller.resize()
        window.addEventListener('resize', resize)
        return () => {
            finished = true
            clearTimeout(completionTimer)
            window.removeEventListener('resize', resize)
            controller.destroy()
        }
    }, [onComplete, theme])

    return (
        <main className="fixed inset-0 z-[90] overflow-hidden" aria-label="Entering the site" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
            <p className="sr-only" role="status">Entering the site. Your page will open automatically.</p>
            <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
            <button type="button" onClick={onComplete} className="absolute right-6 bottom-6 cursor-pointer text-[10px] tracking-[0.18em] opacity-50 transition-opacity hover:opacity-100 focus-visible:opacity-100" aria-label="Skip animation and enter site">
                enter ↗
            </button>
        </main>
    )
}
