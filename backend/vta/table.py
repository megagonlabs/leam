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

    def select(self, item_idx):
        self.texdf.select_vis_element("table", item_idx)

