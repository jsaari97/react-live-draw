import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { draw } from './utils'

class Drawer extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
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

    this.draw = draw.bind(this)
  }

  get width() {
    return this.element.current.width * this.pixelRatio
  }

  get height() {
    return this.element.current.height * this.pixelRatio
  }

  drawing = false
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
  }

  shouldComponentUpdate() {
    return false
  }

  componentWillUnmount() {
    window.removeEventListener(this.resize)
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

  resize = this.debounce(this.onResize, 100)

  strokeSettings = () => {
    this.tempContext.lineJoin = 'round'
    this.tempContext.lineCap = 'round'
    this.tempContext.strokeStyle = this.props.color
    this.tempContext.fillStyle = this.props.color
    this.tempContext.lineWidth = this.props.size
  }

  applyStroke = () => {
    this.points = []
    this.count = 0
    this.context.drawImage(this.tempElement.current, 0, 0)
    this.tempContext.clearRect(0, 0, this.tempElement.current.width, this.tempElement.current.height)
  }

  addPoint = (e) => {
    const pageX = e.pageX || e.changedTouches[0].pageX
    const pageY = e.pageY || e.changedTouches[0].pageY
    const x = (pageX * this.pixelRatio) - this.container.current.offsetLeft
    const y = (pageY * this.pixelRatio) - this.container.current.offsetTop

    const point = { x, y }

    this.count++

    if (this.count % this.props.refreshRate === 0) {
      this.points.push(point)
      this.draw()
      this.element.current.dispatchEvent(new CustomEvent(this.props.id, { bubbles: true, detail: { point } }))

      if (this.props.onDraw) {
        this.props.onDraw(point)
      }
    } else if (this.count < 3) {
      this.points.push(point)
      this.draw()
      this.element.current.dispatchEvent(new CustomEvent(this.props.id, { bubbles: true, detail: { point } }))
      if (this.props.onDraw) {
        this.props.onDraw(point)
      }
    }
  }

  onMouseDown = (e) => {
    this.drawing = true
    this.tempElement.current.addEventListener('mousemove', this.addPoint, false)

    if (this.props.onStart) {
      this.props.onStart()
    }

    this.addPoint(e)
  }

  onMouseUp = () => {
    if (this.drawing) {
      this.tempElement.current.removeEventListener('mousemove', this.addPoint, false)
      this.applyStroke()

      if (this.props.onEnd) {
        this.props.onEnd()
      }

      this.element.current.dispatchEvent(new Event(`${this.props.id}_end`, { bubbles: true }))

      this.drawing = false
    }
  }

  onTouchStart = (e) => {
    console.log(e.changedTouches)
    console.log(e)
    this.drawing = true
    this.tempElement.current.addEventListener('touchmove', this.addPoint, false)

    if (this.props.onStart) {
      this.props.onStart()
    }

    this.addPoint(e)
  }

  onTouchEnd = () => {
    if (this.drawing) {
      this.tempElement.current.removeEventListener('touchmove', this.addPoint, false)
      this.applyStroke()

      if (this.props.onEnd) {
        this.props.onEnd()
      }

      this.element.current.dispatchEvent(new Event(`${this.props.id}_end`, { bubbles: true }))

      this.drawing = false
    }
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
          onTouchStart={this.onTouchStart}
          onTouchEnd={this.onTouchEnd}
          onMouseDown={this.onMouseDown}
          onMouseUp={this.onMouseUp}
          onMouseLeave={this.onMouseUp}
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

export default Drawer
