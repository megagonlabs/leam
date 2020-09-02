/* eslint-disable */
import React, { PropTypes } from "react";
import { VegaLite } from "react-vega";
import BarChart from "./BarChart.js";
import { Handler } from "vega-tooltip";
import { Grid, Box } from "@material-ui/core";
import vegaEmbed from "vega-embed";

// const vgEmbedOptions = { actions: false, renderer: 'svg', tooltip: true };
const vgEmbedOptions = {};

export default class DatavisView extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.refList = this.props.visSpecList.map(() => React.createRef());
    this.state = {
      refListUpdated: false,
      width: 320,
      height: 200,
      x: 0,
      y: 0,
    };
    console.log(
      `[datavis view] vis spec list constructor: ${props.visSpecList}`
    );
  }

  componentDidMount() {
    console.log(`here is the current props spec: `);
    console.log(this.props.visSpecList);

    console.log(`here is the vis refs list: `);
    console.log(this.refList);

    for (let key in this.refList) {
      let ref = this.refList[key];
      const barchartIdx = this.props.reverseIdx["barchart"];
      const barchartCoordFunc = this.props.highlightRows;
      vegaEmbed(ref.current, this.props.visSpecList[key], vgEmbedOptions)
        .then(({ _, view }) => {
          console.log(`view should be here!`);
          console.log(view);
        })
        .catch((err) => {
          console.log("error:");
          console.log(err);
        });
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.visSpecList.length != this.props.visSpecList.length) {
      this.refList = this.props.visSpecList.map(() => React.createRef());
      console.log(
        `[componentDidUpdate] new ref list: ${JSON.stringify(this.refList)}`
      );
      this.setState({ refListUpdated: true });
    } else if (
      prevState.refListUpdated === false &&
      this.state.refListUpdated === true
    ) {
      this.setState({ refListUpdated: false });
    } else if (
      prevProps.reverseIdx["barchart"] == undefined &&
      this.props.reverseIdx["barchart"] != undefined
    ) {
      // pass
    } else {
      return;
    }

    console.log(`here is the current props spec: `);
    console.log(this.props.visSpecList);

    console.log(`here is the vis refs list: `);
    console.log(this.refList);

    for (let key in this.refList) {
      let ref = this.refList[key];
      const barchartIdx = this.props.reverseIdx["barchart"];
      const barchartCoordFunc = this.props.highlightRows;
      const setVisView = this.props.setVisView;
      vegaEmbed(ref.current, this.props.visSpecList[key], vgEmbedOptions)
        .then(({ _, view }) => {
          console.log(`view should be here!`);
          console.log(view);
          // add to global views object
          setVisView(key, view);
        })
        .catch((err) => {
          console.log("error:");
          console.log(err);
        });
    }
  }

  render() {
    console.log(`[render] reflist is: ${this.reflist}`);
    return (
      <Grid container>
        {this.refList.map((r, index) => {
          return (
            // <Grid item xs={4} key={index} border={1}>
            <Box border={1} p={1}>
              <div
                className={"vgl-vis-" + index}
                id={"vgl-vis-" + index}
                ref={r}
              ></div>
            </Box>
            // </Grid>
          );
        })}
        {/* <div className="vgl-vis" id="vgl-vis" ref={e => this.visRef = e}></div> */}
      </Grid>
    );
  }
}
