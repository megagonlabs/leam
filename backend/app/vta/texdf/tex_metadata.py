from enum import Enum
from typing import List
from ..types import VTAColumnType


class MetadataItem:
    tag: str
    column: str
    md_type: VTAColumnType

    def __init__(self, tag, col_name, meta_type, metadata):
        self.tag = tag
        self.column = col_name
        self.md_type = meta_type
        self.value = metadata

    def __str__(self):
        output = "%s: %s\n" % (self.md_type, self.value)
        return output
