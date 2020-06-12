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
  state = {
    selectedFile: null
  };

  onFileChange = event => {
    console.log("event: ", event)
    this.setState({ selectedFile: event.target.files[0] });
  };

  onFileUpload = () => {
    const formData = new FormData();
    formData.append(
      "someFile",
      this.state.selectedFile,
      this.state.selectedFile.name
    );

    console.log(this.state.selectedFile);
    
    // TODO: implement uploadfile endpoint in Flask
    axios.post("http://localhost:5000/api/uploadfile", formData);
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
          <button onClick={this.onFileUpload}>
            Upload File!
          </button>
        </div>
        {this.fileData()}
      </div>
    )
  }
}

export default App;
