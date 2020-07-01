import Immutable from 'immutable';
import * as React from 'react';
import PropTypes from "prop-types";
import {Grid, AutoSizer} from 'react-virtualized';
import * as ReactVirtualized from 'react-virtualized';
import clsx from 'clsx';
import './Grid.example.css';
import {generateRandomList} from './utils.js';
import HeaderChart from './HeaderChart';
import headerImage from './barsample.png';

export default class GridExample extends React.Component {
  // static contextTypes = {
  //   list: PropTypes.instanceOf(Immutable.List),
  // };

  constructor(props, context) {
    super(props, context);

    this.state = {
      columnCount: props.numCols,
      height: 300,
      overscanColumnCount: 0,
      overscanRowCount: 10,
      rowHeight: 50,
      rowCount: 500,
      scrollToColumn: undefined,
      scrollToRow: undefined,
      useDynamicRowHeight: false,
      highlightedRow: -1,
    };

    this._cellRenderer = this._cellRenderer.bind(this);
    this._getColumnWidth = this._getColumnWidth.bind(this);
    this._getRowClassName = this._getRowClassName.bind(this);
    this._getRowHeight = this._getRowHeight.bind(this);
    this._noContentRenderer = this._noContentRenderer.bind(this);
    this._onColumnCountChange = this._onColumnCountChange.bind(this);
    this._onRowCountChange = this._onRowCountChange.bind(this);
    this._onScrollToColumnChange = this._onScrollToColumnChange.bind(this);
    this._onScrollToRowChange = this._onScrollToRowChange.bind(this);
    this._renderBodyCell = this._renderBodyCell.bind(this);
    this._highlightRow = this._highlightRow.bind(this);
    this._unHighlightRow = this._unHighlightRow.bind(this);
    // this._renderLeftSideCell = this._renderLeftSideCell.bind(this);

    // this.list = Immutable.List(generateRandomList());
  }

  render() {
    const {
      columnCount,
      height,
      overscanColumnCount,
      overscanRowCount,
      rowHeight,
      rowCount,
      scrollToColumn,
      scrollToRow,
      useDynamicRowHeight,
    } = this.state;

    return (
        <AutoSizer disableHeight ref="AutoSizer">
          {({width}) => (
            <Grid
              cellRenderer={this._cellRenderer}
              className="BodyGrid"
              columnWidth={this._getColumnWidth}
              columnCount={this.props.numCols}
              height={height}
              noContentRenderer={this._noContentRenderer}
              overscanColumnCount={overscanColumnCount}
              overscanRowCount={overscanRowCount}
              rowHeight={useDynamicRowHeight ? this._getRowHeight : rowHeight}
              rowCount={rowCount}
              scrollToColumn={scrollToColumn}
              scrollToRow={scrollToRow}
              width={width}
              ref="Grid"
            />
          )}
        </AutoSizer>
    );
  }

  componentDidMount() {
    this.grid = this.refs.AutoSizer.refs.Grid;
  }

  componentWillReceiveProps(props) {
    // this.grid.forceUpdate();
    // this.grid.measureAllCells();
    this.grid.recomputeGridSize();
  }

  _cellRenderer({columnIndex, key, rowIndex, style}) {
    if (columnIndex === 0) {
      return this._renderLeftSideCell({columnIndex, key, rowIndex, style});
    } 
    else if (rowIndex == 1)
    {
      return this._renderHeaderChartCell({columnIndex, key, rowIndex, style});
    }
    else {
      return this._renderBodyCell({columnIndex, key, rowIndex, style});
    }
  }

  _getColumnWidth({index}) {
    // switch (index) {
    //   case 0:
    //     return 80;
    //   case 1:
    //     return 100;
    //   case 2:
    //     return 300;
    //   default:
    //     return 80;
    // }

    if (this.props.colSizes.length == 0) {
      return 150;
    } else {
      const preWidth = this.props.colSizes[index];
      // console.log(`prewidth of index ${index} -> ${preWidth}`);
      if (preWidth == null) {
        return 100;
      } else if (10*preWidth > 400) {
        return 400;
      } else if (10*preWidth > 80) {
        return 10*preWidth;
      } else {
        return 80;
      }
    }

  }

  _getDatum(index) {
    // const {list} = this.context;
    if (this.props.numRows == 0) {
      return "";
    } 
    const datum = this.props.datasetRows[index % 501];
    // console.log("datum is -> ", datum);
    return datum;
  }

