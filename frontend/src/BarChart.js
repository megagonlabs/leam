import React, { PropTypes } from 'react';
import { createClassFromSpec } from 'react-vega';

export default createClassFromSpec('BarChart', {
  "width": 100,
  "height": 100,
  "data": [{ "topword": "regret", "score": 0.7071067811865475 },
           { "topword": "favorite", "score":  0.4472135954999579},
           { "topword": "floor", "score": 0.6738746490004381}],
  "encoding": {
    "x": {"field": "topword", "type": "ordinal", "axis": {"labelAngle": 0}},
    "y": {"field": "score", "type": "quantitative"}
  }
});