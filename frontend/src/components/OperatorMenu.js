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

export const OperatorMenu = (props) => {
  const { runOpCommand, models, metadata } = props;
  const [menuPosition, setMenuPosition] = React.useState("");
  // const [curCommand, setCurCommand] = React.useState([]);
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
    let cName = event.target.id;
    let opName = event.target.firstChild.nodeValue;
    opName = opName.replace(/\s/g, "");
    console.log(`id of btn is: ${cName} with op: ${opName}`);

    // let cmdCopy = curCommand;
    // cmdCopy.push(opName);
    // setCurCommand(cmdCopy);

    // console.log(`cur command is ${JSON.stringify(curCommand)}`);

    if (cName !== "endAction") {
      return;
    }

    runOpCommand(opName);
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
          id="intermediateAction"
          onClick={handleItemClick}
        >
          <MenuItem onClick={handleItemClick} id="endAction">
            Lowercase
          </MenuItem>
          <MenuItem onClick={handleItemClick} id="endAction">
            Remove Punctuation
          </MenuItem>
          <MenuItem onClick={handleItemClick} id="endAction">
            Remove URLs
          </MenuItem>
          <MenuItem onClick={handleItemClick} id="endAction">
            Strip HTML
          </MenuItem>
          <MenuItem onClick={handleItemClick} id="endAction">
            Remove Emoji
          </MenuItem>
          <MenuItem onClick={handleItemClick} id="endAction">
            Remove Stopwords
          </MenuItem>
        </NestedMenuItem>
        <NestedMenuItem
          label="Visualize"
          parentMenuOpen={!!menuPosition}
          onClick={handleItemClick}
        >
          <NestedMenuItem
            label="Barchart"
            parentMenuOpen={!!menuPosition}
            onClick={handleItemClick}
          >
            {metadata.map((val, idx) => {
              return (
                <MenuItem onClick={handleItemClick} id="endAction">
                  {val}
                </MenuItem>
              );
            })}
          </NestedMenuItem>
          <MenuItem onClick={handleItemClick} id="endAction">
            Histogram
          </MenuItem>
        </NestedMenuItem>
        <NestedMenuItem
          label="Mutate"
          parentMenuOpen={!!menuPosition}
          onClick={handleItemClick}
        >
          <MenuItem onClick={handleItemClick} id="endAction">
            Sentiment
          </MenuItem>
          <MenuItem onClick={handleItemClick} id="endAction">
            Number Words
          </MenuItem>
        </NestedMenuItem>
        <NestedMenuItem
          label="Model"
          parentMenuOpen={!!menuPosition}
          onClick={handleItemClick}
        >
          {models.map((val, idx) => {
            return (
              <MenuItem onClick={handleItemClick} id="endAction">
                {val}
              </MenuItem>
            );
          })}
        </NestedMenuItem>
      </Menu>
    </div>
  );
};

export default OperatorMenu;
