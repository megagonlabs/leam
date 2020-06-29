import React, { Component } from 'react';
import { Grid, Button, Typography, FormControl, InputLabel, MenuItem, Select, IconButton } from "@material-ui/core";
import { PlayArrow } from "@material-ui/icons";

export default class OperatorView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      operator: "Choose Operator",
      action: "Choose Action",
      column: "Choose Column",
    };
    this.changeOperator = this.changeOperator.bind(this);
    this.changeAction = this.changeAction.bind(this);
    this.changeColumn = this.changeColumn.bind(this);
    this.classes = this.props.classes;
  }

  changeOperator = (event) => {
    this.setState({ operator: event.target.value });
  }

  changeAction = (event) => {
    this.setState({ action: event.target.value });
  }

  changeColumn = (event) => {
    this.setState({ column: event.target.value });
  }

  render() {
    return (
      <div className="operator-view">
        <Grid container className={this.classes.root} spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5" color="inherit">
              Query Builder
            </Typography>
          </Grid>
          <Grid item xs={5}>
            <FormControl variant="filled" className={this.classes.formControl}>
              <InputLabel id="select-operator">Operator</InputLabel>
              <Select
                labelId="select-operator"
                id="select-operator"
                value={this.state.operator}
                onChange={this.changeOperator}
              >
                <MenuItem value={"Clean"}>Clean</MenuItem>
                <MenuItem value={"Filter"}>Filter</MenuItem>
                <MenuItem value={"Add Features"}>Add Features</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={5}>
            <FormControl variant="filled" className={this.classes.formControl}>
              <InputLabel id="select-action">Action</InputLabel>
              <Select
                labelId="select-action"
                id="select-action"
                value={this.state.action}
                onChange={this.changeAction}
              >
                <MenuItem value={"Lemmatize"}>Lemmatize</MenuItem>
                <MenuItem value={"Lowercase"}>Lowercase</MenuItem>
                <MenuItem value={"Remove Stopwords"}>Remove Stopwords</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={2} />
          {/* Second row: column select dropdown + execute query button */}
          <Grid item xs={5}>
            <FormControl variant="filled" className={this.classes.formControl}>
              <InputLabel id="select-action">Column</InputLabel>
              <Select
                labelId="select-column"
                id="select-column"
                value={this.state.column}
                onChange={this.changeColumn}
              >
                {/* <MenuItem value={"Lemmatize"}>Lemmatize</MenuItem> */}
                {this.props.columns.map((value, _) => {
                  return (
                    <MenuItem value={value}>{value}</MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={5}>
            <IconButton color="inherit" aria-label="execute">
              <PlayArrow />
            </IconButton>
          </Grid>
        </Grid>
      </div>
    );
  }

}