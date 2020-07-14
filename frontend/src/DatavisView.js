import React, { PropTypes } from 'react';
import { VegaLite } from 'react-vega';
import BarChart from "./BarChart.js";

export default class DatavisView extends React.Component {
    constructor(props, context) {
      super(props, context);
      this.distributionSpec = {
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

      this.scatterplotSpec = {
          width: props.width || 100,
          height: props.height || 100,
          mark: "circle",
          encoding: {
              y: { field: "pca_1", type: "quantitative"},
              x: { field: "pca_0", type: "quantitative"},
          },
          data: { name: 'scatterplot' },
      };
    }
  
    render() {
      const col = this.props.selectedColumn;
      const visType = (col == null) ? null : this.props.visTypes[col];
      if (visType == "distribution") {
        return (
            <VegaLite spec={this.distributionSpec} data={this.props.visualData[this.props.selectedColumn]} />
        );  
      } else if (visType == "scatterplot") { 
        const firstRow = this.props.visualData[col][visType][0];
        for (let key in firstRow) {
            console.log(`[datavis render] vis field -> ${key} and value ${firstRow[key]}`);
            if (key === "review-tfidf-kmeans") {
                this.scatterplotSpec.encoding.color = {
                    field: "review-tfidf-kmeans", 
                    type: "nominal",
                };
            } else if (key == "review-sentiment") {
                this.scatterplotSpec.encoding.color = {
                    field: "review-sentiment",
                    type: "quantitative",
                    scale: {
                        range: ["crimson", "royalblue"],
                    }
                };
            }
        }
        return (
            <VegaLite spec={this.scatterplotSpec} data={this.props.visualData[col]} />
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