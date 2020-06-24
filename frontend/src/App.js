import React, { Component } from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import axios from 'axios';
import DatasetDropdown from './DatasetDropdown.js';
import DatasetUpload from './DatasetUpload.js';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileName: null,
      fileType: null,
      fileData: null,
      fileNumRows: null,
      fileHeaders: [],
      datasets: [],
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
    this.setState({ fileData: this.fileReader.result });
    const formData = new FormData();
    formData.append('filename', this.state.fileName);
    formData.append('filetype', this.state.fileType);
    formData.append('filedata', this.state.fileData);
    console.log("uploading filename: ", this.state.fileName);
    console.log("uploading filetype: ", this.state.fileType);
    console.log("uploading file contents: ", this.state.fileData);
    
    // TODO: implement uploadfile endpoint in Flask
    axios.post("http://localhost:5000/v1/upload-file", formData);
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
    });
    this.getFiles();
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
          <h2>
            TEX (Text EXplorer)
          </h2>
        </Row>
        <Row className="justify-content-start" id="dataview">
          <Col md={3}  sm={6} id="dataview-dropdown">
            <DatasetDropdown key="dataset-dropdown" datasets={this.state.datasets} loadFile={this.loadFile} />
          </Col>
          <Col md={4} sm={6} className="pr-3" id="dataview-file-upload">
            <DatasetUpload key="dataset-upload" onFileChange={this.onFileChange} fileData={this.fileData} />
          </Col>
          <Col md={5} sm={6} id="operator-view">
            <div></div>
          </Col>
        </Row>
        </Container>
      </div>
    );
  }
};

export default App;
