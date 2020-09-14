from enum import Enum
from typing import List
from .texdf import tex_df
from .texdf import tex_column
from .types import SelectionType, VTAColumnType, ActionType, VisType
from .project import Project
from .mutate import Mutate
from .aggregate import Aggregate


class VTAVisualization:
    """
    Vis object that wraps Tex visualization
    """

    selection_type: SelectionType
    texdf: tex_df.TexDF
    vis_idx: int
    vis_type: VisType

    def __init__(self, texdf, vis_idx):
        self.selection_type = SelectionType.column
        self.texdf = texdf
        self.vis_idx = vis_idx
        vis_obj = texdf.get_vis(vis_idx)
        self.vis_type = vis_obj.vis_type
        self.columns = vis_obj.columns

    # TODO: maybe support target input being VTAVisualization object itself!
    def uni_link(self, target):
        assert self.vis_idx != target
        self.texdf.add_uni_link(self.vis_idx, target)

    def rm_link(self, target):
        assert self.vis_idx != target
        self.texdf.remove_link(self.vis_idx, target)

    def bi_link(self, target):
        assert self.vis_idx != target
        self.texdf.add_bi_link(self.vis_idx, target)

    def select(self, select_data):
        item_idx = select_data
        modified_vis = set()
        if isinstance(item_idx, str):
            # just for now, we can only select a word on a barchart, need to make this more modular
            assert self.vis_type is VisType.tw_barchart
            word = select_data
            item_idx = 1
            vis_data = self.texdf.get_columns_vega_format(
                self.columns, "metadata", md_tag="top_scores"
            )
            for i, val in enumerate(vis_data):
                tw_val = val["topword"]
                if tw_val == word:
                    item_idx = i + 1
        elif isinstance(item_idx, list):
            item_idx = [i + 1 for i in item_idx]
        elif item_idx == -1:
            self.texdf.select_vis_element(self.vis_idx, -1)
        else:
            item_idx += 1

        modified_vis.add(self.vis_idx)
        self.texdf.select_vis_element(self.vis_idx, item_idx)
        # TODO: if coordinating, do some other selects on the linked view(S)
        links = self.texdf.get_vis_links(self.vis_idx)
        for l in links:
            # each link is an integer vis index
            if l == "table":
                target_vis_type = VisType.table
            else:
                target_vis_type = self.texdf.get_vis(l).vis_type
                modified_vis.add(l)

            if item_idx == -1:
                if l == "table":
                    self.texdf.select_vis_element("table", -1)
                else:
                    self.texdf.select_vis_element(l, -1)
            elif self.vis_type is VisType.tw_barchart:

                # handle coordinating 1 -> many with vis like scatterplot
                coord_idx = self.texdf.get_coordination_idx("top_scores_src")
                # should also be able to handle int, could use ordered dict for index
                assert isinstance(select_data, str)
                target_rows = [i + 1 for i in coord_idx[select_data]]
                self.texdf.select_vis_element(l, target_rows)
            elif target_vis_type is VisType.tw_barchart:
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
