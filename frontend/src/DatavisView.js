import React, { PropTypes } from 'react';
import { VegaLite } from 'react-vega';
import BarChart from "./BarChart.js";

export default class DatavisView extends React.Component {
    constructor(props, context) {
      super(props, context);
      this.state = {
          width: props.width,
          height: props.height,
      }
    }
  
    render() {
      const col = this.props.selectedColumn;
      const visType = (col == null) ? null : this.props.visTypes[col];
      if (visType == "distribution") {
        return (
            <BarChart data={this.props.visualData[this.props.selectedColumn]} height={this.state.height} width={this.state.width} mode='fit' />
        );  
      } else {
        let defaults = {
            height: 300,
            width: 300,
          };
          return (
            <div style={{...defaults}}></div>
          );
      }
    }
  }