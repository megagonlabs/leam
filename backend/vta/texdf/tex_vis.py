import json
from typing import List, Dict
from ..types import VisType


class TexVis:
    vis_type: VisType
    vis_spec: str
    columns: List
    selection_type: Dict
    links: List

    def __init__(
        self,
        vis_type: VisType,
        columns: List[str],
        data: List[Dict],
        selection_type: Dict = None,
    ):
        if selection_type is None:
            self.selection_type = {"interaction": "click", "type": "single"}
        else:
            self.selection_type = selection_type
        self.vis_type = vis_type
        vis_spec_path = (
            "/app/vta/texdf/" + vis_type.value + ".json"
        )  # e.g. barchart.json
        with open(vis_spec_path, "r") as f:
            self.vis_spec = json.loads(f.read())
        self.vis_spec["data"]["values"] = data
        # TODO: dynamically change visualization based on col names
        # TODO: that there are 2 column with certain types
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
