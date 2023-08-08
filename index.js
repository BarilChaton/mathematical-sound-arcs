const paper = document.querySelector('#paper')
const pen = paper.getContext("2d")

const calculateNextImpactTime = (currentImpactTime, velocity) => {
  return currentImpactTime + (Math.PI / velocity) * 1000
}

let soundEnabled = true

// Uncomment line below to not destroy your ears ¯\_(ツ)_/¯
// document.onvisibilitychange = () => soundEnabled = false

// Initial constants
const oneFullLoop = 2 * Math.PI
const duration = 900
const maxLoops = 50

// For tracking passed time
let startTime = new Date().getTime()

// Arcs array with colors and mapping each element to an audio
const arcs = [
  "#F4446F", "#D44B6B", "#B35368", "#8C5B64", "#675E60", // Shades of Pink
  "#4D6561", "#34705E", "#20765A", "#147B57", "#0A7F54", // Shades of Green
  "#008352", "#008051", "#007D4F", "#00784E", "#00744D", // Shades of Teal
  "#006F4C", "#006B4C", "#00674B", "#00624A", "#005E49"  // Shades of Blue-Green
].map((color, index) => {
  const audio = new Audio(`assets/key${index}.mp3`)
  audio.volume = 1

  const numberOfLoops = oneFullLoop * (maxLoops - index)
  const velocity = numberOfLoops / duration

  return {
    color,
    audio,
    nextImpactTime: calculateNextImpactTime(startTime, velocity),
    velocity
  }
})

const draw = () => {
  const currentTime = new Date().getTime()
  const elapsedTime = (currentTime - startTime) / 1000
  
  paper.width = paper.clientWidth
  paper.height = paper.clientHeight
  
  const start = {
    x: paper.width * 0.1,
    y: paper.height * 0.9
  }
  
  const end = {
    x: paper.width * 0.9,
    y: paper.height * 0.9
  }
  
  pen.strokeStyle = "white"
  pen.lineWidth = 2
  pen.moveTo(start.x, start.y)
  pen.lineTo(end.x, end.y)
  pen.stroke()
  
  const center = {
    x: paper.width * 0.5,
    y: paper.height * 0.9
  }
  
  const length = end.x - start.x
  
  // Draw Arcs
  const initialArcRadius = length * 0.05
  const spacing = (length / 2 - initialArcRadius) / arcs.length
  
  arcs.forEach((arc, index) => {
    const arcRadius = initialArcRadius + (index * spacing)

    // Draw an arc
    pen.beginPath()
    pen.strokeStyle = arc.color
    pen.arc(center.x, center.y, arcRadius, Math.PI, 2 * Math.PI)
    pen.stroke()

    // velocity and angle
    const distance = Math.PI + (elapsedTime * arc.velocity)
    const maxAngle = 2 * Math.PI
    const modDistance = distance % maxAngle
    const adjustedDistance = modDistance >= Math.PI ? modDistance : maxAngle - modDistance

    // Draw Circle
    const circlePos = {
      x: center.x + arcRadius * Math.cos(adjustedDistance),
      y: center.y + arcRadius * Math.sin(adjustedDistance)
    }

    pen.fillStyle = arc.color
    pen.beginPath()
    pen.arc(circlePos.x, circlePos.y, length * 0.0065, 0, 2 * Math.PI)
    pen.fill()
    
    // Play sound change circle color on impact
    if (currentTime >= arc.nextImpactTime) {
      if (soundEnabled) {
        arc.audio.play()

        pen.fillStyle = "white"
        pen.fill()
  
        if (pen.fillStyle === "white") {
          setTimeout(() => {
            pen.fillStyle = arc.color
            pen.fill()
          }, 350)
        }
      }

      arc.nextImpactTime = calculateNextImpactTime(arc.nextImpactTime, arc.velocity)
    }
  })

  requestAnimationFrame(draw)
}

draw()