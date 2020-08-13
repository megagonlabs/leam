import React, { PropTypes } from "react";
import { VegaLite } from "react-vega";
import BarChart from "./BarChart.js";
import { Handler } from "vega-tooltip";
import { Grid } from "@material-ui/core";
import vegaEmbed from "vega-embed";
import { TransferWithinAStationSharp } from "@material-ui/icons";

// const vgEmbedOptions = { actions: false, renderer: 'svg', tooltip: true };
const vgEmbedOptions = {};

export default class DatavisView extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.refList = this.props.visSpecList.map(() => React.createRef());
    this.state = {
      refListUpdated: false,
      vegaView: null,
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
          if (key == 0) {
            view.addEventListener("mouseover", function (event, item) {
              if (item != undefined && item.datum != undefined) {
                console.log(item.datum);
                const rows = barchartIdx[item.datum.topword];
                barchartCoordFunc(rows, false);
              }
            });
          }
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
    } else if (prevProps.selectedIdx != this.props.selectedIdx) {
      console.log("doing external select on vega view");
      if (this.props.selectedIdx == -1) {
        this.state.vegaView.signal("select_tuple", null).runAsync();
      } else {
        this.state.vegaView
          .signal("select_tuple", {
            unit: "",
            fields: [{ type: "E", field: "_vgsid_" }],
            values: [this.props.selectedIdx],
          })
          .runAsync();
      }
      let _ = this.state.vegaView.getState().signals;
      return;
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
      const selectVisIdxFunc = this.props.selectVisIdxFunc;
      vegaEmbed(ref.current, this.props.visSpecList[key], vgEmbedOptions)
        .then(({ _, view }) => {
          console.log(`view should be here!`);
          console.log(view);
          this.setState({ vegaView: view });
          if (key == 0) {
            view.addEventListener("click", function (event, item) {
              if (item != undefined && item.datum != undefined) {
                console.log(item.datum);
                const rows = barchartIdx[item.datum.topword];
                barchartCoordFunc(rows, false);
                selectVisIdxFunc(item.datum._vgsid_);
              }
            });
          }
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
            <Grid item xs={4} key={index}>
              <div
                className={"vgl-vis-" + index}
                id={"vgl-vis-" + index}
                ref={r}
              ></div>
            </Grid>
          );
        })}
        {/* <div className="vgl-vis" id="vgl-vis" ref={e => this.visRef = e}></div> */}
      </Grid>
    );
  }
}
