import React, { Component } from 'react';
import { Grid, Button, Typography, FormControl, InputLabel, MenuItem, Select, IconButton } from "@material-ui/core";
import { PlayArrow } from "@material-ui/icons";

export default class OperatorView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      operator: "",
      action: "",
      actionList: [], 
      column: "",
    };
    this.changeOperator = this.changeOperator.bind(this);
    this.changeAction = this.changeAction.bind(this);
    this.changeColumn = this.changeColumn.bind(this);
    this.applyOperator = this.applyOperator.bind(this);
    this.classes = this.props.classes;
  }

  changeOperator = (event) => {
    let actions;
    const newOperator = event.target.value;
    if (newOperator == "Clean") {
        // Clean
        actions = ["Lemmatize", "Lowercase", "Remove Stopwords"];
    } else if (newOperator == "Featurize") {
        // Featurize
        actions = ["tf-idf", "k-means"];
    } else {
        // Select
        actions = ["Filter", "Sort"];
    }
    this.setState({ operator: event.target.value, actionList: actions });
  }

  changeAction = (event) => {
    this.setState({ action: event.target.value });
  }

  changeColumn = (event) => {
    this.setState({ column: event.target.value });
  }

  applyOperator = () => {
    const colName = this.state.column;
    const actionName = this.state.action;
    const operatorName = this.state.operator;
    this.props.applyOperator(operatorName, colName, actionName);
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
                <MenuItem value={"Select"}>Select</MenuItem>
                <MenuItem value={"Featurize"}>Add Features</MenuItem>
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
                {this.state.actionList.map((action, index) => {
                    return (
                        <MenuItem value={action} key={index}>{action}</MenuItem>
                    ); 
                })}
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
            <IconButton color="inherit" aria-label="execute" onClick={this.applyOperator}>
              <PlayArrow />
            </IconButton>
          </Grid>
        </Grid>
      </div>
    );
  }

}