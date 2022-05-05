import React, {useEffect, useRef} from 'react';

// gets value from 0 to 256
const getHex = (value: number) => {
  if (value < 0) {
    return '00'
  }
  const result = Math.floor(value).toString(16)
  if (result.length === 1) {
    return `0${result}`
  }
  if (result.length > 2) {
    return 'FF'
  }
  return result
}

const getMonoColor = (value: number) => {
  return `#${getHex(value)}${getHex(value)}${getHex(value)}`
}


interface Cell {
  x: number,
  y: number,
  state?: boolean
  id?: string
}

const W_CANVAS = 1000
const H_CANVAS = 500

const PIXEL_SIZE = 8;


const W = W_CANVAS / PIXEL_SIZE
const H = H_CANVAS / PIXEL_SIZE


// const seed: Cell[] = [
//   { x: 18, y: 11 },
//   { x: 18, y: 12 },
//   { x: 18, y: 13 },
//   { x: 17, y: 13 },
//   { x: 17, y: 14 },
//
//   { x: 15, y: 15 },
//   { x: 15, y: 16 },
//   { x: 15, y: 17 },
//
//   { x: 10, y: 10 },
//   { x: 11, y: 10 },
//   { x: 12, y: 10 },
//   { x: 12, y: 11 },
//   { x: 11, y: 12 },
//
//
//   { x: 19, y: 17 },
//   { x: 19, y: 18 },
//   { x: 19, y: 19 },
//   { x: 19, y: 19 },
//
//
//   { x: 12, y: 19 },
//   { x: 12, y: 20 },
//   { x: 12, y: 21 },
//   { x: 11, y: 21 },
//   { x: 12, y: 22 },
//
//   { x: 14, y: 19 },
//   { x: 14, y: 20 },
//   { x: 14, y: 21 },
//   { x: 14, y: 22 },
// ]

const seed2: Cell[] = [

  { x: 1, y: 1 },
  { x: 1, y: 2 },
  { x: 1, y: 3 },
  { x: 1, y: 4 },
  { x: 1, y: 5 },
  { x: 1, y: 6 },
  { x: 18, y: 11 },
  { x: 18, y: 12 },
  { x: 18, y: 13 },
  { x: 17, y: 13 },
  { x: 17, y: 14 },

  { x: 15, y: 15 },
  { x: 15, y: 16 },
  { x: 15, y: 17 },

  { x: 10, y: 10 },
  { x: 11, y: 10 },
  { x: 12, y: 10 },
  { x: 12, y: 11 },
  { x: 11, y: 12 },


  { x: 19, y: 17 },
  { x: 19, y: 18 },
  { x: 19, y: 19 },
  { x: 19, y: 19 },


  { x: 12, y: 19 },
  { x: 12, y: 20 },
  { x: 12, y: 21 },
  { x: 11, y: 21 },
  { x: 12, y: 22 },

  { x: 14, y: 19 },
  { x: 14, y: 20 },
  { x: 14, y: 21 },
  { x: 14, y: 22 },
  { x: 15, y: 23 },
  { x: 15, y: 24 },
  { x: 15, y: 25 },
  { x: 15, y: 26 },
  { x: 15, y: 27 },

  { x: 16, y: 22 },
  { x: 16, y: 23 },
  { x: 16, y: 25 },
  { x: 16, y: 28 },
  { x: 17, y: 22 },
  { x: 17, y: 23 },
  { x: 17, y: 24 },
  { x: 17, y: 26 },
  { x: 17, y: 29 },
  { x: 18, y: 29 },
  { x: 12, y: 31 },
  { x: 13, y: 31 },
  { x: 14, y: 31 },
  { x: 15, y: 31 },
]

let currentCells: Cell[] = [ ...seed2 ]

const getNeighbors = ({ x, y }: Cell): Cell[] => {
  return [
    {x: x - 1, y: y - 1 },
    {x: x, y: y - 1 },
    {x: x + 1, y: y - 1 },
    {x: x - 1, y: y },
    {x: x + 1, y: y },
    {x: x - 1, y: y + 1 },
    {x: x, y: y + 1 },
    {x: x + 1, y: y + 1 },
  ].filter((cell) => {
    return cell.x >= 0
      && cell.x < W
      && cell.y >= 0
      && cell.y < H
  })
}

const getCellsMap = (cells: Cell[]): { [k: string]: boolean } => {
  const map: { [k: string]: boolean } = {}
  for (let i = 0; i < cells.length; i++) {
    const {x, y} = cells[i]
    map[`${x}_${y}`] = true
  }
  return map;
}

