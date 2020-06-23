import React, { Component } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { Row, Col, Container } from 'react-bootstrap';
import axios from 'axios';
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
      datasets: {},
    };
    this.fileReader = new FileReader();
    this.getDropdownFiles = this.getDropdownFiles.bind(this);
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
    this.getFiles();
  };

  // content that is displayed after File Uploaded
  fileData  = () => {
    return (
          <div>
              <p>File Name: { this.state.fileName }</p>
              <p>Columns: { this.state.fileHeaders }</p>
              <p># Rows: { this.state.fileNumRows }</p>
          </div>
    );
  };

  getFiles = () => {
    axios.get("http://localhost:5000/v1/get-datasets")
      .then((response) => {
        let allDatasets = response.data["datasets"];
        let newDatasets = Object.assign({}, this.state.datasets);
        for (let key in allDatasets) {
          console.log(key);
          let datasetInfo = allDatasets[key];
          let datasetName = datasetInfo["name"];
          newDatasets[datasetName] = datasetInfo;
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
    const datasetInfo = this.state.datasets[fileName];
    this.setState({
      fileName: fileName,
      fileNumRows: datasetInfo["num_rows"],
      fileHeaders: datasetInfo["header"],
    });
  }

  getDropdownFiles = () => {
    let dropDownItems = [];
    for (let key in this.state.datasets) {
      const datasetInfo = this.state.datasets[key];
      const datasetName = datasetInfo["name"];
      dropDownItems.push(<Dropdown.Item onClick={this.loadFile} id={datasetName}>{datasetName}</Dropdown.Item>);
      console.log("dataset element with name: ", datasetName);
    }

    return (
      <Dropdown.Menu>
        {dropDownItems}
      </Dropdown.Menu>
    )
  }

  render() {
    return (
      <div>
        <h2>
          Data Ingestion View
        </h2>
        <Container>
        <Row className="justify-content-start" id="dataview">
            <Col md={3}  sm={4} id="dataview-dropdown">
              <div className="dropdown">
                <Dropdown>
                  <Dropdown.Toggle variant="info" id="dropdown-basic">
                    Dropdown Button
                  </Dropdown.Toggle>
                  {/* <Dropdown.Menu>
                    <Dropdown.Item onClick={this.handleChange} id="something">Action</Dropdown.Item>
                    <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                    <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
                  </Dropdown.Menu> */}
                  {this.getDropdownFiles()}
                </Dropdown>
              </div>
            </Col>
            <Col md={5} sm={5} className="pr-3" id="dataview-file-upload">
              <input type="file" onChange={this.onFileChange} />
              {this.fileData()}
            </Col>
        </Row>
        </Container>
      </div>
    );
  }
};

export default App;
