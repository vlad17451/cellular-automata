import React, {useEffect, useRef} from 'react';

interface Vec3 { x: number, y: number, z: number }
interface Vec2 { x: number, y: number }

const vec2 = (x: number, y: number): Vec2 => ({ x, y })
const vec3 = (x: number, y: number, z: number): Vec3 => ({ x, y, z })
const length = (v: Vec3): number => Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);

const sumVe3 = (a: Vec3, b: Vec3): Vec3 => vec3(a.x + b.x, a.y + b.y, a.z + b.z)
const mulVe3 = (a: Vec3, b: Vec3): Vec3 => vec3(a.x * b.x, a.y * b.y, a.z * b.z)

const norm = (v: Vec3): Vec3 => {
  const _length = length(v)
  return {
    x: v.x / _length,
    y: v.y / _length,
    z: v.z / _length,
  }
}

const dot = (a: Vec3, b: Vec3): number => a.x * b.x + a.y * b.y + a.z * b.z


const sphere = (ro: Vec3, rd: Vec3, r: number) => {
  const b = dot(ro, rd);
  const c = dot(ro, ro) - r * r;
  let h = b * b - c;
  if (h < 0.0) return vec2(-1.0, -1.0);
  h = Math.sqrt(h);
  return vec2(-b - h, -b + h);
}

const getColor = (value: number) => {
  const result = value.toString(16).split('.')[0]

  if (result.includes('-')) {
    return '00'
  }
  if (result.length === 1) {
    return `0${result}`
  }
  if (result.length > 2) {
    return 'FF'
  }
  return result
}

function App() {

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const W = 100
  const H = 100

  const size = 6;

  const draw = (ctx: CanvasRenderingContext2D, frameIndex: number) => {
    const light = norm(vec3(Math.sin(frameIndex * 0.05), Math.cos(frameIndex * 0.05), -1))

    for (let i = 0; i <= W; i += 1) {
      for (let j = 0; j <= H; j += 1) {
        let x = i / W - 0.5 // 0.5 - it is half of screen,
        let y = j / H - 0.5 // we divide i and j to get value from 0 to 1

        const uv: Vec2 = vec2(x, y)

        const ro: Vec3 = vec3(-5, 0, 0)
        const rd: Vec3 = norm(vec3(1, uv.x, uv.y))

        let color = 0

        const intersection: Vec2 = sphere(ro, rd, 1)
        if (intersection.x > 0) {
          const itPoint = sumVe3(ro, mulVe3(rd, vec3(intersection.x, intersection.x, intersection.x)))
          const n = norm(itPoint)
          const diff = dot(n, light)
          color = Math.floor(diff * 15) / 15 * 256
        }

        ctx.fillStyle = `#${getColor(color)}${getColor(color)}${getColor(color)}`
        ctx.fillRect(i * size,j * size, size, size);
      }
    }
  }

  useEffect(() => {

    const canvas = canvasRef.current
    const context = canvas!.getContext('2d')
    if (!context) return

    let frameIndex = 0

    let id = setInterval(() => {
      draw(context, frameIndex)

      if (frameIndex === 10000) {
        frameIndex = 0
      } else {
        frameIndex += 1
      }
    }, 10)

    return () => clearInterval(id);
  }, [draw])


  return (
    <div>
      <canvas ref={canvasRef} width={1280} height={720} />
    </div>
  );
}

export default App;
