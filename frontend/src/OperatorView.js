import React, { Component } from "react";
import { useTheme } from "@material-ui/core/styles";
import {
  Grid,
  Button,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  IconButton,
  Chip,
  Input,
} from "@material-ui/core";
import { PlayArrow } from "@material-ui/icons";

export default class OperatorView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      operatorCategory: "",
      operatorType: "",
      operatorList: [],
      columns: [],
      selectedIndex: [],
    };
    this.changeOperatorCategory = this.changeOperatorCategory.bind(this);
    this.changeOperatorType = this.changeOperatorType.bind(this);
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
          : "fontWeightBold",
    };
  };

  changeOperatorCategory = (event) => {
    let operatorTypes;
    const newOperator = event.target.value;
    if (newOperator == "Clean") {
      // Clean
      operatorTypes = [
        "Lemmatize",
        "Lowercase",
        "Remove Stopwords",
        "Remove Punctuation",
      ];
    } else if (newOperator == "Featurize") {
      // Featurize
      operatorTypes = ["TF-IDF", "K-Means", "PCA", "Sentiment"];
    } else {
      // Select
      operatorTypes = ["Visualization", "Projection", "Coordination"];
    }
    this.setState({
      operatorCategory: event.target.value,
      operatorList: operatorTypes,
    });
  };

  changeOperatorType = (event) => {
    this.setState({ operatorType: event.target.value });
  };

  changeColumns = (event) => {
    // this.setState({ column: event.target.value });
    console.log(
      `[operator-view] changing columns to have value -> ${event.target.value}`
    );
    let newColumns = Object.assign([], event.target.value);
    newColumns = newColumns.filter((col) => this.props.columns.includes(col));
    this.setState({ columns: newColumns });
  };

  changeIndices = (event) => {
    let newIndices = Object.assign([], event.target.value);
    this.setState({ selectedIndex: newIndices });
  };

  applyOperator = () => {
    const colNames = this.state.columns;
    const operator = this.state.operatorType;
    const operatorCategory = this.state.operatorCategory;
    const selectedIndices = this.state.selectedIndex;
    this.props.applyOperator(
      operatorCategory,
      colNames,
      operator,
      selectedIndices
    );
  };

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
        <Grid container className={this.classes.buttonsCells} spacing={2}>
          {/* <Grid item xs={12}>
            <Typography variant="h5" color="inherit">
              Query Builder
            </Typography>
          </Grid> */}
          <Grid item xs={5}>
            <FormControl variant="filled" className={this.classes.formControl}>
              <InputLabel id="select-operator">Operator</InputLabel>
              <Select
                labelId="select-operator"
                id="select-operator"
                value={this.state.operatorCategory}
                onChange={this.changeOperatorCategory}
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
                value={this.state.operatorType}
                onChange={this.changeOperatorType}
              >
                {this.state.operatorList.map((action, index) => {
                  return (
                    <MenuItem value={action} key={index}>
                      {action}
                    </MenuItem>
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
                  <MenuItem
                    key={name}
                    value={name}
                    style={this.getStyles(name, this.state.columns)}
                  >
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
                      <Chip
                        key={value}
                        label={value}
                        className={this.classes.chip}
                      />
                    ))}
                  </div>
                )}
                MenuProps={MenuProps}
              >
                {indices.map((idx) => (
                  <MenuItem
                    key={idx}
                    value={idx}
                    style={this.getStyles(idx, this.state.selectedIndex)}
                  >
                    {idx}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={2}>
            <IconButton
              color="inherit"
              aria-label="execute"
              onClick={this.applyOperator}
            >
              <PlayArrow />
            </IconButton>
          </Grid>
        </Grid>
      </div>
    );
  }
}
