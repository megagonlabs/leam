import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  AppBar,
  Button,
  Toolbar,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import AccountCircle from "@material-ui/icons/AccountCircle";
import Menu from "@material-ui/core/Menu";
import { CloudUpload } from "@material-ui/icons";
import OperatorMenu from "./OperatorMenu.js";
import axios from "axios";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  primary: {
    backgroundColor: "#272C34",
  },
  input: {
    display: "none",
    marginTop: 16,
  },
  root: {
    flexGrow: 1,
  },
  customizeToolbar: {
    minHeight: 30,
  },
  selectedCol: {
    backgroundColor: "#DADADA",
  },
  unselectedCol: {
    backgroundColor: "#FFF",
  },
  menuButton: {
    marginRight: theme.spacing(1),
  },
  menuDialog: {
    marginBottom: 0,
  },
  title: {
    flexGrow: 1,
    marginLeft: theme.spacing(4),
  },
  datasetButton: {
    marginRight: theme.spacing(1),
    minWidth: 150,
    select: {
      color: "#FFF",
    },
  },
  dsUploadButton: {
    marginRight: theme.spacing(1),
    minWidth: 80,
    select: {
      color: "#FFF",
    },
    marginBottom: -6,
  },
  uploadButton: {
    marginRight: theme.spacing(1),
    marginBottom: -8,
  },
}));

