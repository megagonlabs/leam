import json
from typing import List, Dict
from ..types import VisType, VTAColumnType


class TexVis:
    vis_type: VisType
    vis_spec: str
    columns: List
    col_types: List
    selection_type: Dict
    links: List

    def __init__(
        self,
        vis_type: VisType,
        columns: List[str],
        col_types: List[VTAColumnType],
        data: List[Dict],
        selection_type: Dict = None,
    ):
        if selection_type is None:
            # TODO: specify what how we turn selections into event handlers
            # TODO: specify interaction type -> click vs. brush
            # TODO: specify selection type -> single vs. multiple
            self.selection_type = "single"
        else:
            self.selection_type = selection_type
        self.vis_type = vis_type
        vis_spec_path = (
            "/app/vta/texdf/" + vis_type.value + ".json"
        )  # e.g. barchart.json
        with open(vis_spec_path, "r") as f:
            self.vis_spec = json.loads(f.read())
        self.vis_spec["data"]["values"] = data

        # for barchart columns are hard-coded as "topword", "score", and "order" for now
        # can make this more modular when we need another type of barchart

        # for scatterplots treat column order as x,y,(color), (tooltip) etc. ordering
        if vis_type is VisType.scatterplot:
            for idx, col in enumerate(columns):
                if idx == 0:
                    self.vis_spec["encoding"]["x"] = {
                        "field": col,
                        "type": "quantitative",
                    }
                elif idx == 1:
                    self.vis_spec["encoding"]["y"] = {
                        "field": col,
                        "type": "quantitative",
                    }
                elif idx == 2:
                    # use column at idx 2 for coloring graph
                    if col_types[idx] is VTAColumnType.FLOAT:
                        # example is sentiment coloring scale
                        self.vis_spec["encoding"]["color"] = {
                            "field": col,
                            "type": "quantitative",
                            "scale": {"range": ["crimson", "royalblue"]},
                            "legend": "false",
                        }
                    elif col_types[idx] is VTAColumnType.INT:
                        # example is kmeans coloring by cluster
                        self.vis_spec["encoding"]["color"] = {
                            "field": col,
                            "type": "nominal",
                            "legend": "false",
                        }
                    else:
                        raise Exception(
                            "VTAColumnType %s doesn't work for coloring graph",
                            col_types[idx].value,
                        )
            # TODO: handle selection types for scatterplot

        # TODO: dynamically change visualization based on col names
        # TODO: assert that there are 2 column with certain types
        self.columns = columns
        self.links = []

    def to_dict(self):
        vis_obj = {}
        vis_obj["spec"] = self.vis_spec
        vis_obj["vis_type"] = self.vis_type.value
        vis_obj["selection_type"] = self.selection_type
        vis_obj["links"] = self.links
        vis_obj["columns"] = self.columns
        return vis_obj
