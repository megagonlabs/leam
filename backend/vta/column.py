from enum import Enum
from typing import List
from .texdf import tex_df
from .texdf import tex_column
from vta.types import SelectionType, VTAColumnType, ActionType
from vta.project import Project
from vta.mutate import Mutate


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
        tex_col = self.texdf.get_column_metadata(self.col_name)
        return tex_col

    def project(self):
        return Project(self.selection_type, self.texdf, self.col_name, self.col_type)

    def mutate(self):
        return Mutate(self.selection_type, self.texdf, self.col_name, self.col_type)
