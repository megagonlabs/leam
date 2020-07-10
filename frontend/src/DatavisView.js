import React, { PropTypes } from 'react';
import { VegaLite } from 'react-vega';
import BarChart from "./BarChart.js";

export default class DatavisView extends React.Component {
    constructor(props, context) {
      super(props, context);
      this.spec = {
        width: props.width || 100,
        height: props.height || 100,
        layer: [{
            selection: {
                "Number": {
                    type: "single",
                    fields: ["TopWords"],
                    init: {"TopWords": 10},
                    bind: {
                        "TopWords": {input: "range", min: 1, max: 50, step: 1},
                    }
                }
            },
        transform: [
            {
                filter: "datum.order <= Number.TopWords"
            }
        ],
        mark: 'bar',
        encoding: {
          y: { field: 'topword', type: 'ordinal', sort: '-x' },
          x: { field: 'score', type: 'quantitative' },
        },
        data: { name: 'distribution' },
        }]
      };
    }
  
    render() {
      const col = this.props.selectedColumn;
      const visType = (col == null) ? null : this.props.visTypes[col];
      if (visType == "distribution") {
        return (
            <VegaLite spec={this.spec} data={this.props.visualData[this.props.selectedColumn]} />
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