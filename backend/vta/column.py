from enum import Enum
from typing import List
from .texdf import tex_df
from .texdf import tex_column
from vta.types import SelectionType, VTAColumnType, ActionType, VisType
from vta.project import Project
from vta.mutate import Mutate
from .aggregate import Aggregate


class VTAColumn:
    """
    VTAColumn initialize with TEXT type column by default
    """

    selection_type: SelectionType
    texdf: tex_df.TexDF
    col_name: str
    col_type: VTAColumnType

    def __init__(self, texdf, column, column_type=VTAColumnType.TEXT):
        self.selection_type = SelectionType.column
        self.texdf = texdf
        self.col_name = column
        self.col_type = column_type

    def __str__(self):
        col_series = self.texdf.get_dataview_column(self.col_name)
        return col_series.to_string()

    def print_metadata(self):
        self.texdf.print_metadata()

    def project(self):
        return Project(self.selection_type, self.texdf, self.col_name, self.col_type)

    def mutate(self):
        return Mutate(self.selection_type, self.texdf, self.col_name, self.col_type)

    def aggregate(self):
        return Aggregate(self.selection_type, self.texdf, self.col_name, self.col_type)

    def visualize(self, vis_type, md_tag=None, selection=None):
        # how do we do multi-col visualizations
        if vis_type == "barchart":
            internal_vis_type = VisType.barchart
            # build target coordination index
            # coord_idx = self.texdf.get_coordination_idx("top_scores_target")
            # coord_idx_new = coord_idx
            # for row, word in coord_idx.values():
            #     tword = coord_idx[row]
            #     barchart_idx = 1
            #     vis_data = self.texdf.get_columns_vega_format(
            #         self.col_name, "metadata", md_tag="top_scores"
            #     )
            #     for i, val in enumerate(vis_data):
            #         tw_val = val["topword"]
            #         if tw_val == tword:
            #             barchart_idx = i + 1
            #             coord_idx_new[row] = barchart_idx
            # self.texdf.add_coord_idx("top_scores_target", coord_idx_new)
        else:
            internal_vis_type = None
        if md_tag == None:
            self.texdf.add_visualization(
                [self.col_name], internal_vis_type, selection=selection
            )
        else:
            self.texdf.add_visualization(
                [self.col_name], internal_vis_type, selection=selection, md_tag=md_tag
            )
