import React, { Component } from 'react';

class DatasetUpload extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <input type="file" onChange={this.props.onFileChange} />
        {this.props.fileData()}
      </div>
    );
  }
}

export default DatasetUpload;