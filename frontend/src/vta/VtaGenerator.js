const generateVTASpec = (
  operatorClass,
  operatorType,
  action,
  columns,
  dataset
) => {
  const vta = { coordinate: [] };
  const vtaView = {
    view: "explorer.data",
    data: { columns, source: dataset },
    operator: {
      class: operatorClass,
      type: operatorType,
      on_complete: { action },
    },
  };
  vta.coordinate.push(vtaView);
  return vta;
};

export default generateVTASpec;
