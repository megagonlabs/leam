import json
from typing import List, Dict
from ..types import VisType


class TexVis:
    vis_type: VisType
    vis_spec: str
    columns: List
    links: List

    def __init__(self, vis_type: VisType, columns: List[str], data: List[Dict]):
        self.vis_type = vis_type
        vis_spec_path = vis_type.value + ".json"  # e.g. barchart.json
        with open(vis_spec_path, "r") as f:
            self.vis_spec = json.loads(f.read())
        self.vis_spec["data"]["values"] = data
        # TODO: dynamically change visualization based on col names
        # TODO: that there are 2 column with certain types
        self.columns = columns
        self.links = []

