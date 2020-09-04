from enum import Enum
from typing import List
from .texdf import tex_df
from .texdf import tex_column
from vta.types import SelectionType, VTAColumnType, ActionType, VisType
from vta.project import Project
from vta.mutate import Mutate
from .aggregate import Aggregate


class VTATable:
    """
    object that wraps Tex table view
    """

    selection_type: SelectionType
    texdf: tex_df.TexDF

    def __init__(self, texdf):
        self.texdf = texdf
        self.selection_type = SelectionType.column
        self.texdf = texdf

    # TODO: maybe support target input being VTAVisualization object itself!
    def uni_link(self, target):
        assert target != "table"
        self.texdf.add_uni_link("table", target)

    def rm_link(self, target):
        assert target != "table"
        self.texdf.remove_link("table", target)

    def bi_link(self, target):
        assert target != "table"
        self.texdf.add_bi_link("table", target)

    def select(self, select_data):
        item_idx = select_data
        modified_vis = set()
        if isinstance(item_idx, list):
            item_idx = [i + 1 for i in item_idx]
        elif item_idx == -1:
            self.texdf.select_vis_element("table", -1)
        else:
            item_idx += 1

        modified_vis.add("table")
        self.texdf.select_vis_element("table", item_idx)
        # TODO: if coordinating, do some other selects on the linked view(S)
        links = self.texdf.get_vis_links("table")
        for l in links:
            # each link is an integer vis index
            target_vis_type = self.texdf.get_vis(l).vis_type
            modified_vis.add(l)

            if item_idx == -1:
                self.texdf.select_vis_element(l, -1)
            elif target_vis_type is VisType.barchart:
                # handle coordinating many -> 1 or many -> many with vis like barchart
                coord_idx = self.texdf.get_coordination_idx("top_scores_target")
                if isinstance(select_data, list):
                    # select all words in barchart
                    target_rows = []
                    for row in select_data:
                        barchart_indexes = coord_idx[row]
                        for b in barchart_indexes:
                            target_rows.append(b + 1)
                    self.texdf.select_vis_element(l, target_rows)
                else:
                    # select just the word corresponding to the number
                    target_rows = []
                    barchart_indexes = coord_idx[row]
                    for b in barchart_indexes:
                        target_rows.append(b + 1)
                    self.texdf.select_vis_element(l, target_rows)
            else:
                # default value is linked to a scatterplot, no cardinality change required
                self.texdf.select_vis_element(l, item_idx)
        for idx, v in enumerate(self.texdf.visualizations):
            if idx not in modified_vis:
                self.texdf.select_vis_element(idx, -1)

