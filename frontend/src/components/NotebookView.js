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
  Box,
  Grid,
} from "@material-ui/core";
import { Star } from "@material-ui/icons";
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
      history: [],
      colorAttr: "weighted_mean_sentiment",
      pattern: "",
      cellNum: 0,
    };
    this.runCell = this.runCell.bind(this);
    // this.remoteRun = this.remoteRun.bind(this);
    this.onAceLoad = this.onAceLoad.bind(this);
    this.changeLineNum = this.changeLineNum.bind(this);
  }

  changeLineNum = () => {
    const currCellNum = this.state.cellNum;
    this.setState({ cellNum: currCellNum + 1 });
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
      const url = "http://localhost:5000/v1/run-operator";
      // fetch the actual rows
      axios
        .post(url, { vta_spec: command, vta_script_flag: 1 })
        .then((response) => {
          console.log(`operator response body is ${response.body}`);
        })
        .then(() => {
          this.setState({
            history: [
              ...this.state.history,
              { command: command, status: "finished" },
            ],
          });
          this.changeLineNum();
          this.props.loadFile(this.props.datasetName);
        })
        .catch(function (error) {
          console.log(error);
        });
    } else {
      // magic command?
    }
  }

  // remoteRun(e) {
  //   e.preventDefault();
  //   // run a command
  // }

  render() {
    return (
      <Grid container>
        {/* <Grid item xs={1}>
          <Typography variant="h7">
            <Box fontWeight="fontWeightBold">ln[{this.state.cellNum}]:</Box>
          </Typography>
        </Grid> */}
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
            {this.state.history.map((x, i) => (
              <React.Fragment>
                {/* <Box border={1} borderColor="gray"> */}
                <ListItem button key={i} border={1}>
                  <Typography variant="h7">
                    <Box fontWeight="fontWeightBold" mr={4} ml={-1}>
                      ln[{i}]:
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
