import React, { Component } from "react";
import axios from "axios";
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Divider,
  Typography,
  Button,
  Box,
  Grid,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/theme-kuroir";
import "ace-builds/src-noconflict/mode-javascript";
import { PlayArrow } from "@material-ui/icons";

export default class NotebookView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editorValue: "",
      colorAttr: "weighted_mean_sentiment",
      pattern: "",
    };
    this.runCell = this.runCell.bind(this);
    // this.remoteRun = this.remoteRun.bind(this);
    this.onAceLoad = this.onAceLoad.bind(this);
    this.resetDataset = this.resetDataset.bind(this);
  }

  resetDataset = () => {
    let url;
    if (this.props.testing) {
      url = "http://localhost:5000/v1/reset-dataset/" + this.props.datasetName;
    } else {
      url = "v1/reset-dataset/" + this.props.datasetName;
    }
    axios
      .get(url)
      .then((response) => {
        console.log(`RESET of datset ${this.props.datasetName} worked!`);
        this.setState({ editorValue: "" });
        this.props.resetHistory();
        this.props.loadFile(this.props.datasetName);
      })
      .catch(function (error) {
        console.log(error);
      });
    // .then(function () {
    //   // always executed
    // });
  };

  onAceLoad = (_editor) => {
    _editor.renderer.setShowGutter(false);
    _editor.setShowPrintMargin(false);
    _editor.container.style.lineHeight = "30px";
    _editor.setFontSize("1rem");
    _editor.setOptions({
      minLines: 1,
      maxLines: 5,
      autoScrollEditorIntoView: true,
      cursorStyle: "wide",
      enableLiveAutocompletion: true,
    });

    var completer = {
      getCompletions: function (editor, session, pos, prefix, callback) {
        if (prefix.length === 0) {
          callback(null, []);
          return;
        }

        // a reference
        // callback(null, wordList.map(function(ea) {
        //   return {name: ea.word, value: ea.word, score: ea.score, meta: "rhyme"}
        // }));

        let suggestionList = [
          {
            name: "col",
            caption: "col",
            value: "col",
            meta: "VTA",
          },
          {
            name: "project",
            caption: "project",
            value: "project()",
            meta: "VTA",
          },
          {
            name: "lowercase",
            caption: "lowercase",
            value: "lowercase(update)",
            meta: "VTA",
          },
        ];

        // attributes.forEach((attr) => {
        //   suggestionList.push({ name: attr, value: attr, meta: "attributes" });
        // });

        callback(null, suggestionList);
      },
    };
    _editor.completers = [completer];
  };

  runCell(_editor) {
    const command = _editor.getValue();
    this.setState({ editorValue: "" });
    _editor.setValue("");
    // do something
    if (!command.startsWith(":")) {
      console.log(`COMMAND: ${command}`);
      this.props.runCommand(command);
    } else {
      // magic command?
    }
  }

  // remoteRun(e) {
  //   e.preventDefault();
  //   // run a command
  // }

  render() {
    const reverseHistory = [...this.props.history].reverse();
    const histLen = reverseHistory.length;
    return (
      <Grid container>
        {/* <Grid item xs={1}>
          <Typography variant="h7">
            <Box fontWeight="fontWeightBold">ln[{this.state.cellNum}]:</Box>
          </Typography>
        </Grid> */}
        <Box ml={2} mb={2}>
          <Button
            ml={2}
            variant="contained"
            color="secondary"
            startIcon={<DeleteIcon />}
            onClick={this.resetDataset}
          >
            Reset Dataset
          </Button>
        </Box>
        <Grid item xs={12}>
          <Box ml={-2}>
            <AceEditor
              mode="javascript"
              theme="kuroir"
              name="input-editor"
              className="ace-cli"
              editorProps={{ $blockScrolling: Infinity }}
              width="90%"
              min-height="30px"
              placeholder="Enter Command Here..."
              value={this.state.editorValue}
              commands={[
                {
                  name: "run",
                  bindKey: { mac: "Shift+Enter" },
                  exec: this.runCell,
                },
              ]}
              onLoad={this.onAceLoad}
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <List component="nav" style={{ overflow: "auto", maxHeight: 300 }}>
            {reverseHistory.map((x, i) => (
              <React.Fragment>
                {/* <Box border={1} borderColor="gray"> */}
                <ListItem button key={i} border={1}>
                  <Typography variant="h7">
                    <Box fontWeight="fontWeightBold" mr={4} ml={-1}>
                      ln[{histLen - i}]:
                    </Box>
                  </Typography>
                  <Box style={{ backgroundColor: "#E8E9E8" }}>
                    <Box pt={1} pb={1} pl={1} pr={3}>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            style={{ whiteSpace: "pre-line" }}
                          >
                            <span className="command-code">{x.command}</span>
                          </Typography>
                        }
                      />
                    </Box>
                  </Box>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Grid>
      </Grid>
    );
  }
}
