import React, { Component } from "react";
import { Row, Col, Container } from "react-bootstrap";
import { withStyles } from "@material-ui/core/styles";
import {
  Grid,
  Box,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
} from "@material-ui/core";
import { Menu } from "@material-ui/icons";
import axios from "axios";
import classNames from "classnames";
import DatasetDropdown from "./DatasetDropdown.js";
import BarChart from "./BarChart";
import OperatorView from "./OperatorView.js";
import DatavisView from "./DatavisView.js";
import TableView from "./GridExample.js";
import NotebookView from "./NotebookView.js";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "fontsource-roboto";
import stopwords from "./stopwords.json";
import generateVTASpec from "./vta/VtaGenerator.js";

const useStyles = (theme) => ({
  root: {
    flexGrow: 1,
    height: "200px",
  },
  buttonsCells: {
    flexGrow: 1,
    height: "150px",
  },
  paper: {
    // marginTop: theme.spacing(1),
    padding: theme.spacing(2),
    textAlign: "start",
    color: theme.palette.text.secondary,
  },
  button: {
    display: "block",
  },
  formControl: {
    minWidth: 200,
  },
  grid: {
    margin: theme.spacing(2),
    flexGrow: 1,
  },
  largeIcon: {
    width: 80,
    height: 80,
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: 2,
  },
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileName: "No Dataset Selected",
      fileType: null,
      fileData: null,
      fileNumRows: null,
      fileHeaders: [],
      datasets: [],
      datasetRows: [],
      visualEncodings: {},
      selectedVisIdx: -1,
      visualizationTypes: {},
      columnTypes: {},
      columnSizes: [],
      selectedColumn: null,
      dataVisSpec: [],
      reverseIndex: {},
      highlightedRows: [],
      filtering: false,
    };
    this.fileReader = new FileReader();
    // this.getDropdownFiles = this.getDropdownFiles.bind(this);
    this.loadFile = this.loadFile.bind(this);
    this.getFiles = this.getFiles.bind(this);
    this.applyOperator = this.applyOperator.bind(this);
    this.selectColumn = this.selectColumn.bind(this);
    this.classes = this.props.classes;
    this.highlightRows = this.highlightRows.bind(this);
    this.selectVisIdx = this.selectVisIdx.bind(this);
  }

  selectVisIdx = (idx) => {
    this.setState({ selectedVisIdx: idx });
  };

  highlightRows = (rows, isMouseover) => {
    const normalizedRows = rows.map((val, _) => val + 1);
    this.setState({ highlightedRows: normalizedRows });
    if (isMouseover == false) {
      this.setState({ filtering: true });
    } else {
      this.setState({ filtering: false });
    }
    //   if (isMouseover === false && this.state.datasetRows.length > 0) {
    //       // filter highlighted rows to top
    //       const actualRows = this.state.datasetRows.filter((r, _) => ((rows.includes(r[0]+1) == false) && (r[0] > 1)));
    //       let newDatasetRows = [this.state.datasetRows[0]];
    //       for (let key in actualRows) {
    //           const r = actualRows[key];
    //           newDatasetRows.push(r);
    //       }
    //       let remainingRows = this.state.datasetRows.filter((r, _) => ((rows.includes(r[0]+1) == false) && (r[0] > 1)));
    //       newDatasetRows = [...newDatasetRows, ...remainingRows];
    //       this.setState({datasetRows: newDatasetRows});
    //   }
  };

  applyOperator = (operatorName, columnNames, actionName, selectedIndices) => {
    console.log(
      `doing operator: ${operatorName} columns -> ${columnNames} with action -> ${actionName} with indices -> ${selectedIndices}`
    );
    const datasetName = this.state.fileName;
    let operator;
    switch (operatorName) {
      case "Clean":
        operator = "clean";
        break;
      case "Featurize":
        operator = "featurize";
        break;
      case "Select":
        operator = "select";
        break;
      default:
        operator = "clean";
    }
    let op;
    let action;
    switch (actionName) {
      case "Lowercase":
        action = "lowercase";
        break;
      case "Remove Stopwords":
        action = "stopword";
        break;
      case "Stemming":
        action = "stemming";
        break;
      case "Remove Punctuation":
        action = "punctuation";
        break;
      case "TF-IDF":
        action = "tfidf";
        break;
      case "K-Means":
        action = "kmeans";
        break;
      case "PCA":
        action = "pca";
        break;
      case "Sentiment":
        action = "sentiment";
        break;
      case "Projection":
        action = "projection";
        break;
      case "Visualization":
        action = "visualization";
        const visName = `<${columnNames.join("_")}>`;
        this.setState({ selectedColumn: visName });
        break;
      default:
        // default is lowercase action
        action = actionName.toLowerCase();
    }

    const vtaSpec = generateVTASpec(
      opCategory,
      op,
      action,
      columnNames,
      datasetName
    );

    console.log(vtaSpec);

    const url = "http://localhost:5000/v1/run-operator";
    // fetch the actual rows
    axios
      .post(
        url,
        { indices: selectedIndices, columns: columnNames },
        {
          params: {
            operator: operator,
            action: action,
            dataset: datasetName,
            visualization: "review-tfidf",
          },
        }
      )
      .then((response) => {
        console.log(`operator response body is ${response.body}`);
      })
      .then(() => {
        this.loadFile(datasetName);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  selectColumn = (colName) => {
    this.setState({ selectedColumn: colName });
  };

  onFileChange = (event) => {
    // console.log("event: ", event)
    var file = event.target.files[0];
    this.fileReader.onloadend = this.handleFileRead;
    this.fileReader.readAsText(file);
    this.setState({ fileName: file.name, fileType: file.type });
  };

  handleFileRead = () => {
    const fileData = this.fileReader.result;
    const formData = new FormData();
    formData.append("filename", this.state.fileName);
    formData.append("filetype", this.state.fileType);
    formData.append("filedata", fileData);
    // console.log("uploading filename: ", this.state.fileName);
    // console.log("uploading filetype: ", this.state.fileType);
    // console.log("uploading file contents: ", this.state.fileData);

    // TODO: implement uploadfile endpoint in Flask
    axios
      .post("http://localhost:5000/v1/upload-file", formData)
      .then(() => {
        this.getFiles();
      })
      .then(() => {
        console.log(`loading file ${this.state.fileName}`);
        this.loadFile(this.state.fileName);
      });
  };

  // content that is displayed after File Uploaded
  fileData = () => {
    // let columns = "[";
    var columns = Object.assign([], this.state.fileHeaders);
    // if (columns.length > 6) {
    //   columns = columns.slice(0, 6);
    //   columns.push("...");
    // }
    return (
      <div>
        <p>File Name: {this.state.fileName}</p>
        <p id="columns-list" style={{ overflow: "wrap" }}>
          Columns: {JSON.stringify(columns)}
        </p>
        <p># Rows: {this.state.fileNumRows}</p>
      </div>
    );
  };

  getFiles = () => {
    axios
      .get("http://localhost:5000/v1/get-datasets")
      .then((response) => {
        let allDatasets = response.data["datasets"];
        // let newDatasets = Object.assign({}, this.state.datasets);
        let newDatasets = [];
        for (let key in allDatasets) {
          let datasetInfo = allDatasets[key];
          newDatasets.push(datasetInfo);
        }
        this.setState({ datasets: newDatasets });
      })
      .catch(function (error) {
        console.log(error);
      });
    // .then(function () {
    //   // always executed
    // });
  };

  componentDidMount() {
    this.getFiles();
  }

  loadFile = (name) => {
    const fileName = name;
    let fileRows = 0;
    for (let i = 0; i < this.state.datasets.length; i++) {
      let datasetInfo = this.state.datasets[i];
      if (datasetInfo["name"] === fileName) {
        fileRows = datasetInfo["num_rows"];
      }
    }
    this.setState({
      fileName: fileName,
      fileNumRows: fileRows,
    });

    const url = "http://localhost:5000/v1/get-datasets/" + fileName;
    // fetch the actual rows
    axios
      .get(url, {
        headers: {
          numrows: 500,
        },
      })
      .then((response) => {
        let rows = [];
        let idRow = [];
        let chartRow = [];
        chartRow.push("");
        const columns = JSON.parse(response.data["columns"]);
        const columnTypes = JSON.parse(response.data["columnTypes"]);
        const visualEncodings = JSON.parse(response.data["encodings"]);
        const visIndexes = JSON.parse(response.data["vis_idx"]);
        let visualEncodingRows = [];
        let visTypes = {};

        console.log(`visIndex is: ${visIndexes["barchart"]}`);
        const indexes = {
          ...this.state.reverseIndex,
          barchart: visIndexes["barchart"],
        };
        this.setState({ reverseIndex: indexes });

        // let spec = {
        //     $schema: "https://vega.github.io/schema/vega-lite/v4.json",
        //     hconcat: [
        //     ],
        //     data: { values: [] },
        // };
        const specList = [];
        // let distributionSpec = {
        //   $schema: "https://vega.github.io/schema/vega-lite/v4.json",
        //   data: { values: [] },
        //   width: 200,
        //   height: 200,
        //   layer: [
        //     {
        //       selection: {
        //         Number: {
        //           type: "single",
        //           fields: ["TopWords"],
        //           init: { TopWords: 10 },
        //           bind: {
        //             TopWords: { input: "range", min: 1, max: 50, step: 1 },
        //           },
        //         },
        //       },
        //       transform: [
        //         {
        //           filter: "datum.order <= Number.TopWords",
        //         },
        //       ],
        //       mark: { type: "bar", tooltip: true },
        //       encoding: {
        //         y: { field: "topword", type: "ordinal", sort: "-x" },
        //         x: { field: "score", type: "quantitative" },
        //       },
        //     },
        //   ],
        // };

        let distributionSpec = {
          $schema: "https://vega.github.io/schema/vega-lite/v4.json",
          data: {
            values: [],
          },
          width: 200,
          height: 200,
          selection: {
            select: { type: "single" },
            Number: {
              type: "single",
              fields: ["TopWords"],
              init: { TopWords: 10 },
              bind: {
                TopWords: { input: "range", min: 1, max: 50, step: 1 },
              },
            },
          },
          transform: [
            {
              filter: "datum.order <= Number.TopWords",
            },
          ],
          mark: {
            type: "bar",
            fill: "#4C78A8",
            cursor: "pointer",
            tooltip: true,
          },
          encoding: {
            y: { field: "topword", type: "ordinal", sort: "-x" },
            x: { field: "score", type: "quantitative" },
            fillOpacity: {
              condition: { selection: "select", value: 1 },
              value: 0.3,
            },
            strokeWidth: {
              condition: { selection: "select", value: 1 },
              value: 0,
            },
          },
          config: {
            scale: {
              bandPaddingInner: 0.2,
            },
          },
        };

        let scatterplotSentimentSpec = {
          $schema: "https://vega.github.io/schema/vega-lite/v4.json",
          data: { values: [] },
          width: 150,
          height: 200,
          mark: "point",
          encoding: {
            y: { field: "pca_1", type: "quantitative" },
            x: { field: "pca_0", type: "quantitative" },
            tooltip: { field: "review", type: "nominal" },
            color: {
              field: "review-sentiment",
              type: "quantitative",
              scale: {
                range: ["crimson", "royalblue"],
              },
            },
          },
        };

        let scatterplotClusterSpec = {
          $schema: "https://vega.github.io/schema/vega-lite/v4.json",
          data: { values: [] },
          width: 150,
          height: 200,
          mark: "circle",
          encoding: {
            y: { field: "pca_1", type: "quantitative" },
            x: { field: "pca_0", type: "quantitative" },
            tooltip: { field: "review", type: "nominal" },
            color: {
              field: "review-tfidf-kmeans",
              type: "nominal",
            },
          },
        };
        for (let key in visualEncodings) {
          const visData = visualEncodings[key];
          const visKeys = Object.keys(visData);
          if (visKeys.length > 0) {
            const rows = visData[visKeys[0]];
            for (let rowIdx in rows) {
              const rowVal = rows[rowIdx];
              if (visualEncodingRows.length >= rowIdx - 1) {
                visualEncodingRows[rowIdx] = {
                  ...visualEncodingRows[rowIdx],
                  ...rowVal,
                };
              } else {
                visualEncodingRows.push(rowVal);
              }
            }
          }
        }

        for (let key in visualEncodings) {
          const visData = visualEncodings[key];
          const visKeys = Object.keys(visData);
          if (visKeys.length > 0) {
            console.log(
              `vis data of key ${key} contains a visualization object with type ${visKeys[0]}`
            );
            visTypes[key] = visKeys[0];
            if (
              key == "<pca_0_pca_1_review-sentiment>" ||
              key == "<pca_0_pca_1_review-sentiment_review>" ||
              key == "<review_pca_0_pca_1_review-sentiment>"
            ) {
              // spec.hconcat = [...spec.hconcat, scatterplotSentimentSpec];
              scatterplotSentimentSpec.data.values = visualEncodingRows;
              specList.push(scatterplotSentimentSpec);
            } else if (
              key == "<pca_0_pca_1_review-tfidf-kmeans>" ||
              key == "<pca_0_pca_1_review-tfidf-kmeans_review>" ||
              key == "<review_pca_0_pca_1_review-tfidf-kmeans>"
            ) {
              // spec.hconcat = [...spec.hconcat, scatterplotClusterSpec];
              scatterplotClusterSpec.data.values = visualEncodingRows;
              specList.push(scatterplotClusterSpec);
            } else if (key == "review-tfidf") {
              // spec.hconcat = [...spec.hconcat, distributionSpec];
              distributionSpec.data.values = visualEncodingRows;
              specList.push(distributionSpec);
            }
          }
        }

        const newVisualEncodings = { all: visualEncodingRows };

        this.setState({ fileHeaders: columns });
        for (let key in columns) {
          chartRow.push("");
        }
        rows.push(chartRow);
        rows.push(...JSON.parse(response.data["rows"]));

        // let processedVisualEncodings = {...visualEncodings};
        // // set visual encoding data
        // for (let key in columnTypes) {
        //     if (columnTypes[key] === "tfidf") {
        //         const tfIdfEncoding = {
        //             "topwords": visualEncodings[key]
        //         };
        //         processedVisualEncodings[key] = tfIdfEncoding;
        //     }
        // }

        // determining correct widths of the columns
        let columnWidths = new Array(this.state.fileHeaders.length).fill(0);
        columnWidths[0] = 100; // fixed size column
        // determine column widths by taking average of lengths over first 20 rows
        for (let i = 0; i < 20; i++) {
          const rowData = rows[i];
          for (let j = 0; j < this.state.fileHeaders.length; j++) {
            const colLength = rowData[j].length;
            columnWidths[j + 1] += colLength;
          }
        }
        columnWidths = columnWidths.map((val) => {
          return val / 20;
        });
        this.setState({
          datasetRows: rows,
          columnSizes: columnWidths,
          columnTypes,
          visualEncodings: newVisualEncodings,
          visualizationTypes: visTypes,
          dataVisSpec: specList,
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  render() {
    return (
      <div className={this.classes.root}>
        <Grid container className={this.classes.root} spacing={2}>
          <Grid item xs={12}>
            <AppBar position="static" color="primary">
              <Toolbar variant="dense">
                <IconButton edge="start" color="inherit" aria-label="menu">
                  <Menu />
                </IconButton>
                <Typography variant="h5" color="inherit">
                  Text Explorer
                </Typography>
              </Toolbar>
            </AppBar>
          </Grid>
          <Grid item xs={5}>
            <Paper className={this.classes.paper}>
              <DatasetDropdown
                key="dataset-dropdown"
                datasets={this.state.datasets}
                onFileChange={this.onFileChange}
                fileName={this.state.fileName}
                loadFile={this.loadFile}
                getFiles={this.getFiles}
                classes={this.classes}
              />
            </Paper>
          </Grid>
          <Grid item xs={7}>
            <Paper className={this.classes.paper}>
              <OperatorView
                key="operator-view"
                classes={this.classes}
                columns={this.state.fileHeaders}
                applyOperator={this.applyOperator}
              />
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper className={this.classes.paper}>
              <DatavisView
                key="datavis-view"
                visualData={this.state.visualEncodings}
                visSpecList={this.state.dataVisSpec}
                selectedIdx={this.state.selectedVisIdx}
                selectVisIdxFunc={this.selectVisIdx}
                visTypes={this.state.visualizationTypes}
                selectedColumn={this.state.selectedColumn}
                width={350}
                height={200}
                reverseIdx={this.state.reverseIndex}
                highlightRows={this.highlightRows}
              />
            </Paper>
          </Grid>
          <Grid item xs={8}>
            <Box ml={2}>
              <TableView
                key="table-view"
                datasetRows={this.state.datasetRows}
                datasetHeader={this.state.fileHeaders}
                visualData={this.state.visualEncodings}
                selectedVisIdx={this.state.selectedVisIdx}
                selectVisIdxFunc={this.selectVisIdx}
                visTypes={this.state.visualizationTypes}
                colTypes={this.state.columnTypes}
                selectColumn={this.selectColumn}
                colSizes={this.state.columnSizes}
                highlightedRows={this.state.highlightedRows}
                highlight={this.highlightRows}
                isFiltering={this.state.filtering}
              />
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Paper className={this.classes.paper}>
              <NotebookView
                loadFile={this.loadFile}
                datasetName={this.state.fileName}
                selectVisIdxFunc={this.selectVisIdx}
                reverseIdx={this.state.reverseIndex}
                highlightRows={this.highlightRows}
              />
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(useStyles)(App);
