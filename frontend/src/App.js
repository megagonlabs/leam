import React, { Component, useCallback } from "react";
import { withStyles } from "@material-ui/core/styles";
import {
  Grid,
  Box,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
} from "@material-ui/core";
import { Menu, SignalCellularNoSim } from "@material-ui/icons";
import axios from "axios";
import classNames from "classnames";
import DatasetDropdown from "./DatasetDropdown.js";
import BarChart from "./BarChart";
import OperatorView from "./OperatorView.js";
import DatavisView from "./DatavisView.js";
import TableView from "./GridExample.js";
import LeamAppBar from "./components/LeamAppBar.js";
import NotebookView from "./components/NotebookView.js";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "fontsource-roboto";
import stopwords from "./stopwords.json";
import generateVTASpec from "./vta/VtaGenerator.js";
import Draggable from "react-draggable";

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
    padding: theme.spacing(1),
    textAlign: "start",
    color: theme.palette.text.secondary,
  },
  button: {
    display: "block",
  },
  formControl: {
    minWidth: 150,
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
      modelName: null,
      modelType: null,
      datasets: [],
      datasetRows: [],
      visualEncodings: {},
      selectedVisIdx: -1,
      visualizationTypes: {},
      columnTypes: {},
      columnSizes: [],
      selectedColumn: null,
      dataVisSpec: [],
      visSelectFunctions: {}, // map vis_idx -> select func object
      visViews: {},
      reverseIndex: {},
      highlightedRows: [],
      filtering: false,
      coordinatingScatterPlot: false,
      coordinatingTable: false,
    };
    this.fileReader = new FileReader();
    this.modelReader = new FileReader();
    this.onModelChange = this.onModelChange.bind(this);
    this.handleModelUpload = this.handleModelUpload.bind(this);
    // this.getDropdownFiles = this.getDropdownFiles.bind(this);
    this.loadFile = this.loadFile.bind(this);
    this.getFiles = this.getFiles.bind(this);
    this.applyOperator = this.applyOperator.bind(this);
    this.selectColumn = this.selectColumn.bind(this);
    this.classes = this.props.classes;
    this.highlightRows = this.highlightRows.bind(this);
    this.setVisView = this.setVisView.bind(this);
  }

  setVisView = (visIdx, view) => {
    let visViewsNew = this.state.visViews;
    visViewsNew[visIdx] = view;
    this.setState({ visViews: visViewsNew });
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

  applyOperator = (
    operatorCategory,
    columnNames,
    operator,
    selectedIndices
  ) => {
    console.log(
      `doing operator type: ${operatorCategory} columns -> ${columnNames} with operator -> ${operator} with indices -> ${selectedIndices}`
    );
    const datasetName = this.state.fileName;
    let opCategory;
    switch (operatorCategory) {
      case "Clean":
        opCategory = "clean";
        break;
      case "Featurize":
        opCategory = "featurize";
        break;
      case "Select":
        opCategory = "select";
        break;
      default:
        opCategory = "clean";
    }
    let op;
    let action;
    switch (operator) {
      case "Correct Spellings":
        op = "correct_spellings";
        action = "update";
        break;
      case "Remove Emoji":
        op = "remove_emoji";
        action = "update";
        break;
      case "Remove Square Brackets":
        op = "remove_square_brackets";
        action = "update";
        break;
      case "Remove URLs":
        op = "remove_urls";
        action = "update";
        break;
      case "Strip HTML":
        op = "strip_html";
        action = "update";
        break;
      case "Lowercase":
        op = "lowercase";
        action = "update";
        break;
      case "Remove Stopwords":
        op = "stopword";
        action = "update";
        break;
      case "Stemming":
        op = "stemming";
        action = "update";
        break;
      case "Remove Punctuation":
        op = "punctuation";
        action = "update";
        break;
      case "TF-IDF":
        op = "tfidf";
        action = "create";
        break;
      case "K-Means":
        op = "kmeans";
        action = "create";
        break;
      case "PCA":
        op = "pca";
        action = "create";
        break;
      case "Sentiment":
        op = "sentiment";
        action = "create";
        break;
      case "Projection":
        op = "projection";
        action = "create";
        break;
      case "Visualization":
        op = "visualization";
        action = "create";
        const visName = `<${columnNames.join("_")}>`;
        this.setState({ selectedColumn: visName });
        break;
      default:
        // default is lowercase action
        op = operator.toLowerCase();
        action = "create";
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
      .post(url, { vta_spec: vtaSpec })
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

  onModelChange = (event) => {
    let file = event.target.files[0];
    this.modelReader.onloadend = this.handleModelUpload;
    this.modelReader.readAsDataURL(file);
    console.log(
      `starting model upload with model name ${file.name} and type ${file.type}`
    );
    this.setState({ modelName: file.name, modelType: file.type });
  };

  handleModelUpload = () => {
    const modelData = this.modelReader.result;
    const formData = new FormData();
    formData.append("modelName", this.state.modelName);
    formData.append("modelType", this.state.modelType);
    formData.append("modelData", modelData);
    console.log("modelData: ");
    console.log(modelData);
    // console.log("uploading filename: ", this.state.fileName);
    // console.log("uploading filetype: ", this.state.fileType);
    // console.log("uploading file contents: ", this.state.fileData);

    // TODO: implement uploadfile endpoint in Flask
    axios.post("http://localhost:5000/v1/upload-model", formData).then(() => {
      console.log(`uploaded model: ${this.state.modelName}`);
    });
  };

  onFileChange = (event) => {
    // console.log("event: ", event)
    var file = event.target.files[0];
    this.fileReader.onloadend = this.handleFileRead;
    this.fileReader.readAsText(file);
    this.setState({ fileName: file.name, fileType: file.type });
    console.log(
      `in ONFILECHANGE, name is ${this.state.fileName} locally is ${file.name}`
    );
    this.loadFile(file.name);
  };

  handleFileRead = () => {
    const fileData = this.fileReader.result;
    const formData = new FormData();
    formData.append("filename", this.state.fileName);
    formData.append("filetype", this.state.fileType);
    formData.append("filedata", fileData);
    console.log("filedata: ");
    console.log(fileData);
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

  addScatterPlotCoordination() {
    this.setState({ coordinatingScatterPlot: true });
  }

  addTableCoordination() {
    this.setState({ coordinatingTable: true });
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
        let visSpecList = [];
        const visualizations = JSON.parse(response.data["visualizations"]);
        let currVisSelectFunctions = this.state.visSelectFunctions;
        for (let i = 0; i < visualizations.length; i++) {
          const visValue = visualizations[i];
          const selectionType = visValue["selection_type"];
          const visType = visValue["vis_type"];
          console.log(
            `registering vis type ${visType} with selection type ${selectionType}`
          );
          if (selectionType == "single") {
            let externalSelectFunc = async (vegaView, rowIdx) => {
              if (rowIdx == -1) {
                await vegaView.signal("select_tuple", null).runAsync();
              } else {
                await vegaView
                  .signal("select_tuple", {
                    unit: "",
                    fields: [{ type: "E", field: "_vgsid_" }],
                    values: [rowIdx],
                  })
                  .runAsync();
              }
              // let _ = vegaView.getState().signals;
            };
            currVisSelectFunctions[i] = {
              type: "single",
              func: externalSelectFunc,
            };
          } else if (selectionType == "multi") {
            let externalSelectFunc = async (vegaView, rowIndexes) => {
              if (rowIndexes == -1) {
                await vegaView.signal("select_toggle", false).runAsync();
                await vegaView.signal("select_tuple", null).runAsync();
              } else {
                let selectObject = {
                  _vgsid_: [],
                  vlMulti: {
                    or: [],
                  },
                };
                let j = 0;
                for (; j < rowIndexes.length; j++) {
                  selectObject._vgsid_.push(rowIndexes[j]);
                  selectObject.vlMulti.or.push({
                    _vgsid_: rowIndexes[j],
                  });

                  if (j == 0) {
                    await vegaView.signal("select_toggle", false).runAsync();
                  } else {
                    await vegaView.signal("select_toggle", true).runAsync();
                  }
                  await vegaView
                    .signal("select_tuple", {
                      unit: "",
                      fields: [{ type: "E", field: "_vgsid_" }],
                      values: [rowIndexes[j]],
                      // values: [3],
                    })
                    .runAsync();

                  // vegaView.signal("select", selectObject).runAsync();
                }
              }
            };
            currVisSelectFunctions[i] = {
              type: "multiple",
              func: externalSelectFunc,
            };
          } else {
            console.log(
              "[loadFile] unknown selection type -> " + selectionType
            );
          }
          visSpecList.push(visValue["spec"]);
        }

        const columnTypes = JSON.parse(response.data["columnTypes"]);

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
          dataVisSpec: visSpecList,
          columnTypes,
          visSelectFunctions: currVisSelectFunctions,
          // visualEncodings: newVisualEncodings,
          // visualizationTypes: visTypes,
          // dataVisSpec: specList,
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  render() {
    return (
      <div className={this.classes.root}>
        <Grid container className={this.classes.root} spacing={1}>
          <Grid item xs={12}>
            <LeamAppBar
              onFileChange={this.onFileChange}
              onModelChange={this.onModelChange}
              fileName={this.state.fileName}
              loadFile={this.loadFile}
              datasets={this.state.datasets}
              columns={this.state.fileHeaders}
            />
          </Grid>
          <Grid item xs={12}>
            {/* <Paper className={this.classes.paper}> */}
            <DatavisView
              key="datavis-view"
              visualData={this.state.visualEncodings}
              visSpecList={this.state.dataVisSpec}
              visTypes={this.state.visualizationTypes}
              selectedColumn={this.state.selectedColumn}
              width={350}
              height={200}
              reverseIdx={this.state.reverseIndex}
              highlightRows={this.highlightRows}
              setVisView={this.setVisView}
            />
            {/* </Paper> */}
          </Grid>
          <Grid item xs={6}>
            <Box ml={1} border={1}>
              <Paper className={this.classes.paper}>
                <NotebookView
                  loadFile={this.loadFile}
                  datasetName={this.state.fileName}
                  visViews={this.state.visViews}
                  visSelectFunctions={this.state.visSelectFunctions}
                  highlightRows={this.highlightRows}
                />
              </Paper>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box ml={1} border={1}>
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
        </Grid>
      </div>
    );
  }
}

export default withStyles(useStyles)(App);
