from typing import List, Any
from .tex_metadata import MetadataItem
from ..types import VTAColumnType


class TexColumn:
    col_name: str
    col_type: VTAColumnType
    metadata: List[MetadataItem]

    def __init__(self, column_name, col_type):
        self.col_name = column_name
        self.col_type = col_type
        self.metadata = []

    # make sure that an aggregate is returning a data structure with the corresponding rows included
    # b/c will use those to determine coordination
    def add_metadata(self, md_type: VTAColumnType, md_value: Any):
        new_metadata = MetadataItem(self.col_name, md_type, md_value)
        self.metadata.append(new_metadata)

    def get_col_type(self):
        return self.col_type

    def __str__(self):
        output = "[" + "".join([str(i) for i in self.metadata]) + "]"
        return output
