import React from "react";
import { Menu, MenuItem, Typography, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import NestedMenuItem from "material-ui-nested-menu-item";

const useStyles = makeStyles((theme) => ({
  primary: {
    backgroundColor: "#272C34",
  },
  root: {
    flexGrow: 1,
  },
  datasetButton: {
    marginRight: theme.spacing(2),
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
          <MenuItem onClick={handleItemClick}>Lowercase</MenuItem>
          <MenuItem onClick={handleItemClick}>Remove Emoji</MenuItem>
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