  _getRowClassName(row) {
    return row % 2 === 0 ? "evenRow" : "oddRow";
  }

  _getRowHeight({index}) {
    // return this._getDatum(index).size;
    return 75;
  }

  _noContentRenderer() {
    return <div className="noCells">No cells</div>;
  }

  _highlightRow = event => {
    this.setState({ highlightedRow: event.target.id });
    this.grid.forceUpdate();
  }

  _unHighlightRow = event => {
    this.setState({ highlightedRow: -1 });
  }

  _renderBodyCell({columnIndex, key, rowIndex, style}) {
    const rowClass = this._getRowClassName(rowIndex);
    const datum = this._getDatum(rowIndex);

    let content;

    if (datum == "" || datum == null) {
      content = "";
    } else if (rowIndex == 0) {
      if (columnIndex == 0) {
        content = "id";
      } else {
        content = this.props.datasetHeader[columnIndex - 1];
      }
    } else {
      content = datum[this.props.datasetHeader[columnIndex - 1]];
    }

    const classNames = clsx(rowClass, "cell", {
      ["centeredCell"]: columnIndex > 2,
      ["headerCell"]: rowIndex == 0,
      ["rowSelected"]: (rowIndex == this.state.highlightedRow) && (rowIndex > 1),
    });

    style = {
      ...style, 
    }

    return (
      <div id={rowIndex} onMouseOver={this._highlightRow} className={classNames} key={key} style={style}>
        {content}
      </div>
    );
  }

  _renderLeftSideCell({key, rowIndex, style}) {
    const datum = this._getDatum(rowIndex);
    let content;
    if (datum == "" || datum == null) {
      content = rowIndex;
    } else {
      content = (rowIndex == 0) ? "id" : datum.id;
    }
    const rowClass = this._getRowClassName(rowIndex);

    const classNames = clsx(rowClass, "cell", {
      ["headerCell"]: rowIndex == 0,
      ["rowSelected"]: (rowIndex == this.state.highlightedRow) && (rowIndex > 1),
    });

    // Don't modify styles.
    // These are frozen by React now (as of 16.0.0).
    // Since Grid caches and re-uses them, they aren't safe to modify.
    style = {
      ...style,
      // backgroundColor: "Thistle",
    };


    return (
      <div id={rowIndex} onMouseOver={this._highlightRow} className={classNames} key={key} style={style}>
        {content}
      </div>
    );
  }

  _renderHeaderChartCell({key, rowIndex, style}) {
    const datum = this._getDatum(rowIndex);
    let content;
    if (datum == "" || datum == null) {
      content = rowIndex;
    } else {
      content = (rowIndex == 0) ? "id" : datum.id;
    }
    const rowClass = this._getRowClassName(rowIndex);

    const classNames = clsx(rowClass, "cell", "centeredCell", {
      ["headerCell"]: rowIndex == 0,
      ["rowSelected"]: (rowIndex == this.state.highlightedRow) && (rowIndex > 1),
    });

    // Don't modify styles.
    // These are frozen by React now (as of 16.0.0).
    // Since Grid caches and re-uses them, they aren't safe to modify.
    style = {
      ...style,
      // backgroundColor: "Thistle",
    };


    return (
      <div id={rowIndex} onMouseOver={this._highlightRow} className={classNames} key={key} style={style}>
        <HeaderChart src={headerImage} height={this.state.rowHeight} mode='fit' />
      </div>
    );
  }

  _updateUseDynamicRowHeights(value) {
    this.setState({
      useDynamicRowHeight: value,
    });
  }

  _onColumnCountChange(event) {
    const columnCount = parseInt(event.target.value, 10) || 0;

    this.setState({columnCount});
  }

  _onRowCountChange(event) {
    const rowCount = parseInt(event.target.value, 10) || 0;

    this.setState({rowCount});
  }

  _onScrollToColumnChange(event) {
    const {columnCount} = this.state;
    let scrollToColumn = Math.min(
      columnCount - 1,
      parseInt(event.target.value, 10),
    );

    if (isNaN(scrollToColumn)) {
      scrollToColumn = undefined;
    }

    this.setState({scrollToColumn});
  }

  _onScrollToRowChange(event) {
    const {rowCount} = this.state;
    let scrollToRow = Math.min(rowCount - 1, parseInt(event.target.value, 10));

    if (isNaN(scrollToRow)) {
      scrollToRow = undefined;
    }

    this.setState({scrollToRow});
  }
}