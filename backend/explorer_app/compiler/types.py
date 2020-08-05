"""
Types module determines the types that the VTA specification language can use,
and any helper functions that might be used for type checking
"""


class Type:
    """
    Type: These are all of the types that VTA inputs/outputs (e.g. columns, metadata can have
    """

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