export default function LeamAppBar(props) {
  const classes = useStyles();
  const {
    onFileChange,
    onModelChange,
    fileName,
    loadFile,
    datasets,
    columns,
    cellNum,
    runCommand,
    models,
    metadata,
  } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [columnAnchorEl, setColumnAnchorEl] = React.useState(null);
  const [colSelected, setColSelected] = React.useState([]);
  const open = Boolean(anchorEl);
  const columnOpen = Boolean(columnAnchorEl);

  const runOpCommand = (opName) => {
    // console.log(`COMMAND: ${command}`);
    let cmd = "";
    if (cellNum == 0) {
      cmd += `data = VTA('${fileName}')\n`;
    }

    if (colSelected.length == 0) {
      console.log("[runOpCommand] ERROR: no column specified");
    }

    if (opName == "Lowercase") {
      cmd += `col = data.get_column('${colSelected[0]}')\n`;
      cmd += `col.project().lowercase()\n`;
    } else if (opName == "RemovePunctuation") {
      cmd += `col = data.get_column('${colSelected[0]}')\n`;
      cmd += `col.project().remove_punctuation()\n`;
    } else if (opName == "RemoveURLs") {
      cmd += `col = data.get_column('${colSelected[0]}')\n`;
      cmd += `col.project().remove_urls()\n`;
    } else if (opName == "RemoveStopwords") {
      cmd += `col = data.get_column('${colSelected[0]}')\n`;
      cmd += `col.project().remove_stopwords()\n`;
    } else if (opName == "RemoveEmoji") {
      cmd += `col = data.get_column('${colSelected[0]}')\n`;
      cmd += `col.project().remove_emoji()\n`;
    } else if (opName == "StripHTML") {
      cmd += `col = data.get_column('${colSelected[0]}')\n`;
      cmd += `col.project().strip_html()\n`;
    } else if (opName == "NumberWords") {
      cmd += `col = data.get_column('${colSelected[0]}')\n`;
      cmd += `col.mutate().num_words()\n`;
    } else if (opName == "Sentiment") {
      cmd += `col = data.get_column('${colSelected[0]}')\n`;
      cmd += `col.mutate().sentiment()\n`;
    } else if (opName == "Histogram") {
      if (colSelected.length !== 2) {
        console.log("[runOpCommand] ERROR: no 2 columns specified");
        return;
      }
      cmd += `data.visualize(["${colSelected[0]}", "${colSelected[1]}"], "histogram")\n`;
    } else if (metadata.includes(opName)) {
      console.log(`metadata includes op ${opName}`);
      cmd += `col = data.get_column('${colSelected[0]}')\n`;
      cmd += `col.visualize("barchart", md_tag="${opName}")\n`;
    } else if (models.includes(opName)) {
      console.log(`models includes op ${opName}`);
      cmd += `model = data.get_model('${opName}')\n`;
      cmd += `model.predict("${colSelected[0]}")\n`;
    }

    runCommand(cmd);
  };

  const handleColMenu = (event) => {
    setColumnAnchorEl(event.currentTarget);
  };

  const handleColClose = (event) => {
    if (event.target.id != "") {
      let newCols;
      if (colSelected.includes(event.target.id)) {
        // remove event id from col selected
        newCols = colSelected.filter((val, idx) => val !== event.target.id);
      } else {
        newCols = [...colSelected, event.target.id];
      }
      setColSelected(newCols);
    } else {
      setColumnAnchorEl(null);
    }
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event) => {
    if (event.target.id !== "") {
      loadFile(event.target.id);
    }
    setAnchorEl(null);
  };

  const listToString = (lst) => {
    let lstString = "";
    for (let i = 0; i < lst.length; i++) {
      lstString += lst[i];
      if (i != lst.length - 1) {
        lstString += ", ";
      }
    }
    return lstString;
  };

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar className={clsx(classes.primary, classes.customizeToolbar)}>
          <Typography variant="h6" className={classes.title}>
            System X
          </Typography>

          <Button
            size="small"
            variant="outlined"
            color="inherit"
            aria-haspopup="true"
            aria-controls="column-menu"
            aria-label="Select Column(s)"
            onClick={handleColMenu}
            className={classes.datasetButton}
          >
            {colSelected.length == 0
              ? "Select Column"
              : listToString(colSelected)}
          </Button>
          <Menu
            id="column-menu"
            anchorEl={columnAnchorEl}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            keepMounted
            transformOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            open={columnOpen}
            onClose={handleColClose}
            classes={classes.menuDialog}
          >
            {columns.map((value, index) => {
              const colName = value;
              return (
                <MenuItem
                  onClick={handleColClose}
                  id={colName}
                  value={colName}
                  key={index}
                  className={
                    colSelected.includes(value)
                      ? classes.selectedCol
                      : classes.unselectedCol
                  }
                >
                  {colName}
                </MenuItem>
              );
            })}
          </Menu>

          <OperatorMenu
            runOpCommand={runOpCommand}
            models={models}
            metadata={metadata}
          />

          <Button
            size="small"
            variant="outlined"
            color="inherit"
            aria-haspopup="true"
            aria-controls="menu-appbar"
            aria-label="Pick the current dataset"
            onClick={handleMenu}
            className={classes.datasetButton}
          >
            {fileName}
          </Button>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            keepMounted
            transformOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            open={open}
            onClose={handleClose}
            classes={classes.menuDialog}
          >
            {datasets.map((value, index) => {
              const datasetName = value["name"];
              return (
                <MenuItem
                  onClick={handleClose}
                  id={datasetName}
                  value={datasetName}
                  key={index}
                >
                  {datasetName}
                </MenuItem>
              );
            })}
          </Menu>
          <input
            type="file"
            accept=".csv"
            id="selectedFile"
            className={classes.input}
            onChange={onFileChange}
          />
          <label htmlFor="selectedFile">
            {/* <IconButton
              color="inherit"
              aria-label="upload file"
              component="span"
              className={classes.uploadButton}
            >
              <CloudUpload fontSize="medium" />
            </IconButton> */}
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              component="span"
              aria-controls="menu-appbar"
              aria-label="Upload Dataset"
              className={classes.dsUploadButton}
              endIcon={<CloudUpload />}
            >
              Dataset
            </Button>
          </label>
          <input
            type="file"
            accept=""
            id="selectedModel"
            className={classes.input}
            onChange={onModelChange}
          />
          <label htmlFor="selectedModel">
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              component="span"
              aria-controls="menu-appbar"
              aria-label="Upload Model"
              className={classes.dsUploadButton}
              endIcon={<CloudUpload />}
            >
              Model
            </Button>
          </label>
        </Toolbar>
      </AppBar>
    </div>
  );
}
