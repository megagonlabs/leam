from typing import List, Any
from vta.texdf.tex_metadata import MetadataItem, MetadataType


class TexColumn:
    col_name: str
    metadata: List[MetadataItem]

    def __init__(self, column_name):
        self.col_name = column_name
        self.metadata = []

    def add_metadata(self, md_type: MetadataType, md_value: Any):
        new_metadata = MetadataItem(self.col_name, md_type, md_value)
        self.metadata.append(new_metadata)

    def __str__(self):
        output = "[" + "".join([str(i) for i in self.metadata]) + "]"
        return output
