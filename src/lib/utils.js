export const draw = () => {
  const { tempContext, points, strokeSettings } = this

  strokeSettings()

  if (points.length < 3) {
    tempContext.beginPath()
    tempContext.arc(points[0].x, points[0].y, tempContext.lineWidth / 2, 0, Math.PI * 2, !0)
    tempContext.fill()
    tempContext.closePath()

    return
  }

  tempContext.clearRect(0, 0, this.width, this.height)

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
