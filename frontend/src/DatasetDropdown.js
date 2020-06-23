import React, { Component } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { Row, Col, Container } from 'react-bootstrap';

class DatasetDropdown extends Component {
  constructor(props) {
    super(props);
    // this.state = {datasets: this.props.datasets};
  }

  // componentWillReceiveProps(newProps) {
  //   this.setState({datasets: newProps.datasets});
  // }

  render() {
    return (
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