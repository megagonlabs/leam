import React, { Component } from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import { Dropdown, Button, ButtonGroup } from 'react-bootstrap';

export default class OperatorView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      operator: "Choose Operator",
      action: "Choose Action"
    };
    this.changeOperator = this.changeOperator.bind(this);
    this.changeAction = this.changeAction.bind(this);
  }

  changeOperator = (event) => {
    this.setState({ operator: event.target.id });
  }

  changeAction = (event) => {
    this.setState({ action: event.target.id });
  }

  render() {
    return (
      <div className="operator-view">
        <h2>Operator View</h2>
        <Container>
          <Row>
            <Col>
              <div class="mb-3">
                <Dropdown size="sm">
                  <Dropdown.Toggle variant="info" id="dropdown-basic" size={"md"}>
                    {this.state.operator}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={this.changeOperator} id="Clean" key="clean">Clean</Dropdown.Item>
                    <Dropdown.Item onClick={this.changeOperator} id="Filter" key="filter">Filter</Dropdown.Item>
                    <Dropdown.Item onClick={this.changeOperator} id="Add Features" key="features">Add Features</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <ButtonGroup size="md" className="mb-2">
                <Button>id</Button>
                <Button>publish_date</Button>
                <Button>headline_text</Button>
              </ButtonGroup>
            </Col>
            <Col>
            <div class="mb-3">
                <Dropdown size="sm">
                  <Dropdown.Toggle variant="info" id="dropdown-basic" size={"md"}>
                    {this.state.action}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={this.changeAction} id="Remove Stopwords" key="stopword">Remove Stopwords</Dropdown.Item>
                    <Dropdown.Item onClick={this.changeAction} id="Lemmatize" key="lemmatize">Lemmatize</Dropdown.Item>
                    <Dropdown.Item onClick={this.changeAction} id="Lowercase" key="lowercase">Lowercase</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

}