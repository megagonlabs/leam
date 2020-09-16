import React from "react";
import { Menu, MenuItem, Typography, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import NestedMenuItem from "material-ui-nested-menu-item";
import axios from "axios";

const useStyles = makeStyles((theme) => ({
  primary: {
    backgroundColor: "#272C34",
  },
  root: {
    flexGrow: 1,
  },
  datasetButton: {
    marginRight: theme.spacing(1),
    minWidth: 150,
    select: {
      color: "#FFF",
    },
  },
}));

export const OperatorMenu = () => {
  const [menuPosition, setMenuPosition] = React.useState("");
  const classes = useStyles();

  const handleRightClick = (event) => {
    if (menuPosition) {
      return;
    }
    event.preventDefault();
    setMenuPosition({
      top: event.pageY,
      left: event.pageX,
    });
  };

  const handleItemClick = (event) => {
    setMenuPosition(null);
    const cName = event.target.id;
    const opName = event.target.firstChild.nodeValue;
    console.log(`id of btn is: ${cName} with op: ${opName}`);

    // console.log(`COMMAND: ${command}`);
    // let url;
    // if (this.props.testing) {
    //   url = "http://localhost:5000/v1/run-operator/";
    // } else {
    //   url = "v1/run-operator/";
    // }
    // // fetch the actual rows
    // axios
    //   .post(url, { vta_spec: command, vta_script_flag: 1 })
    //   .then((response) => {
    //     console.log(
    //       `operator response body is ${JSON.stringify(response.data)}`
    //     );
    //   })
    //   .catch(function (error) {
    //     console.log(error);
    //   });
  };

  return (
    <div className={clsx(classes.primary)}>
      <Button
        size="small"
        variant="outlined"
        color="inherit"
        aria-label="Pick the current dataset"
        onClick={handleRightClick}
        className={classes.datasetButton}
      >
        Pick Operator
      </Button>
      <Menu
        open={!!menuPosition}
        onClose={() => setMenuPosition(null)}
        anchorReference="anchorPosition"
        anchorPosition={menuPosition}
      >
        <NestedMenuItem
          label="Project"
          parentMenuOpen={!!menuPosition}
          onClick={handleItemClick}
        >
          <MenuItem onClick={handleItemClick}>Correct Spellings</MenuItem>
          <MenuItem onClick={handleItemClick} id="endAction">
            Lowercase
          </MenuItem>
          <MenuItem onClick={handleItemClick} id="endAction">
            Remove Emoji
          </MenuItem>
          <MenuItem onClick={handleItemClick}>Remove Punctuation</MenuItem>
          <MenuItem onClick={handleItemClick}>Remove Square Brackets</MenuItem>
          <MenuItem onClick={handleItemClick}>Remove URLs</MenuItem>
          <MenuItem onClick={handleItemClick}>Strip HTML</MenuItem>
          <NestedMenuItem
            label="Lemmatize"
            parentMenuOpen={!!menuPosition}
            onClick={handleItemClick}
          >
            <MenuItem onClick={handleItemClick}>Create Column</MenuItem>
            <MenuItem onClick={handleItemClick}>Update Column</MenuItem>
          </NestedMenuItem>
        </NestedMenuItem>
        <MenuItem onClick={handleItemClick}>Visualize</MenuItem>
        <NestedMenuItem
          label="Mutate"
          parentMenuOpen={!!menuPosition}
          onClick={handleItemClick}
        >
          <MenuItem onClick={handleItemClick}>TF-IDF</MenuItem>
          <MenuItem onClick={handleItemClick}>LDA</MenuItem>
        </NestedMenuItem>
      </Menu>
    </div>
  );
};

export default OperatorMenu;
