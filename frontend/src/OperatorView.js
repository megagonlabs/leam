import React, { Component } from 'react';
import { useTheme } from '@material-ui/core/styles';
import { Grid, Button, Typography, FormControl, InputLabel, MenuItem, Select, IconButton, Chip, Input } from "@material-ui/core";
import { PlayArrow } from "@material-ui/icons";

export default class OperatorView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      operator: "",
      action: "",
      actionList: [], 
      columns: [],
      selectedIndex: [],
    };
    this.changeOperator = this.changeOperator.bind(this);
    this.changeAction = this.changeAction.bind(this);
    this.changeColumns = this.changeColumns.bind(this);
    this.applyOperator = this.applyOperator.bind(this);
    this.changeIndices = this.changeIndices.bind(this);
    this.classes = this.props.classes;
    this.getStyles = this.getStyles.bind(this);
  }

  getStyles = (name, personName) => {
    return {
      fontWeight:
        personName.indexOf(name) === -1
          ? "fontWeightRegular"
          : "fontWeightBold"
    };
  }
  

  changeOperator = (event) => {
    let actions;
    const newOperator = event.target.value;
    if (newOperator == "Clean") {
        // Clean
        actions = ["Lemmatize", "Lowercase", "Remove Stopwords", "Remove Punctuation"];
    } else if (newOperator == "Featurize") {
        // Featurize
        actions = ["tf-idf", "k-means", "pca"];
    } else {
        // Select
        actions = ["Visualization", "Projection"];
    }
    this.setState({ operator: event.target.value, actionList: actions });
  }

  changeAction = (event) => {
    this.setState({ action: event.target.value });
  }

  changeColumns = (event) => {
    // this.setState({ column: event.target.value });
    let newColumns = Object.assign([], event.target.value);
    this.setState({ columns: newColumns });
  }

  changeIndices = (event) => {
    let newIndices = Object.assign([], event.target.value);
    this.setState({ selectedIndex: newIndices });
  }

  applyOperator = () => {
    const colNames = this.state.columns;
    const actionName = this.state.action;
    const operatorName = this.state.operator;
    const selectedIndices = this.state.selectedIndex;
    this.props.applyOperator(operatorName, colNames, actionName, selectedIndices);
  }

  render() {
    // const theme = useTheme();
    let indices = [];
    for (let i = 0; i < 21; i++) {
        indices.push(i);
    }

    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
        PaperProps: {
          style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
          },
        },
      };

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
            {/* <FormControl variant="filled" className={this.classes.formControl}>
              <InputLabel id="select-action">Column</InputLabel>
              <Select
                labelId="select-column"
                id="select-column"
                value={this.state.column}
                onChange={this.changeColumn}
              >
                {this.props.columns.map((value, idx) => {
                  return (
                    <MenuItem value={value} key={idx}>{value}</MenuItem>
                  );
                })}
              </Select>
            </FormControl> */}
            <FormControl className={this.classes.formControl}>
                <InputLabel id="demo-mutiple-name-label">Columns</InputLabel>
                <Select
                labelId="demo-mutiple-name-label"
                id="demo-mutiple-name"
                multiple
                value={this.state.columns}
                onChange={this.changeColumns}
                input={<Input />}
                MenuProps={MenuProps}
                >
                {this.props.columns.map((name) => (
                    <MenuItem key={name} value={name} style={this.getStyles(name, this.state.columns)}>
                    {name}
                    </MenuItem>
                ))}
                </Select>
            </FormControl>

          </Grid>
          <Grid item xs={5}>
            <FormControl className={this.classes.formControl}>
                <InputLabel id="mutiple-chip-label">Indices</InputLabel>
                <Select
                labelId="mutiple-chip-label"
                id="demo-mutiple-chip"
                multiple
                value={this.state.selectedIndex}
                onChange={this.changeIndices}
                input={<Input id="select-multiple-chip" />}
                renderValue={(selected) => (
                    <div className={this.classes.chips}>
                    {selected.map((value) => (
                        <Chip key={value} label={value} className={this.classes.chip} />
                    ))}
                    </div>
                )}
                MenuProps={MenuProps}
                >
                {indices.map((idx) => (
                    <MenuItem key={idx} value={idx} style={this.getStyles(idx, this.state.selectedIndex)}>
                    {idx}
                    </MenuItem>
                ))}
                </Select>
             </FormControl>
          </Grid>

          <Grid item xs={2}>
            <IconButton color="inherit" aria-label="execute" onClick={this.applyOperator}>
              <PlayArrow />
            </IconButton>
          </Grid>
        </Grid>
      </div>
    );
  }

}