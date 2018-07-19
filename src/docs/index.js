import React from "react";
import { render } from "react-dom";
import { Drawer, Watcher } from '../lib'

class Demo extends React.Component {
  render() {
    return (
      <div>
        <Drawer
          id="canvas"
          ratio="4:3"
          style={{height: '40vh'}}
        />
        <Watcher
          id="canvas"
          ratio="4:3"
          style={{height: '40vh'}}
        />
      </div>
    )
  }
}

render(<Demo />, document.getElementById("app"));
