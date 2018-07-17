import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { draw, debounce, resize, applyStroke } from './utils'

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
    this.debounce = debounce.bind(this)
    this.resize = resize.bind(this)
    this.applyStroke = applyStroke.bind(this)
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

    this.resize()
    window.addEventListener('resize', this.debounceResize)
  }

  shouldComponentUpdate() {
    return false
  }

  componentWillUnmount() {
    window.removeEventListener(this.debounceResize)
  }

  debounceResize = this.debounce(this.resize, 250)

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

      this.element.current.dispatchEvent(new Event(this.props.id, { bubbles: true }))

      this.drawing = false
    }
  }

  onTouchStart = (e) => {
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

      this.element.current.dispatchEvent(new Event(this.props.id, { bubbles: true }))

      this.drawing = false
    }
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
