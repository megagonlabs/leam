import React, { Component } from 'react';
import { Grid } from 'react-virtualized';
import 'react-virtualized/styles.css';
// import 'react-datasheet/lib/react-datasheet.css';

// add more data so can test table view
// const list = [
//   {id: 1, hotel: "usa_san francisco_fairmont_heritage_place_ghirardelli_square", review: "We stayed here for 8 nights on our trip to San Francisco from Australia"},
//   {id: 2, hotel: "usa_san francisco_fairmont_heritage_place_ghirardelli_square", review: "Everything was just steps away."}
// ]

const list = [
  ['Brian Vaughn', 'Software Engineer', 'San Jose', 'CA', 95125 /* ... */],
  // And so on...
];

function cellRenderer({columnIndex, key, rowIndex, style}) {
  return (
    <div key={key} style={style}>
      {list[rowIndex][columnIndex]}
    </div>
  );
}

class TableView extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <h1>Table View</h1><br />
        {/* <Table
          width={300}
          height={300}
          headerHeight={20}
          rowHeight={30}
          rowCount={list.length}
          rowGetter={({index}) => list[index]}>
        <Column label="Id" dataKey="id" width={100} />
        <Column width={200} label="Hotel" dataKey="hotel" />
        <Column width={200} label="Review" dataKey="review" />
        </Table> */}
        <Grid
        cellRenderer={cellRenderer}
        columnCount={list[0].length}
        columnWidth={100}
        height={300}
        rowCount={list.length}
        rowHeight={30}
        width={300}
      />
      </div>
    );
  }
}

export default TableView;