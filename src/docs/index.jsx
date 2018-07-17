import React from "react";
import { render } from "react-dom";
import { ReactDrawer } from "../../lib";
import Watcher from "../lib/Watcher";

class Demo extends React.Component {
  render() {
    return (
      <div>
        <ReactDrawer
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
