import React, { Component } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';

class DatasetDropdown extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="dropdown">
      <Dropdown size="sm">
        <Dropdown.Toggle variant="info" id="dropdown-basic" size={"md"}>
          Dropdown Button
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
    </div>
    );
  }
}

export default DatasetDropdown;