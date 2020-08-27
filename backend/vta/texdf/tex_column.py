from typing import List, Dict, Any
from .tex_metadata import MetadataItem
from ..types import VTAColumnType


class TexColumn:
    col_name: str
    col_type: VTAColumnType
    metadata: Dict[str, MetadataItem]

    def __init__(self, column_name, col_type):
        self.col_name = column_name
        self.col_type = col_type
        self.metadata = {}

    def get_col_type(self):
        return self.col_type

    def get_metadata_by_tag(self, tag):
        return self.metadata[tag]

    def __str__(self):
        output = "[" + "".join([str(i) for i in self.metadata]) + "]"
        return output
