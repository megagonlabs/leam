import React, { PropTypes } from 'react';
import { VegaLite } from 'react-vega';




export default class BarChart extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.spec = {
      width: 100,
      height: 100,
      mark: 'bar',
      encoding: {
        x: { field: 'a', type: 'ordinal' },
        y: { field: 'b', type: 'quantitative' },
      },
      data: { name: 'table' }
    };

    this.data = {
      table: [
        { a: 'A', b: 28 },
        { a: 'B', b: 55 },
        { a: 'C', b: 43 },
        { a: 'D', b: 91 },
        { a: 'E', b: 81 },
        { a: 'F', b: 53 },
        { a: 'G', b: 19 },
        { a: 'H', b: 87 },
        { a: 'I', b: 52 },
      ],
    };
  }

  render() {
    let {mode, src, height, width, style, ...props} = this.props;
    let modes = {
      'fill': 'cover',
      'fit': 'contain'
    };
    let size = modes[mode] || 'contain';
    let defaults = {
      height: 100,
      width: 100,
    };

    return (
        <VegaLite spec={this.spec} data={this.data} />
    );
  }

}