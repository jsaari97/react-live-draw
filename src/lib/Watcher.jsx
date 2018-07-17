import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { draw, debounce, resize, applyStroke } from './utils'

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
    window.addEventListener(this.props.id, this.eventHandler)
  }

  shouldComponentUpdate() {
    return false
  }

  componentWillUnmount() {
    window.removeEventListener(this.debounceResize)
  }

  debounceResize = this.debounce(this.resize, 250)

  eventHandler = ({ detail }) => {
    if (detail && detail.point) {
      this.points.push(detail.point)
      this.draw()
    } else {
      this.applyStroke()
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
