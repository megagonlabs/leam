import React, { PropTypes } from 'react';
import { VegaLite } from 'react-vega';

export default class BarChart extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.spec = {
        width: props.width || 100,
        height: props.height || 100,
        transform: [
            {
                filter: "datum.order <= 3"
            }
        ],
        mark: 'bar',
        encoding: {
          y: { field: 'topword', type: 'ordinal', sort: '-x' },
          x: { field: 'score', type: 'quantitative' },
        },
        data: { name: 'distribution' },
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
        <VegaLite spec={this.spec} data={this.props.data} />
    );
  }

}