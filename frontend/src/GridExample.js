import Immutable from "immutable";
import * as React from "react";
import PropTypes from "prop-types";
import { Grid, AutoSizer } from "react-virtualized";
import * as ReactVirtualized from "react-virtualized";
import clsx from "clsx";
import "./Grid.example.css";
import { generateRandomList } from "./utils.js";
import HeaderChart from "./HeaderChart";
import BarChart from "./BarChart";
import headerImage from "./barsample.png";
import { Tooltip } from "@material-ui/core";

const data = {
  table: [
    { category: "A", amount: 28 },
    { category: "B", amount: 55 },
    { category: "C", amount: 43 },
    { category: "D", amount: 91 },
    { category: "E", amount: 81 },
    { category: "F", amount: 53 },
    { category: "G", amount: 19 },
    { category: "H", amount: 87 },
  ],
};

export default class GridExample extends React.Component {
  // static contextTypes = {
  //   list: PropTypes.instanceOf(Immutable.List),
  // };

  constructor(props, context) {
    super(props, context);

    this.state = {
      columnCount: props.datasetHeader.length,
      height: 250,
      overscanColumnCount: 0,
      overscanRowCount: 10,
      rowHeight: 40,
      rowCount: 500,
      scrollToColumn: undefined,
      scrollToRow: undefined,
      useDynamicRowHeight: true,
      highlightedRow: -1,
      isCollapsed: true,
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
    this._collapseCell = this._collapseCell.bind(this);
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
        {({ width }) => (
          <Grid
            cellRenderer={this._cellRenderer}
            className="BodyGrid"
            columnWidth={this._getColumnWidth}
            columnCount={this.props.datasetHeader.length}
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
    // this.grid.measureAllCells();
    this.grid.recomputeGridSize();
    this.grid.forceUpdate();
  }

  _cellRenderer({ columnIndex, key, rowIndex, style }) {
    // if (columnIndex === 0) {
    //   return this._renderLeftSideCell({columnIndex, key, rowIndex, style});
    // }
    if (rowIndex == 1) {
      return this._renderHeaderChartCell({ columnIndex, key, rowIndex, style });
    } else {
      return this._renderBodyCell({ columnIndex, key, rowIndex, style });
    }
  }

  _getColumnWidth({ index }) {
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

    const numCols = this.props.colSizes.length;
    if (numCols == 0) {
      return 300;
    } else {
      const preWidth = this.props.colSizes[index];
      // console.log(`prewidth of index ${index} -> ${preWidth}`);
      if (preWidth == null) {
        return 100;
      } else if (10 * preWidth > 400) {
        return 400;
      } else if (10 * preWidth > 80) {
        return 10 * preWidth;
      } else {
        if (numCols <= 5) {
          return 120;
        } else {
          return 80;
        }
      }
    }
  }

  _getDatum(index) {
    // const {list} = this.context;
    if (this.props.numRows == 0) {
      return "";
    }
    if (index == 0) {
      return this.props.datasetRows[index]; // this is just for the chart header cells
    }

    // if rows are highlighted, place them at the top
    if (this.props.isFiltering == true) {
      // console.log(`[TableView] gets to isfiltering check!`);
      const normalizedIndex = index - 1;
      if (normalizedIndex <= this.props.highlightedRows.length - 1) {
        const highlightedRowNum = this.props.highlightedRows[normalizedIndex];
        // console.log(`[TableView] index is ${highlightedRowNum} should return ${this.props.datasetRows[highlightedRowNum % 501]}`);
        return this.props.datasetRows[highlightedRowNum % 501];
      }
      return "";
    }
    const datum = this.props.datasetRows[index % 501];
    // console.log("datum is -> ", datum);
    return datum;
  }

  _getRowClassName(row) {
    return row % 2 === 0 ? "evenRow" : "oddRow";
  }

  _getRowHeight({ index }) {
    if (index == 1) {
      return this.state.isCollapsed ? 0 : 150;
    } else {
      return 50;
    }
  }

  _noContentRenderer() {
    return <div className="noCells">No cells</div>;
  }

  _highlightRow = (event) => {
    // this.setState({ highlightedRow: event.target.id });
    const rowNum = parseInt(event.target.id);
    if (rowNum > 1) {
      this.props.highlight([rowNum], true);
      // this.grid.forceUpdate();
    }
  };

  _unHighlightRow = (event) => {
    // this.setState({ highlightedRow: -1 });
    this.props.highlight([]);
  };

  _collapseCell = (event) => {
    if (event.target.id == "0") {
      const collapse = this.state.isCollapsed ? false : true;
      this.setState({ isCollapsed: collapse });
      const clickedColName = event.target.innerText;
      console.log(`clicked header cell of column ${clickedColName}`);
      this.grid.recomputeGridSize();
      this.grid.forceUpdate();
      this.props.selectColumn(clickedColName);
    }
  };

  _renderBodyCell({ columnIndex, key, rowIndex, style }) {
    const rowClass = this._getRowClassName(rowIndex - 1);
    const datum =
      rowIndex >= 2 ? this._getDatum(rowIndex - 1) : this._getDatum(rowIndex);

    const colName = this.props.datasetHeader[columnIndex];
    let content;

    if (datum == "" || datum == null) {
      content = "";
    } else if (rowIndex == 0) {
      content = this.props.datasetHeader[columnIndex];
    } else if (this.props.colTypes[colName] == "vector") {
      // if we vector, we only want to display contents on hover
      //   content = "<vector>";
      const previewString = datum[columnIndex];
      content = (
        <Tooltip title={previewString}>
          <p>Vector</p>
        </Tooltip>
      );
    } else {
      content = datum[columnIndex];
    }

    const classNames = clsx(rowClass, "cell", {
      ["centeredCell"]: columnIndex > 2,
      ["headerCell"]: rowIndex == 0,
      ["rowSelected"]: this.props.isFiltering
        ? rowIndex - 2 < this.props.highlightedRows.length && rowIndex > 1
        : this.props.highlightedRows[0] - 1 == rowIndex && rowIndex > 1,
    });

    style = {
      ...style,
      overflow: "hidden",
    };

    return (
      <div
        id={rowIndex}
        onMouseEnter={this._highlightRow}
        onMouseLeave={this._unHighlightRow}
        onClick={this._collapseCell}
        className={classNames}
        key={key}
        style={style}
      >
        {content}
      </div>
    );
  }

  _renderLeftSideCell({ key, rowIndex, style }) {
    const datum = this._getDatum(rowIndex);
    let content;
    if (datum == "" || datum == null) {
      content = rowIndex;
    } else {
      content = rowIndex == 0 ? "id" : datum.id;
    }
    const rowClass = this._getRowClassName(rowIndex);

    const classNames = clsx(rowClass, "cell", {
      ["headerCell"]: rowIndex == 0,
      ["rowSelected"]: rowIndex == this.state.highlightedRow && rowIndex > 1,
    });

    // Don't modify styles.
    // These are frozen by React now (as of 16.0.0).
    // Since Grid caches and re-uses them, they aren't safe to modify.
    style = {
      ...style,
      // backgroundColor: "Thistle",
    };

    return (
      <div
        id={rowIndex}
        onMouseOver={this._highlightRow}
        className={classNames}
        key={key}
        style={style}
      >
        {content}
      </div>
    );
  }

  _renderHeaderChartCell({ columnIndex, key, rowIndex, style }) {
    const datum = this._getDatum(rowIndex);
    const colName = this.props.datasetHeader[columnIndex];
    let content;
    if (datum == "" || datum == null) {
      content = rowIndex;
    } else {
      content = rowIndex == 0 ? "id" : datum.id;
    }
    const rowClass = this._getRowClassName(rowIndex);

    const classNames = clsx(rowClass, "cell", "centeredCell", {
      ["headerCell"]: rowIndex == 0,
      ["rowSelected"]: rowIndex == this.state.highlightedRow && rowIndex > 1,
    });

    // Don't modify styles.
    // These are frozen by React now (as of 16.0.0).
    // Since Grid caches and re-uses them, they aren't safe to modify.
    style = {
      ...style,
      // backgroundColor: "Thistle",
    };

    if (this.props.visTypes[colName] == "distribution") {
      return (
        <div
          id={rowIndex}
          onMouseOver={this._highlightRow}
          className={classNames}
          key={key}
          style={style}
        >
          <BarChart
            data={this.props.visualData[colName]}
            height={this.state.rowHeight}
            mode="fit"
          />
        </div>
      );
    } else {
      return (
        <div
          id={rowIndex}
          onMouseOver={this._highlightRow}
          className={classNames}
          key={key}
          style={style}
        ></div>
      );
    }
  }

  _updateUseDynamicRowHeights(value) {
    this.setState({
      useDynamicRowHeight: value,
    });
  }

  _onColumnCountChange(event) {
    const columnCount = parseInt(event.target.value, 10) || 0;

    this.setState({ columnCount });
  }

  _onRowCountChange(event) {
    const rowCount = parseInt(event.target.value, 10) || 0;

    this.setState({ rowCount });
  }

  _onScrollToColumnChange(event) {
    const { columnCount } = this.state;
    let scrollToColumn = Math.min(
      columnCount - 1,
      parseInt(event.target.value, 10)
    );

    if (isNaN(scrollToColumn)) {
      scrollToColumn = undefined;
    }

    this.setState({ scrollToColumn });
  }

  _onScrollToRowChange(event) {
    const { rowCount } = this.state;
    let scrollToRow = Math.min(rowCount - 1, parseInt(event.target.value, 10));

    if (isNaN(scrollToRow)) {
      scrollToRow = undefined;
    }

    this.setState({ scrollToRow });
  }
}
