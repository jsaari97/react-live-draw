import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Watcher extends Component {
  static propTypes = {
    color: PropTypes.string,
    size: PropTypes.number,
    refreshRate: PropTypes.number,
    ratio: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    onStart: PropTypes.func,
    onEnd: PropTypes.func,
    onDraw: PropTypes.func,
  }

  static defaultProps = {
    color: '#333',
    size: 10,
    refreshRate: 2,
    ratio: null,
    className: '',
    style: {},
    onStart: null,
    onEnd: null,
    onDraw: null,
  }

  constructor(props) {
    super(props)

    this.container = React.createRef()
    this.element = React.createRef()
    this.tempElement = React.createRef()
  }

  get width() {
    return this.element.current.width * this.pixelRatio
  }

  get height() {
    return this.element.current.height * this.pixelRatio
  }

  count = 0
  points = []
  pixelRatio = window.devicePixelRatio || 1

  componentDidMount() {
    this.context = this.element.current.getContext('2d')
    this.tempContext = this.tempElement.current.getContext('2d')

    this.context.imageSmoothingEnabled = false
    this.tempContext.imageSmoothingEnabled = false

    this.onResize()
    window.addEventListener('resize', this.resize)
    window.addEventListener(this.props.id, this.eventDraw)
    window.addEventListener(`${this.props.id}_end`, this.applyStroke)
  }

  shouldComponentUpdate() {
    return false
  }

  componentWillUnmount() {
    window.removeEventListener(this.resize)
  }

  eventDraw = ({ detail }) => {
    this.points.push(detail.point)
    this.draw()
  }

  debounce = (func, wait) => {
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

  onResize = () => {
    const { clientWidth, clientHeight } = this.container.current

    const [w, h] = this.props.ratio.match(/\d+/g)

    const ratio = Number(h) / Number(w)

    let height = Math.min(clientWidth * ratio, clientHeight)
    let width = height === clientHeight ? height * (Number(w) / Number(h)) : clientWidth

    width *= this.pixelRatio
    height *= this.pixelRatio

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

  resize = this.debounce(this.onResize, 250)

  strokeSettings = () => {
    this.tempContext.lineJoin = 'round'
    this.tempContext.lineCap = 'round'
    this.tempContext.strokeStyle = this.props.color
    this.tempContext.fillStyle = this.props.color
    this.tempContext.lineWidth = this.props.size
  }

  draw = () => {
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

  applyStroke = () => {
    this.points = []
    this.count = 0
    this.context.drawImage(this.tempElement.current, 0, 0)
    this.tempContext.clearRect(0, 0, this.tempElement.current.width, this.tempElement.current.height)
  }

  clear = () => {
    this.context.clearRect(0, 0, this.tempElement.current.width, this.tempElement.current.height)
    this.count = 0
    this.points = []
  }

  render() {
    const { className, style } = this.props

    return (
      <div
        ref={this.container}
        className={className}
        style={{
          ...style,
          position: 'relative',
        }}
      >
        <canvas
          style={{ border: '1px solid #000' }}
          ref={this.element}
        />
        <canvas
          ref={this.tempElement}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
          }}
        />
      </div>
    )
  }
}

export default Watcher
