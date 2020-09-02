from enum import Enum
from typing import List
from .texdf import tex_df
from .texdf import tex_column
from vta.types import SelectionType, VTAColumnType, ActionType, VisType
from vta.project import Project
from vta.mutate import Mutate
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

    def select(self, item_idx):
        self.texdf.select_vis_element(self.vis_idx, item_idx)

