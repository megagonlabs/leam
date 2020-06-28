import React, { Component } from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import axios from 'axios';
import DatasetDropdown from './DatasetDropdown.js';
import OperatorView from './OperatorView.js';
import TableView from './GridExample.js';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

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
    };
    this.fileReader = new FileReader();
    // this.getDropdownFiles = this.getDropdownFiles.bind(this);
    this.loadFile = this.loadFile.bind(this);
    this.getFiles = this.getFiles.bind(this);
  }

  onFileChange = event => {
    console.log("event: ", event)
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
    console.log("uploading filename: ", this.state.fileName);
    console.log("uploading filetype: ", this.state.fileType);
    console.log("uploading file contents: ", this.state.fileData);
    
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

  loadFile = (event) => {
    const fileName = event.target.id;
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
        numrows: 1000
      }
    })
      .then((response) => {
        let rows = [];
        let idRow = {};
        idRow["id"] = "id";
        for (let key in this.state.fileHeaders) {
          idRow[this.state.fileHeaders[key]] = this.state.fileHeaders[key];
        }
        rows.push(idRow);
        rows.push(...JSON.parse(response.data["rows"]));
        this.setState({ "datasetRows": rows });
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
      <div>
        <Container>
        <Row>
          <h1>
            Text Explorer
          </h1>
        </Row>
        <Row className="justify-content-start">
          <Col md={5}  sm={6} id="dataview-dropdown">
            <DatasetDropdown key="dataset-dropdown" datasets={this.state.datasets} onFileChange={this.onFileChange} fileName={this.state.fileName} loadFile={this.loadFile} getFiles={this.getFiles} />
          </Col>
          {/* <Col md={4} sm={6} className="pr-3" id="dataview-file-upload">
            <DatasetUpload key="dataset-upload" onFileChange={this.onFileChange} fileData={this.fileData} />
          </Col> */}
          <Col md={7} sm={6} id="operator-view">
            <OperatorView key="operator-view" />
          </Col>
        </Row>
        <Row className="justify-content-start">
          <Col md={3} sm={7} id="dataviz-view">
            <h2>Data-Viz View</h2>
          </Col>
          <Col md={7} sm={11} id="table-view">
            <h2>Table View</h2><br />
            <TableView key="table-view" datasetRows={this.state.datasetRows} datasetHeader={this.state.fileHeaders} numCols={this.state.numColumns} />
          </Col>
        </Row>
        </Container>
      </div>
    );
  }
};

export default App;
