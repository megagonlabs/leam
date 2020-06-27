import React, { Component } from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';

class DatasetDropdown extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="dropdown">
      <Container>
        <Row>
          <Col>
          <div className="file-upload">
            <input type="file" id="selectedFile" style={{display: "none"}} onChange={this.props.onFileChange}/>
            <input type="button" value="Upload Dataset" onClick={() => {document.getElementById('selectedFile').click();}} />
          </div>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <Dropdown size="sm">
              <Dropdown.Toggle variant="info" id="dropdown-basic" size={"md"}>
                Choose Dataset
              </Dropdown.Toggle>
              {/* <Dropdown.Menu>
                <Dropdown.Item onClick={this.handleChange} id="something">Action</Dropdown.Item>
                <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
              </Dropdown.Menu> */}
              <Dropdown.Menu>
                {this.props.datasets.map((value, index) => {
                  const datasetName = value["name"];
                  return (
                    <Dropdown.Item onClick={this.props.loadFile} id={datasetName} key={index}>{datasetName}</Dropdown.Item>
                  );
                })}
              </Dropdown.Menu>
            </Dropdown>
          </Col>
          <Col>
              <h6>{this.props.fileName}</h6>
          </Col>
        </Row>
      </Container>
    </div>
    );
  }
}

export default DatasetDropdown;