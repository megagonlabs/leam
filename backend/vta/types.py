from enum import Enum


class ColumnType(Enum):
    # regular types
    INT = "Int"
    FLOAT = "Float"
    BOOL = "Bool"
    # text-data types
    TOKEN = "Token"
    SENTENCE = "Sentence"
    TEXT = "Text"
    # data structure types
    VECTOR = "Vector"
    MAP = "Map"
    # custom types
    VISUALIZATION = "Visualization"


class ActionType(Enum):
    Update = "Update"  # update existing column
    Create = "Create"  # create new column
    Add = "Add"  # add metadata to column
    Null = "Null"  # don't do anything with the data


class SelectionType(Enum):
    column = "column"
    vis = "vis"
    metadata = "metadata"


class MetadataType(Enum):
    FEATURE_LABELS = "FEATURE_LABELS"
