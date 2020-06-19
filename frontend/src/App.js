import React, { Component } from 'react';
import axios from 'axios';
import logo from './logo.svg';
import './App.css';

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
    if (this.state.selectedFile) {
      return (
        <div>
          <h2>File Details: </h2>
            <p>File Name: { this.state.selectedFile.name }</p>
            <p>File Type: { this.state.selectedFile.type }</p>
            <p>
              Last Modified: {" "}
              { this.state.selectedFile.lastModified }
            </p>
        </div>
      );
    } else {
      return (
        <div>
          <br />
          <h4>Choose Before Pressing the Upload Button</h4>
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
        <div>
          <input type="file" onChange={this.onFileChange} />
          {/* <button onClick={this.onFileUpload}>
            Upload File!
          </button> */}
        </div>
        {this.fileData()}
      </div>
    )
  }
}

export default App;
