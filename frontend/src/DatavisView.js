import React, { PropTypes } from 'react';
import { VegaLite } from 'react-vega';
import BarChart from "./BarChart.js";
import { Handler } from 'vega-tooltip';

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
        }],
      }
      

      this.scatterplotSentimentSpec = {
          width: props.width || 100,
          height: props.height || 100,
          mark: "circle",
          encoding: {
              y: { field: "pca_1", type: "quantitative"},
              x: { field: "pca_0", type: "quantitative"},
              color: {
                field: "review-sentiment",
                type: "quantitative",
                scale: {
                    range: ["crimson", "royalblue"],
                }
            }
          },
      };

      this.scatterplotClusterSpec = {
        width: props.width || 100,
        height: props.height || 100,
        mark: "circle",
        encoding: {
            y: { field: "pca_1", type: "quantitative"},
            x: { field: "pca_0", type: "quantitative"},
            color: {
                field: "review-tfidf-kmeans", 
                type: "nominal",
            }
        },
     };

     this.spec = {
        hconcat: [
        ],
        data: { name: "all" },
      };
    }
  
    render() {
    //   const col = this.props.selectedColumn;
    //   const visType = (col == null) ? null : this.props.visTypes[col];
    //   let newSpec = Object.assign({}, this.spec);
    //   if (visType == "distribution") {
    //     newSpec.hconcat.push(this.distributionSpec);
    //   } else if (visType == "scatterplot") { 
    //     const firstRow = this.props.visualData[col][visType][0];
    //     for (let key in firstRow) {
    //         console.log(`[datavis render] vis field -> ${key} and value ${firstRow[key]}`);
    //         if (key === "review-tfidf-kmeans") {
    //             newSpec.hconcat.push(this.scatterplotClusterSpec);
    //         } else if (key == "review-sentiment") {
    //             newSpec.hconcat.push(this.scatterplotSentimentSpec);
    //         }
    //     }
    //   }
      return (
        <VegaLite spec={this.props.visSpec} data={this.props.visualData} tooltip={new Handler().call} />
      ); 
    }
  }