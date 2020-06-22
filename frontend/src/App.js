import React, { Component } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { Row, Col, Container } from 'react-bootstrap';
import axios from 'axios';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Hello World! And some other stuff!
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileName: null,
      fileType: null,
      fileData: null,
    };
    this.fileReader = new FileReader();
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
    axios.post("http://localhost:5000/v1/uploadfile", formData);
  }

  // content that is displayed after File Uploaded
  fileData  = () => {
    if (this.state.fileName) {
      return (
        <div>
          <h2>File Details: </h2>
            <p>File Name: { this.state.fileName }</p>
            <p>File Type: { this.state.fileType }</p>
        </div>
      );
    } else {
      return (
        <div>
          <h4>No File Uploaded</h4>
        </div>
      );
    }
  };

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
                  <Dropdown.Menu>
                    <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                    <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                    <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
                  </Dropdown.Menu>
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
    )
  }
}

export default App;
