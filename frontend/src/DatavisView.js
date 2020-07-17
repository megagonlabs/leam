import React, { PropTypes } from 'react';
import { VegaLite } from 'react-vega';
import BarChart from "./BarChart.js";
import { Handler } from 'vega-tooltip';
import vegaEmbed from 'vega-embed';


const vgEmbedOptions = { actions: false, renderer: 'svg', tooltip: true };


export default class DatavisView extends React.Component {
    constructor(props, context) {
      super(props, context);
    }

    componentDidMount() {
        // histograms for attributes
        vegaEmbed(this.visRef, this.props.visSpec, vgEmbedOptions).then(({spec, view}) => {
            view.addEventListener('mouseover', function (event, item) {
                console.log(item.datum)
            })
        })
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
            <div className="vgl-vis" id="vgl-vis" ref={e => this.visRef = e}></div>
        );
    }
  }