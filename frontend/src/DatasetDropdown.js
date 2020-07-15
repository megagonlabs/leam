import React, { Component } from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';
import { Button, InputLabel, MenuItem, FormControl, Select, Grid } from "@material-ui/core";
import { CloudUpload } from "@material-ui/icons";

class DatasetDropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      value: "",
    };
    this.classes = this.props.classes;
    this.handleChange = this.handleChange.bind(this);
  }


  handleChange = (event) => {
    const name = event.target.value;
    this.setState({ "value": name });
    this.props.loadFile(name);
  };

  render() {
  
    return (
      <Grid container className={this.classes.root} spacing={2}>
        <Grid item xs={5}>
          <input type="file" id="selectedFile" style={{display: "none"}} onChange={this.props.onFileChange}/>
          <Button
            variant="contained"
            color="default"
            className={this.classes.button}
            startIcon={<CloudUpload />}
            onClick={() => {document.getElementById('selectedFile').click();}}>
            Upload
          </Button>
        </Grid>

        <Grid item xs={7}>
          <FormControl variant="filled" className={this.classes.formControl}>
            <InputLabel id="demo-simple-select-filled-label">Dataset Name</InputLabel>
            <Select
              labelId="demo-simple-select-filled-label"
              id="demo-simple-select-filled"
              value={this.props.fileName}
              onChange={this.handleChange}
            >
              {this.props.datasets.map((value, index) => {
                const datasetName = value["name"];
                return (
                  <MenuItem id={datasetName} value={datasetName} key={index}>{datasetName}</MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    );
  }
}

export default DatasetDropdown;