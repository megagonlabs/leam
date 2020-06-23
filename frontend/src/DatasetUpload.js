import React, { Component } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { Row, Col, Container } from 'react-bootstrap';

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