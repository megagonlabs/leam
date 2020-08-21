from enum import Enum
import pandas as pd
from typing import List
from vta.types import MetadataType


class MetadataItem:
    column: str
    md_type: MetadataType

    def __init__(self, col_name, meta_type, metadata):
        self.column = col_name
        self.md_type = meta_type
        self.metadata = metadata

    def __str__(self):
        output = "%s: %s\n" % (self.md_type, self.metadata)
        return output
