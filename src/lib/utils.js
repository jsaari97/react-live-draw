export const draw = function() {
  const { tempContext, points, width, height } = this
  
  this.tempContext.lineJoin = 'round'
  this.tempContext.lineCap = 'round'
  this.tempContext.strokeStyle = this.props.color
  this.tempContext.fillStyle = this.props.color
  this.tempContext.lineWidth = this.props.size

  if (points.length < 3) {
    tempContext.beginPath()
    tempContext.arc(points[0].x, points[0].y, tempContext.lineWidth / 2, 0, Math.PI * 2, !0)
    tempContext.fill()
    tempContext.closePath()

    return
  }

  tempContext.clearRect(0, 0, width, height)

  tempContext.beginPath()
  tempContext.moveTo(points[0].x, points[0].y)

  for (var i = 1; i < points.length - 2; i++) {
    tempContext.quadraticCurveTo(
      points[i].x,
      points[i].y,
      (points[i].x + points[i + 1].x) / 2,
      (points[i].y + points[i + 1].y) / 2,
    )
  }

  // For the last 2 points
  tempContext.quadraticCurveTo(
    points[i].x,
    points[i].y,
    points[i + 1].x,
    points[i + 1].y
  )

  tempContext.stroke()
}

export const debounce = (func, wait) => {
  let timeout
  return () => {
    const later = () => {
      timeout = null
      func.apply()
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const resize = function() {
  const { clientWidth, clientHeight } = this.container.current

  const [w, h] = this.props.ratio.match(/\d+/g)

  const ratio = Number(h) / Number(w)

  let height = Math.min(clientWidth * ratio, clientHeight)
  let width = height === clientHeight ? height * (Number(w) / Number(h)) : clientWidth

  width *= this.pixelRatio
  height *= this.pixelRatio

  this.context.imageSmoothingEnabled = false
  this.tempContext.imageSmoothingEnabled = false

  this.tempElement.current.height = height
  this.tempElement.current.width = width

  this.tempContext.drawImage(this.context.canvas, 0, 0, width, height)

  this.element.current.height = height
  this.element.current.width = width

  const _w = `${width / this.pixelRatio}px`
  const _h = `${height / this.pixelRatio}px`

  this.tempElement.current.style.width = _w
  this.tempElement.current.style.height = _h

  this.element.current.style.width = _w
  this.element.current.style.height = _h

  this.context.drawImage(this.tempContext.canvas, 0, 0)
  this.tempContext.clearRect(0, 0, this.tempElement.current.width, this.tempElement.current.height)
}

export const clear = function() {
  this.context.clearRect(0, 0, this.tempElement.current.width, this.tempElement.current.height)
  this.count = 0
  this.points = []
}

export const applyStroke = function() {
  this.points = []
  this.count = 0
  this.context.drawImage(this.tempElement.current, 0, 0)
  this.tempContext.clearRect(0, 0, this.tempElement.current.width, this.tempElement.current.height)
}