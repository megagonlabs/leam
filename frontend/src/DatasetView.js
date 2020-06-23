import React, { Component } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { Row, Col, Container } from 'react-bootstrap';


class DatasetView extends Component {
  constructor(props) {
    super(props);
    this.state = {datasets: this.props.datasets};
  }

  render() {
    return (
      <div>
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
              <Dropdown.Menu>
                {this.dropdownFiles = this.props.datasets.map((value, index) => {
                  const datasetName = value["name"];
                  return (
                    <Dropdown.Item onClick={this.props.loadFile} id={datasetName} key={index}>{datasetName}</Dropdown.Item>
                  );
                })}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Col>
        <Col md={5} sm={5} className="pr-3" id="dataview-file-upload">
          <input type="file" onChange={this.props.onFileChange} />
          {this.props.fileData()}
        </Col>
      </div>
    );
  }
}

export default DatasetView;