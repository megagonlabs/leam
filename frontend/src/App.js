import React, { Component, useCallback } from "react";
import { withStyles } from "@material-ui/core/styles";
import {
  Grid,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Drawer,
} from "@material-ui/core";
import { Menu } from "@material-ui/icons";
import axios from "axios";
import classNames from "classnames";
import DatasetDropdown from "./DatasetDropdown.js";
import BarChart from "./BarChart";
import OperatorView from "./OperatorView.js";
import DatavisView from "./DatavisView.js";
import TableView from "./GridExample.js";
import LeamAppBar from "./components/LeamAppBar.js";
import NotebookView from "./components/NotebookView.js";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "fontsource-roboto";
import stopwords from "./stopwords.json";
import generateVTASpec from "./vta/VtaGenerator.js";
import Draggable from "react-draggable";

const useStyles = (theme) => ({
  root: {
    flexGrow: 1,
    height: "200px",
  },
  buttonsCells: {
    flexGrow: 1,
    height: "150px",
  },
  paper: {
    // marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    textAlign: "start",
    color: theme.palette.text.secondary,
  },
  button: {
    display: "block",
  },
  formControl: {
    minWidth: 150,
  },
  grid: {
    margin: theme.spacing(2),
    flexGrow: 1,
  },
  largeIcon: {
    width: 80,
    height: 80,
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: 2,
  },
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileName: "No Dataset Selected",
      fileType: null,
      fileData: null,
      fileNumRows: null,
      fileHeaders: [],
      datasets: [],
      datasetRows: [],
      visualEncodings: {},
      visualizationTypes: {},
      columnTypes: {},
      columnSizes: [],
      selectedColumn: null,
      dataVisSpec: [],
      reverseIndex: {},
      highlightedRows: [],
      filtering: false,
    };
    this.fileReader = new FileReader();
    // this.getDropdownFiles = this.getDropdownFiles.bind(this);
    this.loadFile = this.loadFile.bind(this);
    this.getFiles = this.getFiles.bind(this);
    this.applyOperator = this.applyOperator.bind(this);
    this.selectColumn = this.selectColumn.bind(this);
    this.classes = this.props.classes;
    this.highlightRows = this.highlightRows.bind(this);
  }

  highlightRows = (rows, isMouseover) => {
    const normalizedRows = rows.map((val, _) => val + 1);
    this.setState({ highlightedRows: normalizedRows });
    if (isMouseover == false) {
      this.setState({ filtering: true });
    } else {
      this.setState({ filtering: false });
    }
    //   if (isMouseover === false && this.state.datasetRows.length > 0) {
    //       // filter highlighted rows to top
    //       const actualRows = this.state.datasetRows.filter((r, _) => ((rows.includes(r[0]+1) == false) && (r[0] > 1)));
    //       let newDatasetRows = [this.state.datasetRows[0]];
    //       for (let key in actualRows) {
    //           const r = actualRows[key];
    //           newDatasetRows.push(r);
    //       }
    //       let remainingRows = this.state.datasetRows.filter((r, _) => ((rows.includes(r[0]+1) == false) && (r[0] > 1)));
    //       newDatasetRows = [...newDatasetRows, ...remainingRows];
    //       this.setState({datasetRows: newDatasetRows});
    //   }
  };

  applyOperator = (
    operatorCategory,
    columnNames,
    operator,
    selectedIndices
  ) => {
    console.log(
      `doing operator type: ${operatorCategory} columns -> ${columnNames} with operator -> ${operator} with indices -> ${selectedIndices}`
    );
    const datasetName = this.state.fileName;
    let opCategory;
    switch (operatorCategory) {
      case "Clean":
        opCategory = "clean";
        break;
      case "Featurize":
        opCategory = "featurize";
        break;
      case "Select":
        opCategory = "select";
        break;
      default:
        opCategory = "clean";
    }
    let op;
    let action;
    switch (operator) {
      case "Lowercase":
        op = "lowercase";
        action = "update";
        break;
      case "Remove Stopwords":
        op = "stopword";
        action = "update";
        break;
      case "Stemming":
        op = "stemming";
        action = "update";
        break;
      case "Remove Punctuation":
        op = "punctuation";
        action = "update";
        break;
      case "TF-IDF":
        op = "tfidf";
        action = "create";
        break;
      case "K-Means":
        op = "kmeans";
        action = "create";
        break;
      case "PCA":
        op = "pca";
        action = "create";
        break;
      case "Sentiment":
        op = "sentiment";
        action = "create";
        break;
      case "Projection":
        op = "projection";
        action = "create";
        break;
      case "Visualization":
        op = "visualization";
        action = "create";
        const visName = `<${columnNames.join("_")}>`;
        this.setState({ selectedColumn: visName });
        break;
      default:
        // default is lowercase action
        op = operator.toLowerCase();
        action = "create";
    }

    const vtaSpec = generateVTASpec(
      opCategory,
      op,
      action,
      columnNames,
      datasetName
    );

    console.log(vtaSpec);

    const url = "http://localhost:5000/v1/run-operator";
    // fetch the actual rows
    axios
      .post(url, { vta_spec: vtaSpec, vta_script_flag: 0 })
      .then((response) => {
        console.log(`operator response body is ${response.body}`);
      })
      .then(() => {
        this.loadFile(datasetName);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  selectColumn = (colName) => {
    this.setState({ selectedColumn: colName });
  };

  onFileChange = (event) => {
    // console.log("event: ", event)
    var file = event.target.files[0];
    this.fileReader.onloadend = this.handleFileRead;
    this.fileReader.readAsText(file);
    this.setState({ fileName: file.name, fileType: file.type });
    console.log(
      `in ONFILECHANGE, name is ${this.state.fileName} locally is ${file.name}`
    );
    this.loadFile(file.name);
  };

  handleFileRead = () => {
    const fileData = this.fileReader.result;
    const formData = new FormData();
    formData.append("filename", this.state.fileName);
    formData.append("filetype", this.state.fileType);
    formData.append("filedata", fileData);
    console.log("filedata: ");
    console.log(fileData);
    // console.log("uploading filename: ", this.state.fileName);
    // console.log("uploading filetype: ", this.state.fileType);
    // console.log("uploading file contents: ", this.state.fileData);

    // TODO: implement uploadfile endpoint in Flask
    axios
      .post("http://localhost:5000/v1/upload-file", formData)
      .then(() => {
        this.getFiles();
      })
      .then(() => {
        console.log(`loading file ${this.state.fileName}`);
        this.loadFile(this.state.fileName);
      });
  };

  // content that is displayed after File Uploaded
  fileData = () => {
    // let columns = "[";
    var columns = Object.assign([], this.state.fileHeaders);
    // if (columns.length > 6) {
    //   columns = columns.slice(0, 6);
    //   columns.push("...");
    // }
    return (
      <div>
        <p>File Name: {this.state.fileName}</p>
        <p id="columns-list" style={{ overflow: "wrap" }}>
          Columns: {JSON.stringify(columns)}
        </p>
        <p># Rows: {this.state.fileNumRows}</p>
      </div>
    );
  };

  getFiles = () => {
    axios
      .get("http://localhost:5000/v1/get-datasets")
      .then((response) => {
        let allDatasets = response.data["datasets"];
        // let newDatasets = Object.assign({}, this.state.datasets);
        let newDatasets = [];
        for (let key in allDatasets) {
          let datasetInfo = allDatasets[key];
          newDatasets.push(datasetInfo);
        }
        this.setState({ datasets: newDatasets });
      })
      .catch(function (error) {
        console.log(error);
      });
    // .then(function () {
    //   // always executed
    // });
  };

  componentDidMount() {
    this.getFiles();
  }

  loadFile = (name) => {
    const fileName = name;
    let fileRows = 0;
    for (let i = 0; i < this.state.datasets.length; i++) {
      let datasetInfo = this.state.datasets[i];
      if (datasetInfo["name"] === fileName) {
        fileRows = datasetInfo["num_rows"];
      }
    }
    this.setState({
      fileName: fileName,
      fileNumRows: fileRows,
    });

    const url = "http://localhost:5000/v1/get-datasets/" + fileName;
    // fetch the actual rows
    axios
      .get(url, {
        headers: {
          numrows: 500,
        },
      })
      .then((response) => {
        let rows = [];
        let idRow = [];
        let chartRow = [];
        chartRow.push("");
        const columns = JSON.parse(response.data["columns"]);
        let visSpecList = [];
        const visualizations = JSON.parse(response.data["visualizations"]);
        for (let i = 0; i < visualizations.length; i++) {
          const visValue = visualizations[i];
          visSpecList.push(visValue["spec"]);
        }

        let scatterplotSentimentSpec = {
          $schema: "https://vega.github.io/schema/vega-lite/v4.json",
          data: {
            values: [
              {
                topword: "bad",
                score: 0.8083389526839617,
                order: 1,
                pca_0: 0.4859851953361739,
                pca_1: -0.006163036341382914,
                "review-sentiment": 0.6361,
                "review-tfidf-kmeans": 0,
              },
              {
                topword: "biggy",
                score: 0.8083389526839617,
                order: 2,
                pca_0: -0.0670580877712037,
                pca_1: -0.14886539938730592,
                "review-sentiment": 0.7717,
                "review-tfidf-kmeans": 4,
              },
              {
                topword: "new",
                score: 0.7144621463584777,
                order: 3,
                pca_0: 0.02508318959131608,
                pca_1: -0.22139951668209723,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 4,
              },
              {
                topword: "recommendation",
                score: 0.6152190492710732,
                order: 4,
                pca_0: -0.18416791956180958,
                pca_1: -0.31812797752320865,
                "review-sentiment": 0.4754,
                "review-tfidf-kmeans": 2,
              },
              {
                topword: "strong",
                score: 0.6152190492710732,
                order: 5,
                pca_0: -0.21852029056277203,
                pca_1: -0.19247504181943675,
                "review-sentiment": 0.2732,
                "review-tfidf-kmeans": 5,
              },
              {
                topword: "comfy",
                score: 0.5994684609546195,
                order: 6,
                pca_0: 0.5699324075802275,
                pca_1: 0.02149439208932411,
                "review-sentiment": 0.5994,
                "review-tfidf-kmeans": 2,
              },
              {
                topword: "2",
                score: 0.5979357573130499,
                order: 7,
                pca_0: -0.1419570552749732,
                pca_1: -0.1451424495009587,
                "review-sentiment": 0.5574,
                "review-tfidf-kmeans": 5,
              },
              {
                topword: "an",
                score: 0.5959208242972732,
                order: 8,
                pca_0: -0.04318064303581845,
                pca_1: -0.19773604887008753,
                "review-sentiment": 0.2732,
                "review-tfidf-kmeans": 5,
              },
              {
                topword: "check",
                score: 0.5773863810356084,
                order: 9,
                pca_0: 0.0269294788107433,
                pca_1: -0.0847818668187394,
                "review-sentiment": 0.5574,
                "review-tfidf-kmeans": 1,
              },
              {
                topword: "lighting",
                score: 0.5662307137701766,
                order: 10,
                pca_0: 0.07163787959956781,
                pca_1: -0.21953043433952238,
                "review-sentiment": 0.7397,
                "review-tfidf-kmeans": 5,
              },
              {
                topword: "decor",
                score: 0.5662307137701766,
                order: 11,
                pca_0: -0.16880485197970774,
                pca_1: -0.2247322676573062,
                "review-sentiment": 0.2732,
                "review-tfidf-kmeans": 5,
              },
              {
                topword: "stylish",
                score: 0.5662307137701766,
                order: 12,
                pca_0: 0.5423679161976489,
                pca_1: 0.04814509595221332,
                "review-sentiment": 0.5994,
                "review-tfidf-kmeans": 2,
              },
              {
                topword: "regret",
                score: 0.5429497078047782,
                order: 13,
                pca_0: -0.04426526964232842,
                pca_1: 0.18511226526478175,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 0,
              },
              {
                topword: "wo",
                score: 0.5429497078047782,
                order: 14,
                pca_0: -0.1834166909171092,
                pca_1: -0.121338626483554,
                "review-sentiment": 0.872,
                "review-tfidf-kmeans": 4,
              },
              {
                topword: "steps",
                score: 0.5420934735209034,
                order: 15,
                pca_0: -0.07275807217067555,
                pca_1: 0.06517206590453041,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 0,
              },
              {
                topword: "day",
                score: 0.5402904002405575,
                order: 16,
                pca_0: -0.13611614219087367,
                pca_1: 0.17888531156080592,
                "review-sentiment": 0.4215,
                "review-tfidf-kmeans": 3,
              },
              {
                topword: "class",
                score: 0.5166579001932944,
                order: 17,
                pca_0: -0.020075105849936582,
                pca_1: -0.0010934576651353723,
                "review-sentiment": 0.296,
                "review-tfidf-kmeans": 5,
              },
              {
                topword: "first",
                score: 0.5150451351909454,
                order: 18,
                pca_0: -0.051597711664659825,
                pca_1: -0.032307145156927675,
                "review-sentiment": 0.4404,
                "review-tfidf-kmeans": 5,
              },
              {
                topword: "impeccable",
                score: 0.5150451351909454,
                order: 19,
                pca_0: 0.008437951720394937,
                pca_1: -0.17168327101266687,
                "review-sentiment": 0.5423,
                "review-tfidf-kmeans": 4,
              },
              {
                topword: "nice",
                score: 0.4970587060046731,
                order: 20,
                pca_0: 0.0062631198867784555,
                pca_1: -0.0009723145342481717,
                "review-sentiment": 0.2263,
                "review-tfidf-kmeans": 1,
              },
              {
                topword: "attentive",
                score: 0.49388337256202886,
                order: 21,
                pca_0: 0.0690598680673024,
                pca_1: -0.08003382280172869,
                "review-sentiment": 0.7684,
                "review-tfidf-kmeans": 2,
              },
              {
                topword: "everyone",
                score: 0.49388337256202886,
                order: 22,
                pca_0: -0.022100573934434133,
                pca_1: 0.13105614232510962,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 0,
              },
              {
                topword: "dvds",
                score: 0.4429898202040712,
                order: 23,
                pca_0: -0.1440159293869873,
                pca_1: -0.10532933517884617,
                "review-sentiment": 0.4767,
                "review-tfidf-kmeans": 1,
              },
              {
                topword: "down",
                score: 0.4429898202040712,
                order: 24,
                pca_0: 0.03542195449896562,
                pca_1: 0.11534623096971539,
                "review-sentiment": 0.8674,
                "review-tfidf-kmeans": 0,
              },
              {
                topword: "watch",
                score: 0.4429898202040712,
                order: 25,
                pca_0: -0.08062800341396051,
                pca_1: 0.13722468397907522,
                "review-sentiment": 0.2449,
                "review-tfidf-kmeans": 3,
              },
              {
                topword: "rooms",
                score: 0.43345470137333514,
                order: 26,
                pca_0: 0.07422272097914702,
                pca_1: 0.16774956958176665,
                "review-sentiment": 0.9371,
                "review-tfidf-kmeans": 5,
              },
              {
                topword: "while",
                score: 0.4283819569195216,
                order: 27,
                pca_0: 0.2285045779304986,
                pca_1: -0.12294115022985148,
                "review-sentiment": 0.2263,
                "review-tfidf-kmeans": 2,
              },
              {
                topword: "attended",
                score: 0.4283819569195216,
                order: 28,
                pca_0: -0.17443183266214,
                pca_1: 0.41336774994277126,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 0,
              },
              {
                topword: "toured",
                score: 0.4283819569195216,
                order: 29,
                pca_0: -0.0526424552186023,
                pca_1: 0.24183262742080827,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 3,
              },
              {
                topword: "conference",
                score: 0.4283819569195216,
                order: 30,
                pca_0: -0.21616910411708687,
                pca_1: 0.18399382659136237,
                "review-sentiment": 0.7845,
                "review-tfidf-kmeans": 3,
              },
              {
                topword: "anywhere",
                score: 0.4262719619714378,
                order: 31,
                pca_0: -0.164674898428974,
                pca_1: 0.054084706466964755,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 3,
              },
              {
                topword: "world",
                score: 0.4262719619714378,
                order: 32,
                pca_0: 0.2771053472412296,
                pca_1: 0.017678030329057178,
                "review-sentiment": 0.3182,
                "review-tfidf-kmeans": 2,
              },
              {
                topword: "beat",
                score: 0.4262719619714378,
                order: 33,
                pca_0: 0.07124638822533338,
                pca_1: 0.08844983484809642,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 1,
              },
              {
                topword: "family",
                score: 0.4186882806241253,
                order: 34,
                pca_0: -0.13607116720713178,
                pca_1: -0.11772139103555647,
                "review-sentiment": 0.7184,
                "review-tfidf-kmeans": 1,
              },
              {
                topword: "late",
                score: 0.41270017214365834,
                order: 35,
                pca_0: -0.1111960671906656,
                pca_1: 0.117287962232203,
                "review-sentiment": 0.8934,
                "review-tfidf-kmeans": 3,
              },
              {
                topword: "september",
                score: 0.41270017214365834,
                order: 36,
                pca_0: -0.16954403336835028,
                pca_1: -0.14628017102057486,
                "review-sentiment": 0.7624,
                "review-tfidf-kmeans": 4,
              },
              {
                topword: "surround",
                score: 0.41230373350501515,
                order: 37,
                pca_0: 0.15169813042162694,
                pca_1: 0.06854854939831774,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 1,
              },
              {
                topword: "speakers",
                score: 0.41230373350501515,
                order: 38,
                pca_0: 0.01818286554325911,
                pca_1: -0.12510344830160888,
                "review-sentiment": 0.3153,
                "review-tfidf-kmeans": 4,
              },
              {
                topword: "integrated",
                score: 0.41230373350501515,
                order: 39,
                pca_0: 0.13399625821602437,
                pca_1: -0.09671538368221211,
                "review-sentiment": 0.6249,
                "review-tfidf-kmeans": 2,
              },
              {
                topword: "practiced",
                score: 0.40779309459047297,
                order: 40,
                pca_0: -0.10043310746428963,
                pca_1: 0.4366542794967346,
                "review-sentiment": 0.2023,
                "review-tfidf-kmeans": 0,
              },
              {
                topword: "young",
                score: 0.40779309459047297,
                order: 41,
                pca_0: 0.2591015462236635,
                pca_1: -0.13525762127519,
                "review-sentiment": 0.4939,
                "review-tfidf-kmeans": 2,
              },
              {
                topword: "always",
                score: 0.40779309459047297,
                order: 42,
                pca_0: -0.1324513457511649,
                pca_1: 0.06909022336829071,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 0,
              },
              {
                topword: "albeit",
                score: 0.40779309459047297,
                order: 43,
                pca_0: -0.15055205900197507,
                pca_1: -0.20301321444762113,
                "review-sentiment": 0.6808,
                "review-tfidf-kmeans": 4,
              },
              {
                topword: "needed",
                score: 0.4055687213539636,
                order: 44,
                pca_0: 0.022180758431503293,
                pca_1: -0.06844495672779105,
                "review-sentiment": 0.6369,
                "review-tfidf-kmeans": 1,
              },
              {
                topword: "made",
                score: 0.4055687213539636,
                order: 45,
                pca_0: -0.009855451679693488,
                pca_1: 0.3031291512003334,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 0,
              },
              {
                topword: "see",
                score: 0.40232679141996736,
                order: 46,
                pca_0: 0.4516975221517961,
                pca_1: -0.03308471291281113,
                "review-sentiment": 0.5994,
                "review-tfidf-kmeans": 2,
              },
              {
                topword: "waking",
                score: 0.40232679141996736,
                order: 47,
                pca_0: 0.14406398098010118,
                pca_1: 0.023008446653812572,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 1,
              },
              {
                topword: "still",
                score: 0.397870711745345,
                order: 48,
                pca_0: 0.09010497079197388,
                pca_1: 0.029302889266621935,
                "review-sentiment": 0.3818,
                "review-tfidf-kmeans": 1,
              },
              {
                topword: "location",
                score: 0.39503138023276574,
                order: 49,
                pca_0: -0.22502360039369537,
                pca_1: 0.2936843943706658,
                "review-sentiment": 0.8126,
                "review-tfidf-kmeans": 3,
              },
              {
                topword: "two",
                score: 0.3910394624620477,
                order: 50,
                pca_0: -0.11762425408873124,
                pca_1: -0.04891083669156836,
                "review-sentiment": -0.5423,
                "review-tfidf-kmeans": 4,
              },
              {
                topword: "incredible",
                score: 0.3907008950342316,
                order: 51,
                pca_0: 0.005866998826335916,
                pca_1: 0.15977741829205425,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 3,
              },
              {
                topword: "has",
                score: 0.3907008950342316,
                order: 52,
                pca_0: -0.055978695529274584,
                pca_1: -0.04822703351997445,
                "review-sentiment": 0.7783,
                "review-tfidf-kmeans": 3,
              },
              {
                topword: "charm",
                score: 0.3907008950342316,
                order: 53,
                pca_0: -0.17533090432991347,
                pca_1: 0.05093720462340815,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 3,
              },
              {
                topword: "fittings",
                score: 0.386480986901085,
                order: 54,
                pca_0: -0.1456523220456735,
                pca_1: -0.10291409688146463,
                "review-sentiment": 0.765,
                "review-tfidf-kmeans": 4,
              },
              {
                topword: "modern",
                score: 0.386480986901085,
                order: 55,
                pca_0: -0.06420382789836575,
                pca_1: -0.08192189576947798,
                "review-sentiment": 0.3612,
                "review-tfidf-kmeans": 5,
              },
              {
                topword: "fixtures",
                score: 0.386480986901085,
                order: 56,
                pca_0: 0.10117950811967655,
                pca_1: -0.11481122325825849,
                "review-sentiment": -0.4404,
                "review-tfidf-kmeans": 2,
              },
              {
                topword: "ownership",
                score: 0.38436238954931595,
                order: 57,
                pca_0: -0.07367050622317162,
                pca_1: 0.16714919865238803,
                "review-sentiment": 0.4201,
                "review-tfidf-kmeans": 0,
              },
              {
                topword: "oops",
                score: 0.38436238954931595,
                order: 58,
                pca_0: -0.06220341546979475,
                pca_1: -0.13425602565282685,
                "review-sentiment": 0.4767,
                "review-tfidf-kmeans": 4,
              },
              {
                topword: "shared",
                score: 0.38436238954931595,
                order: 59,
                pca_0: -0.10476383124302623,
                pca_1: 0.03317211131997441,
                "review-sentiment": 0.5563,
                "review-tfidf-kmeans": 1,
              },
              {
                topword: "v.",
                score: 0.3842246767462004,
                order: 60,
                pca_0: 0.06990826122109277,
                pca_1: 0.15609756966738333,
                "review-sentiment": -0.1027,
                "review-tfidf-kmeans": 0,
              },
              {
                topword: "cadillac",
                score: 0.3842246767462004,
                order: 61,
                pca_0: 0.06768145791901556,
                pca_1: 0.38215934381368694,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 0,
              },
              {
                topword: "note",
                score: 0.3842246767462004,
                order: 62,
                pca_0: -0.11507353929273928,
                pca_1: -0.18842673821202427,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 2,
              },
              {
                topword: "now",
                score: 0.3842246767462004,
                order: 63,
                pca_0: -0.0008917142294973358,
                pca_1: -0.24422326852285067,
                "review-sentiment": 0.3612,
                "review-tfidf-kmeans": 1,
              },
              {
                topword: "system",
                score: 0.37982976656029566,
                order: 64,
                pca_0: -0.1341696474347605,
                pca_1: -0.27224338631902284,
                "review-sentiment": 0.3182,
                "review-tfidf-kmeans": 4,
              },
              {
                topword: "everything",
                score: 0.3788399040930972,
                order: 65,
                pca_0: 0.25622839191452595,
                pca_1: -0.01963319773123055,
                "review-sentiment": -0.3865,
                "review-tfidf-kmeans": 2,
              },
              {
                topword: "rented",
                score: 0.3736489297759614,
                order: 66,
                pca_0: -0.14317262960206714,
                pca_1: 0.15777296105899974,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 4,
              },
              {
                topword: "timeshares",
                score: 0.3736489297759614,
                order: 67,
                pca_0: -0.05296227379593545,
                pca_1: -0.006132499738856822,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 1,
              },
              {
                topword: "unsold",
                score: 0.3736489297759614,
                order: 68,
                pca_0: 0.18126098027091725,
                pca_1: 0.03293713694276779,
                "review-sentiment": 0.0772,
                "review-tfidf-kmeans": 1,
              },
              {
                topword: "hotels",
                score: 0.36490959170640874,
                order: 69,
                pca_0: -0.06675714254041026,
                pca_1: -0.04181202091174635,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 1,
              },
              {
                topword: "face",
                score: 0.36195819110980176,
                order: 70,
                pca_0: -0.07294785870572167,
                pca_1: 0.09309657993839468,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 1,
              },
              {
                topword: "hello",
                score: 0.36195819110980176,
                order: 71,
                pca_0: -0.06753779215752559,
                pca_1: 0.012249303138279705,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 4,
              },
              {
                topword: "smile",
                score: 0.36195819110980176,
                order: 72,
                pca_0: 0.02493638806336478,
                pca_1: -0.05190524176241431,
                "review-sentiment": -0.2732,
                "review-tfidf-kmeans": 2,
              },
              {
                topword: "sound",
                score: 0.3612382732168655,
                order: 73,
                pca_0: 0.20436180966742368,
                pca_1: 0.040044269717385464,
                "review-sentiment": 0.3252,
                "review-tfidf-kmeans": 5,
              },
            ],
          },
          width: 150,
          height: 200,
          selection: { select: { type: "multi" } },
          mark: { type: "point", tooltip: true },
          encoding: {
            y: { field: "pca_1", type: "quantitative" },
            x: { field: "pca_0", type: "quantitative" },
            color: {
              field: "review-sentiment",
              type: "quantitative",
              scale: { range: ["crimson", "royalblue"] },
              legend: false,
            },
            strokeWidth: {
              condition: { selection: "select", value: 4 },
              value: 0.5,
            },
          },
        };

        let kmeanScatterplot = {
          $schema: "https://vega.github.io/schema/vega-lite/v4.json",
          data: {
            values: [
              {
                topword: "bad",
                score: 0.8083389526839617,
                order: 1,
                pca_0: 0.4859851953361739,
                pca_1: -0.006163036341382914,
                "review-sentiment": 0.6361,
                "review-tfidf-kmeans": 0,
              },
              {
                topword: "biggy",
                score: 0.8083389526839617,
                order: 2,
                pca_0: -0.0670580877712037,
                pca_1: -0.14886539938730592,
                "review-sentiment": 0.7717,
                "review-tfidf-kmeans": 4,
              },
              {
                topword: "new",
                score: 0.7144621463584777,
                order: 3,
                pca_0: 0.02508318959131608,
                pca_1: -0.22139951668209723,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 4,
              },
              {
                topword: "recommendation",
                score: 0.6152190492710732,
                order: 4,
                pca_0: -0.18416791956180958,
                pca_1: -0.31812797752320865,
                "review-sentiment": 0.4754,
                "review-tfidf-kmeans": 2,
              },
              {
                topword: "strong",
                score: 0.6152190492710732,
                order: 5,
                pca_0: -0.21852029056277203,
                pca_1: -0.19247504181943675,
                "review-sentiment": 0.2732,
                "review-tfidf-kmeans": 5,
              },
              {
                topword: "comfy",
                score: 0.5994684609546195,
                order: 6,
                pca_0: 0.5699324075802275,
                pca_1: 0.02149439208932411,
                "review-sentiment": 0.5994,
                "review-tfidf-kmeans": 2,
              },
              {
                topword: "2",
                score: 0.5979357573130499,
                order: 7,
                pca_0: -0.1419570552749732,
                pca_1: -0.1451424495009587,
                "review-sentiment": 0.5574,
                "review-tfidf-kmeans": 5,
              },
              {
                topword: "an",
                score: 0.5959208242972732,
                order: 8,
                pca_0: -0.04318064303581845,
                pca_1: -0.19773604887008753,
                "review-sentiment": 0.2732,
                "review-tfidf-kmeans": 5,
              },
              {
                topword: "check",
                score: 0.5773863810356084,
                order: 9,
                pca_0: 0.0269294788107433,
                pca_1: -0.0847818668187394,
                "review-sentiment": 0.5574,
                "review-tfidf-kmeans": 1,
              },
              {
                topword: "lighting",
                score: 0.5662307137701766,
                order: 10,
                pca_0: 0.07163787959956781,
                pca_1: -0.21953043433952238,
                "review-sentiment": 0.7397,
                "review-tfidf-kmeans": 5,
              },
              {
                topword: "decor",
                score: 0.5662307137701766,
                order: 11,
                pca_0: -0.16880485197970774,
                pca_1: -0.2247322676573062,
                "review-sentiment": 0.2732,
                "review-tfidf-kmeans": 5,
              },
              {
                topword: "stylish",
                score: 0.5662307137701766,
                order: 12,
                pca_0: 0.5423679161976489,
                pca_1: 0.04814509595221332,
                "review-sentiment": 0.5994,
                "review-tfidf-kmeans": 2,
              },
              {
                topword: "regret",
                score: 0.5429497078047782,
                order: 13,
                pca_0: -0.04426526964232842,
                pca_1: 0.18511226526478175,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 0,
              },
              {
                topword: "wo",
                score: 0.5429497078047782,
                order: 14,
                pca_0: -0.1834166909171092,
                pca_1: -0.121338626483554,
                "review-sentiment": 0.872,
                "review-tfidf-kmeans": 4,
              },
              {
                topword: "steps",
                score: 0.5420934735209034,
                order: 15,
                pca_0: -0.07275807217067555,
                pca_1: 0.06517206590453041,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 0,
              },
              {
                topword: "day",
                score: 0.5402904002405575,
                order: 16,
                pca_0: -0.13611614219087367,
                pca_1: 0.17888531156080592,
                "review-sentiment": 0.4215,
                "review-tfidf-kmeans": 3,
              },
              {
                topword: "class",
                score: 0.5166579001932944,
                order: 17,
                pca_0: -0.020075105849936582,
                pca_1: -0.0010934576651353723,
                "review-sentiment": 0.296,
                "review-tfidf-kmeans": 5,
              },
              {
                topword: "first",
                score: 0.5150451351909454,
                order: 18,
                pca_0: -0.051597711664659825,
                pca_1: -0.032307145156927675,
                "review-sentiment": 0.4404,
                "review-tfidf-kmeans": 5,
              },
              {
                topword: "impeccable",
                score: 0.5150451351909454,
                order: 19,
                pca_0: 0.008437951720394937,
                pca_1: -0.17168327101266687,
                "review-sentiment": 0.5423,
                "review-tfidf-kmeans": 4,
              },
              {
                topword: "nice",
                score: 0.4970587060046731,
                order: 20,
                pca_0: 0.0062631198867784555,
                pca_1: -0.0009723145342481717,
                "review-sentiment": 0.2263,
                "review-tfidf-kmeans": 1,
              },
              {
                topword: "attentive",
                score: 0.49388337256202886,
                order: 21,
                pca_0: 0.0690598680673024,
                pca_1: -0.08003382280172869,
                "review-sentiment": 0.7684,
                "review-tfidf-kmeans": 2,
              },
              {
                topword: "everyone",
                score: 0.49388337256202886,
                order: 22,
                pca_0: -0.022100573934434133,
                pca_1: 0.13105614232510962,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 0,
              },
              {
                topword: "dvds",
                score: 0.4429898202040712,
                order: 23,
                pca_0: -0.1440159293869873,
                pca_1: -0.10532933517884617,
                "review-sentiment": 0.4767,
                "review-tfidf-kmeans": 1,
              },
              {
                topword: "down",
                score: 0.4429898202040712,
                order: 24,
                pca_0: 0.03542195449896562,
                pca_1: 0.11534623096971539,
                "review-sentiment": 0.8674,
                "review-tfidf-kmeans": 0,
              },
              {
                topword: "watch",
                score: 0.4429898202040712,
                order: 25,
                pca_0: -0.08062800341396051,
                pca_1: 0.13722468397907522,
                "review-sentiment": 0.2449,
                "review-tfidf-kmeans": 3,
              },
              {
                topword: "rooms",
                score: 0.43345470137333514,
                order: 26,
                pca_0: 0.07422272097914702,
                pca_1: 0.16774956958176665,
                "review-sentiment": 0.9371,
                "review-tfidf-kmeans": 5,
              },
              {
                topword: "while",
                score: 0.4283819569195216,
                order: 27,
                pca_0: 0.2285045779304986,
                pca_1: -0.12294115022985148,
                "review-sentiment": 0.2263,
                "review-tfidf-kmeans": 2,
              },
              {
                topword: "attended",
                score: 0.4283819569195216,
                order: 28,
                pca_0: -0.17443183266214,
                pca_1: 0.41336774994277126,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 0,
              },
              {
                topword: "toured",
                score: 0.4283819569195216,
                order: 29,
                pca_0: -0.0526424552186023,
                pca_1: 0.24183262742080827,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 3,
              },
              {
                topword: "conference",
                score: 0.4283819569195216,
                order: 30,
                pca_0: -0.21616910411708687,
                pca_1: 0.18399382659136237,
                "review-sentiment": 0.7845,
                "review-tfidf-kmeans": 3,
              },
              {
                topword: "anywhere",
                score: 0.4262719619714378,
                order: 31,
                pca_0: -0.164674898428974,
                pca_1: 0.054084706466964755,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 3,
              },
              {
                topword: "world",
                score: 0.4262719619714378,
                order: 32,
                pca_0: 0.2771053472412296,
                pca_1: 0.017678030329057178,
                "review-sentiment": 0.3182,
                "review-tfidf-kmeans": 2,
              },
              {
                topword: "beat",
                score: 0.4262719619714378,
                order: 33,
                pca_0: 0.07124638822533338,
                pca_1: 0.08844983484809642,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 1,
              },
              {
                topword: "family",
                score: 0.4186882806241253,
                order: 34,
                pca_0: -0.13607116720713178,
                pca_1: -0.11772139103555647,
                "review-sentiment": 0.7184,
                "review-tfidf-kmeans": 1,
              },
              {
                topword: "late",
                score: 0.41270017214365834,
                order: 35,
                pca_0: -0.1111960671906656,
                pca_1: 0.117287962232203,
                "review-sentiment": 0.8934,
                "review-tfidf-kmeans": 3,
              },
              {
                topword: "september",
                score: 0.41270017214365834,
                order: 36,
                pca_0: -0.16954403336835028,
                pca_1: -0.14628017102057486,
                "review-sentiment": 0.7624,
                "review-tfidf-kmeans": 4,
              },
              {
                topword: "surround",
                score: 0.41230373350501515,
                order: 37,
                pca_0: 0.15169813042162694,
                pca_1: 0.06854854939831774,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 1,
              },
              {
                topword: "speakers",
                score: 0.41230373350501515,
                order: 38,
                pca_0: 0.01818286554325911,
                pca_1: -0.12510344830160888,
                "review-sentiment": 0.3153,
                "review-tfidf-kmeans": 4,
              },
              {
                topword: "integrated",
                score: 0.41230373350501515,
                order: 39,
                pca_0: 0.13399625821602437,
                pca_1: -0.09671538368221211,
                "review-sentiment": 0.6249,
                "review-tfidf-kmeans": 2,
              },
              {
                topword: "practiced",
                score: 0.40779309459047297,
                order: 40,
                pca_0: -0.10043310746428963,
                pca_1: 0.4366542794967346,
                "review-sentiment": 0.2023,
                "review-tfidf-kmeans": 0,
              },
              {
                topword: "young",
                score: 0.40779309459047297,
                order: 41,
                pca_0: 0.2591015462236635,
                pca_1: -0.13525762127519,
                "review-sentiment": 0.4939,
                "review-tfidf-kmeans": 2,
              },
              {
                topword: "always",
                score: 0.40779309459047297,
                order: 42,
                pca_0: -0.1324513457511649,
                pca_1: 0.06909022336829071,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 0,
              },
              {
                topword: "albeit",
                score: 0.40779309459047297,
                order: 43,
                pca_0: -0.15055205900197507,
                pca_1: -0.20301321444762113,
                "review-sentiment": 0.6808,
                "review-tfidf-kmeans": 4,
              },
              {
                topword: "needed",
                score: 0.4055687213539636,
                order: 44,
                pca_0: 0.022180758431503293,
                pca_1: -0.06844495672779105,
                "review-sentiment": 0.6369,
                "review-tfidf-kmeans": 1,
              },
              {
                topword: "made",
                score: 0.4055687213539636,
                order: 45,
                pca_0: -0.009855451679693488,
                pca_1: 0.3031291512003334,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 0,
              },
              {
                topword: "see",
                score: 0.40232679141996736,
                order: 46,
                pca_0: 0.4516975221517961,
                pca_1: -0.03308471291281113,
                "review-sentiment": 0.5994,
                "review-tfidf-kmeans": 2,
              },
              {
                topword: "waking",
                score: 0.40232679141996736,
                order: 47,
                pca_0: 0.14406398098010118,
                pca_1: 0.023008446653812572,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 1,
              },
              {
                topword: "still",
                score: 0.397870711745345,
                order: 48,
                pca_0: 0.09010497079197388,
                pca_1: 0.029302889266621935,
                "review-sentiment": 0.3818,
                "review-tfidf-kmeans": 1,
              },
              {
                topword: "location",
                score: 0.39503138023276574,
                order: 49,
                pca_0: -0.22502360039369537,
                pca_1: 0.2936843943706658,
                "review-sentiment": 0.8126,
                "review-tfidf-kmeans": 3,
              },
              {
                topword: "two",
                score: 0.3910394624620477,
                order: 50,
                pca_0: -0.11762425408873124,
                pca_1: -0.04891083669156836,
                "review-sentiment": -0.5423,
                "review-tfidf-kmeans": 4,
              },
              {
                topword: "incredible",
                score: 0.3907008950342316,
                order: 51,
                pca_0: 0.005866998826335916,
                pca_1: 0.15977741829205425,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 3,
              },
              {
                topword: "has",
                score: 0.3907008950342316,
                order: 52,
                pca_0: -0.055978695529274584,
                pca_1: -0.04822703351997445,
                "review-sentiment": 0.7783,
                "review-tfidf-kmeans": 3,
              },
              {
                topword: "charm",
                score: 0.3907008950342316,
                order: 53,
                pca_0: -0.17533090432991347,
                pca_1: 0.05093720462340815,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 3,
              },
              {
                topword: "fittings",
                score: 0.386480986901085,
                order: 54,
                pca_0: -0.1456523220456735,
                pca_1: -0.10291409688146463,
                "review-sentiment": 0.765,
                "review-tfidf-kmeans": 4,
              },
              {
                topword: "modern",
                score: 0.386480986901085,
                order: 55,
                pca_0: -0.06420382789836575,
                pca_1: -0.08192189576947798,
                "review-sentiment": 0.3612,
                "review-tfidf-kmeans": 5,
              },
              {
                topword: "fixtures",
                score: 0.386480986901085,
                order: 56,
                pca_0: 0.10117950811967655,
                pca_1: -0.11481122325825849,
                "review-sentiment": -0.4404,
                "review-tfidf-kmeans": 2,
              },
              {
                topword: "ownership",
                score: 0.38436238954931595,
                order: 57,
                pca_0: -0.07367050622317162,
                pca_1: 0.16714919865238803,
                "review-sentiment": 0.4201,
                "review-tfidf-kmeans": 0,
              },
              {
                topword: "oops",
                score: 0.38436238954931595,
                order: 58,
                pca_0: -0.06220341546979475,
                pca_1: -0.13425602565282685,
                "review-sentiment": 0.4767,
                "review-tfidf-kmeans": 4,
              },
              {
                topword: "shared",
                score: 0.38436238954931595,
                order: 59,
                pca_0: -0.10476383124302623,
                pca_1: 0.03317211131997441,
                "review-sentiment": 0.5563,
                "review-tfidf-kmeans": 1,
              },
              {
                topword: "v.",
                score: 0.3842246767462004,
                order: 60,
                pca_0: 0.06990826122109277,
                pca_1: 0.15609756966738333,
                "review-sentiment": -0.1027,
                "review-tfidf-kmeans": 0,
              },
              {
                topword: "cadillac",
                score: 0.3842246767462004,
                order: 61,
                pca_0: 0.06768145791901556,
                pca_1: 0.38215934381368694,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 0,
              },
              {
                topword: "note",
                score: 0.3842246767462004,
                order: 62,
                pca_0: -0.11507353929273928,
                pca_1: -0.18842673821202427,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 2,
              },
              {
                topword: "now",
                score: 0.3842246767462004,
                order: 63,
                pca_0: -0.0008917142294973358,
                pca_1: -0.24422326852285067,
                "review-sentiment": 0.3612,
                "review-tfidf-kmeans": 1,
              },
              {
                topword: "system",
                score: 0.37982976656029566,
                order: 64,
                pca_0: -0.1341696474347605,
                pca_1: -0.27224338631902284,
                "review-sentiment": 0.3182,
                "review-tfidf-kmeans": 4,
              },
              {
                topword: "everything",
                score: 0.3788399040930972,
                order: 65,
                pca_0: 0.25622839191452595,
                pca_1: -0.01963319773123055,
                "review-sentiment": -0.3865,
                "review-tfidf-kmeans": 2,
              },
              {
                topword: "rented",
                score: 0.3736489297759614,
                order: 66,
                pca_0: -0.14317262960206714,
                pca_1: 0.15777296105899974,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 4,
              },
              {
                topword: "timeshares",
                score: 0.3736489297759614,
                order: 67,
                pca_0: -0.05296227379593545,
                pca_1: -0.006132499738856822,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 1,
              },
              {
                topword: "unsold",
                score: 0.3736489297759614,
                order: 68,
                pca_0: 0.18126098027091725,
                pca_1: 0.03293713694276779,
                "review-sentiment": 0.0772,
                "review-tfidf-kmeans": 1,
              },
              {
                topword: "hotels",
                score: 0.36490959170640874,
                order: 69,
                pca_0: -0.06675714254041026,
                pca_1: -0.04181202091174635,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 1,
              },
              {
                topword: "face",
                score: 0.36195819110980176,
                order: 70,
                pca_0: -0.07294785870572167,
                pca_1: 0.09309657993839468,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 1,
              },
              {
                topword: "hello",
                score: 0.36195819110980176,
                order: 71,
                pca_0: -0.06753779215752559,
                pca_1: 0.012249303138279705,
                "review-sentiment": 0,
                "review-tfidf-kmeans": 4,
              },
              {
                topword: "smile",
                score: 0.36195819110980176,
                order: 72,
                pca_0: 0.02493638806336478,
                pca_1: -0.05190524176241431,
                "review-sentiment": -0.2732,
                "review-tfidf-kmeans": 2,
              },
              {
                topword: "sound",
                score: 0.3612382732168655,
                order: 73,
                pca_0: 0.20436180966742368,
                pca_1: 0.040044269717385464,
                "review-sentiment": 0.3252,
                "review-tfidf-kmeans": 5,
              },
            ],
          },
          width: 150,
          height: 200,
          mark: "circle",
          encoding: {
            y: { field: "pca_1", type: "quantitative" },
            x: { field: "pca_0", type: "quantitative" },
            tooltip: { field: "review", type: "nominal" },
            color: {
              field: "review-tfidf-kmeans",
              type: "nominal",
              legend: false,
            },
          },
        };

        visSpecList.push(scatterplotSentimentSpec);
        visSpecList.push(kmeanScatterplot);

        // const columnTypes = JSON.parse(response.data["columnTypes"]);
        // const visualEncodings = JSON.parse(response.data["encodings"]);
        // const visIndexes = JSON.parse(response.data["vis_idx"]);
        // let visualEncodingRows = [];
        // let visTypes = {};

        // console.log(`visIndex is: ${visIndexes["barchart"]}`);
        // const indexes = {
        //   ...this.state.reverseIndex,
        //   barchart: visIndexes["barchart"],
        // };
        // this.setState({ reverseIndex: indexes });

        // let scatterplotSentimentSpec = {
        //   $schema: "https://vega.github.io/schema/vega-lite/v4.json",
        //   data: { values: [] },
        //   width: 150,
        //   height: 200,
        //   mark: "point",
        //   encoding: {
        //     y: { field: "pca_1", type: "quantitative" },
        //     x: { field: "pca_0", type: "quantitative" },
        //     tooltip: { field: "review", type: "nominal" },
        //     color: {
        //       field: "review-sentiment",
        //       type: "quantitative",
        //       scale: {
        //         range: ["crimson", "royalblue"],
        //       },
        //     },
        //   },
        // };

        // let scatterplotClusterSpec = {
        //   $schema: "https://vega.github.io/schema/vega-lite/v4.json",
        //   data: { values: [] },
        //   width: 150,
        //   height: 200,
        //   mark: "circle",
        //   encoding: {
        //     y: { field: "pca_1", type: "quantitative" },
        //     x: { field: "pca_0", type: "quantitative" },
        //     tooltip: { field: "review", type: "nominal" },
        //     color: {
        //       field: "review-tfidf-kmeans",
        //       type: "nominal",
        //     },
        //   },
        // };
        // for (let key in visualEncodings) {
        //   const visData = visualEncodings[key];
        //   const visKeys = Object.keys(visData);
        //   if (visKeys.length > 0) {
        //     const rows = visData[visKeys[0]];
        //     for (let rowIdx in rows) {
        //       const rowVal = rows[rowIdx];
        //       if (visualEncodingRows.length >= rowIdx - 1) {
        //         visualEncodingRows[rowIdx] = {
        //           ...visualEncodingRows[rowIdx],
        //           ...rowVal,
        //         };
        //       } else {
        //         visualEncodingRows.push(rowVal);
        //       }
        //     }
        //   }
        // }

        // for (let key in visualEncodings) {
        //   const visData = visualEncodings[key];
        //   const visKeys = Object.keys(visData);
        //   if (visKeys.length > 0) {
        //     console.log(
        //       `vis data of key ${key} contains a visualization object with type ${visKeys[0]}`
        //     );
        //     visTypes[key] = visKeys[0];
        //     if (
        //       key == "<pca_0_pca_1_review-sentiment>" ||
        //       key == "<pca_0_pca_1_review-sentiment_review>" ||
        //       key == "<review_pca_0_pca_1_review-sentiment>"
        //     ) {
        //       // spec.hconcat = [...spec.hconcat, scatterplotSentimentSpec];
        //       scatterplotSentimentSpec.data.values = visualEncodingRows;
        //       specList.push(scatterplotSentimentSpec);
        //     } else if (
        //       key == "<pca_0_pca_1_review-tfidf-kmeans>" ||
        //       key == "<pca_0_pca_1_review-tfidf-kmeans_review>" ||
        //       key == "<review_pca_0_pca_1_review-tfidf-kmeans>"
        //     ) {
        //       // spec.hconcat = [...spec.hconcat, scatterplotClusterSpec];
        //       scatterplotClusterSpec.data.values = visualEncodingRows;
        //       specList.push(scatterplotClusterSpec);
        //     } else if (key == "review-tfidf") {
        //       // spec.hconcat = [...spec.hconcat, distributionSpec];
        //       distributionSpec.data.values = visualEncodingRows;
        //       specList.push(distributionSpec);
        //     }
        //   }
        // }

        // const newVisualEncodings = { all: visualEncodingRows };

        this.setState({ fileHeaders: columns });
        for (let key in columns) {
          chartRow.push("");
        }
        rows.push(chartRow);
        rows.push(...JSON.parse(response.data["rows"]));

        // let processedVisualEncodings = {...visualEncodings};
        // // set visual encoding data
        // for (let key in columnTypes) {
        //     if (columnTypes[key] === "tfidf") {
        //         const tfIdfEncoding = {
        //             "topwords": visualEncodings[key]
        //         };
        //         processedVisualEncodings[key] = tfIdfEncoding;
        //     }
        // }

        // determining correct widths of the columns
        let columnWidths = new Array(this.state.fileHeaders.length).fill(0);
        columnWidths[0] = 100; // fixed size column
        // determine column widths by taking average of lengths over first 20 rows
        for (let i = 0; i < 20; i++) {
          const rowData = rows[i];
          for (let j = 0; j < this.state.fileHeaders.length; j++) {
            const colLength = rowData[j].length;
            columnWidths[j + 1] += colLength;
          }
        }
        columnWidths = columnWidths.map((val) => {
          return val / 20;
        });
        this.setState({
          datasetRows: rows,
          columnSizes: columnWidths,
          dataVisSpec: visSpecList,
          // columnTypes,
          // visualEncodings: newVisualEncodings,
          // visualizationTypes: visTypes,
          // dataVisSpec: specList,
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  render() {
    return (
      <div className={this.classes.root}>
        <Grid container className={this.classes.root} spacing={1}>
          <Grid item xs={12}>
            <LeamAppBar
              onFileChange={this.onFileChange}
              fileName={this.state.fileName}
              loadFile={this.loadFile}
              datasets={this.state.datasets}
              columns={this.state.fileHeaders}
            />
          </Grid>
          <Grid item xs={12}>
            <Paper className={this.classes.paper}>
              <DatavisView
                key="datavis-view"
                visualData={this.state.visualEncodings}
                visSpecList={this.state.dataVisSpec}
                visTypes={this.state.visualizationTypes}
                selectedColumn={this.state.selectedColumn}
                width={350}
                height={200}
                reverseIdx={this.state.reverseIndex}
                highlightRows={this.highlightRows}
              />
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper className={this.classes.paper}>
              <NotebookView
                loadFile={this.loadFile}
                datasetName={this.state.fileName}
              />
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Box ml={1} border={1}>
              <TableView
                key="table-view"
                datasetRows={this.state.datasetRows}
                datasetHeader={this.state.fileHeaders}
                visualData={this.state.visualEncodings}
                visTypes={this.state.visualizationTypes}
                colTypes={this.state.columnTypes}
                selectColumn={this.selectColumn}
                colSizes={this.state.columnSizes}
                highlightedRows={this.state.highlightedRows}
                highlight={this.highlightRows}
                isFiltering={this.state.filtering}
              />
            </Box>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(useStyles)(App);