const parseCoordinate = (coordinate: string): Cell => {
  const [x,y] = coordinate.split('_')
  if (!x || !y) throw Error('parseCoordinates')
  return {
    x: Number(x),
    y: Number(y)
  }
}
const parseCoordinates = (coordinates: string[]): Cell[] => {
  return coordinates.map(parseCoordinate)
}

const fillEmptySpace = (ctx: CanvasRenderingContext2D) => {
  for (let i = 0; i <= W; i += 1) {
    for (let j = 0; j <= H; j += 1) {
      ctx.fillStyle = getMonoColor(0)
      ctx.fillRect(i * PIXEL_SIZE,j * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    }
  }
}

const drawCells = (ctx: CanvasRenderingContext2D, cells: Cell[]) => {
  for (let i = 0; i < currentCells.length; i++) {
    const { x, y } = currentCells[i]
    ctx.fillStyle = getMonoColor(256)
    ctx.fillRect(x * PIXEL_SIZE,y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
  }
}

const removeDublicateCells = (cells: Cell[]): Cell[] => {
  return parseCoordinates(
    Object.keys(
      getCellsMap(cells)
    )
  )
}

const iteration = (ctx: CanvasRenderingContext2D, frameIndex: number) => {

  let survivedCells: Cell[] = []
  let potentialCells: Cell[] = [] // need to remove cell that died in this iteration
  let newCells: Cell[] = []
  let deadCells: Cell[] = []

  const currentCellsMap = getCellsMap(currentCells)

  for (let i = 0; i < currentCells.length; i++) {
    const cell = currentCells[i]
    const neighbors = getNeighbors(cell)

    let neighborCount = 0

    for (let j = 0; j < neighbors.length; j++) {
      const { x, y } = neighbors[j]
      if (currentCellsMap[`${x}_${y}`]) {
        neighborCount++
      }
    }

    if (neighborCount === 3 || neighborCount === 2) {
      survivedCells.push(cell)
    } else {
      deadCells.push(cell)
    }

    potentialCells = [
      ...potentialCells,
      ...neighbors
    ]
  }

  const potentialCellsFiltered = parseCoordinates(
    Object.keys(getCellsMap(potentialCells))
      .filter(coordinate => !Object.keys(survivedCells).includes(coordinate))
  )

  for (let i = 0; i < potentialCellsFiltered.length; i++) {
    const newCell = potentialCellsFiltered[i]
    const neighbors = getNeighbors(newCell)
    let neighborCount = 0
    for (let j = 0; j < neighbors.length; j++) {
      const { x, y } = neighbors[j]
      if (currentCellsMap[`${x}_${y}`]) {
        neighborCount++
      }
    }
    if (neighborCount === 3) {
      newCells.push(newCell)
    }
  }

  currentCells = removeDublicateCells([
    ...survivedCells,
    ...newCells
  ])

  for (let i = 0; i < deadCells.length; i++) {
    const { x, y } = deadCells[i]
    ctx.fillStyle = getMonoColor(0)
    ctx.fillRect(x * PIXEL_SIZE,y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
  }
  for (let i = 0; i < currentCells.length; i++) {
    const { x, y } = currentCells[i]
    ctx.fillStyle = getMonoColor(256)
    ctx.fillRect(x * PIXEL_SIZE,y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
  }
}

const pause = () => {
  isRunning = !isRunning
}

const reset = () => {
  currentCells = [ ...seed2 ]
}

let frameIndex = 0
let isRunning = true

function App() {

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {

    const canvas = canvasRef.current
    const ctx = canvas!.getContext('2d')
    if (!ctx) return

    fillEmptySpace(ctx)
    drawCells(ctx, currentCells)

    for (let i = 0; i < currentCells.length; i++) {
      const { x, y } = currentCells[i]
      ctx.fillStyle = getMonoColor(256)
      ctx.fillRect(x * PIXEL_SIZE,y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    }


    let id = setInterval(() => {

      if (!isRunning) return

      iteration(ctx, frameIndex)

      if (frameIndex === 10000) {
        frameIndex = 0
      } else {
        frameIndex += 1
      }

    }, 100)

    return () => clearInterval(id);
  }, [])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: "center", width: '100%' }}>
      <div>
        <canvas ref={canvasRef} width={W_CANVAS} height={H_CANVAS} />
      </div>
      <button onClick={pause}>
        Pause
      </button>
      <button onClick={reset}>
        Reset
      </button>
    </div>
  );
}

export default App;
