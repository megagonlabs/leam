import React, { Component } from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import { withStyles } from '@material-ui/core/styles';
import { Grid, Paper, AppBar, Toolbar, IconButton, Typography } from "@material-ui/core";
import { Menu } from "@material-ui/icons";
import axios from 'axios';
import classNames from "classnames";
import DatasetDropdown from './DatasetDropdown.js';
import OperatorView from './OperatorView.js';
import TableView from './GridExample.js';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'fontsource-roboto';
import stopwords from "./stopwords.json";

const useStyles = (theme) => ({
  root: {
    flexGrow: 1,
    height: '200px',
  },
  paper: {
    // marginTop: theme.spacing(1),
    padding: theme.spacing(2),
    textAlign: 'start',
    color: theme.palette.text.secondary,
  },
  button: {
    display: 'block',
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
      numColumns: 5,
      columnSizes: [],
    };
    this.fileReader = new FileReader();
    // this.getDropdownFiles = this.getDropdownFiles.bind(this);
    this.loadFile = this.loadFile.bind(this);
    this.getFiles = this.getFiles.bind(this);
    this.applyOperator = this.applyOperator.bind(this);
    // this.removeStopWords = this.removeStopWords.bind(this);
    this.classes = this.props.classes;
  }

//   removeStopWords = (text) => {
//     let filteredWords = [];
//     const words = text.split(" ");
//     for (let key in words) {
//       const word = words[key].split(".").join(""); // in case this is the last word in a sentence
//       if (!stopwords.includes(word)) {
//         filteredWords.push(word);
//       }
//     }
//     return filteredWords.join(' ')
//   }

  applyOperator = (operatorName, columnName, actionName) => {
    console.log(`doing operator: ${operatorName} column -> ${columnName} with action -> ${actionName}`);
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
        case "tf-idf":
            action = "tfidf";
            break;
        default:
            // default is lowercase action
            action = "lowercase";
    }

    const url = "http://localhost:5000/v1/run-operator";
    // fetch the actual rows
    axios.post(url, null, {
        params: {
            operator: operator,
            action: action,
            dataset: datasetName,
            column: columnName, 
        }
    })
      .then((response) => {
        console.log(`operator response body is ${response.body}`);
      })
      .then(() => {
        this.loadFile(datasetName);
      })
      .catch(function (error) {
        console.log(error);
      })

  }


  onFileChange = event => {
    // console.log("event: ", event)
    var file = event.target.files[0]
    this.fileReader.onloadend = this.handleFileRead;
    this.fileReader.readAsText(file);
    this.setState({ fileName: file.name, fileType: file.type });
  };

  handleFileRead = () => {
    const fileData = this.fileReader.result;
    const formData = new FormData();
    formData.append('filename', this.state.fileName);
    formData.append('filetype', this.state.fileType);
    formData.append('filedata', fileData);
    // console.log("uploading filename: ", this.state.fileName);
    // console.log("uploading filetype: ", this.state.fileType);
    // console.log("uploading file contents: ", this.state.fileData);
    
    // TODO: implement uploadfile endpoint in Flask
    axios.post("http://localhost:5000/v1/upload-file", formData)
      .then(() => {
        this.getFiles();
      })
  };

  // content that is displayed after File Uploaded
  fileData  = () => {
    // let columns = "[";
    var columns = Object.assign([], this.state.fileHeaders);
    // if (columns.length > 6) {
    //   columns = columns.slice(0, 6);
    //   columns.push("...");
    // }
    return (
          <div>
              <p>File Name: { this.state.fileName }</p>
              <p id="columns-list" style={{overflow: 'wrap'}}>Columns: { JSON.stringify(columns) }</p>
              <p># Rows: { this.state.fileNumRows }</p>
          </div>
    );
  };

  getFiles = () => {
    axios.get("http://localhost:5000/v1/get-datasets")
      .then((response) => {
        let allDatasets = response.data["datasets"];
        // let newDatasets = Object.assign({}, this.state.datasets);
        let newDatasets = [];
        for (let key in allDatasets) {
          let datasetInfo = allDatasets[key];
          newDatasets.push(datasetInfo);
        }
        this.setState({ "datasets": newDatasets });
      })
      .catch(function (error) {
        console.log(error);
      })
      // .then(function () {
      //   // always executed
      // }); 
  }

  componentDidMount() {
    this.getFiles();
  }

  loadFile = (name) => {
    const fileName = name;
    let fileRows = 0;
    let fileHeader = [];
    for (let i = 0; i < this.state.datasets.length; i++) {
      let datasetInfo = this.state.datasets[i];
      if (datasetInfo["name"] === fileName) {
        fileRows = datasetInfo["num_rows"];
        fileHeader = datasetInfo["header"];
      }
    }
    this.setState({
      fileName: fileName,
      fileNumRows: fileRows,
      fileHeaders: fileHeader,
      numColumns: fileHeader.length + 1,
    });

    const url = "http://localhost:5000/v1/get-datasets/" + fileName;
    // fetch the actual rows
    axios.get(url, {
      headers: {
        numrows: 500
      }
    })
      .then((response) => {
        let rows = []; 
        let idRow = [];
        let chartRow = [];
        chartRow.push("");
        const columns = JSON.parse(response.data["columns"]);
        this.setState({ fileHeaders: columns });
        for (let key in columns) {
          chartRow.push("");
        }
        rows.push(chartRow);
        rows.push(...JSON.parse(response.data["rows"]));

        // determining correct widths of the columns
        let columnWidths = new Array(this.state.fileHeaders.length).fill(0);
        columnWidths[0] = 100; // fixed size column
        // determine column widths by taking average of lengths over first 20 rows
        for (let i = 0; i < 20; i++) {
          const rowData = rows[i];
          for (let j = 0; j < this.state.fileHeaders.length; j++) {
            const colLength = rowData[j].length;
            columnWidths[j+1] += colLength;
          }
        }
        columnWidths = columnWidths.map((val) => { return val / 20; });
        this.setState({ "datasetRows": rows, "columnSizes": columnWidths });
      })
      .catch(function (error) {
        console.log(error);
      })
  }

  // getDropdownFiles = () => {
  //   let dropDownItems = [];
  //   for (let key in this.state.datasets) {
  //     const datasetInfo = this.state.datasets[key];
  //     const datasetName = datasetInfo["name"];
  //     dropDownItems.push(<Dropdown.Item onClick={this.loadFile} id={datasetName}>{datasetName}</Dropdown.Item>);
  //     console.log("dataset element with name: ", datasetName);
  //   }

  //   return (
  //     <Dropdown.Menu>
  //       {dropDownItems}
  //     </Dropdown.Menu>
  //   )
  // }

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
              <DatasetDropdown key="dataset-dropdown" datasets={this.state.datasets} 
              onFileChange={this.onFileChange} fileName={this.state.fileName} 
              loadFile={this.loadFile} getFiles={this.getFiles} classes={this.classes} />
            </Paper>
          </Grid>
          <Grid item xs={7}>
            <Paper className={this.classes.paper}>
              <OperatorView key="operator-view" classes={this.classes} columns={this.state.fileHeaders} applyOperator={this.applyOperator}/>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper className={this.classes.paper}>
              <TableView key="table-view" datasetRows={this.state.datasetRows} datasetHeader={this.state.fileHeaders} numCols={this.state.numColumns} colSizes={this.state.columnSizes} />
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
};

export default withStyles(useStyles)(App);

