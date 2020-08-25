from enum import Enum
from typing import List
import pandas as pd
import spacy
from .texdf import tex_df
from .types import SelectionType, VTAColumnType, ActionType


spacy_nlp = spacy.load("en_core_web_sm")


class Project:
    selection_type: SelectionType
    texdf: tex_df.TexDF
    col_name: str
    col_type: VTAColumnType

    def __init__(self, selection_type, texdf, column, column_type):
        self.selection_type = selection_type
        self.texdf = texdf
        self.col_name = column
        self.col_type = column_type

    def __str__(self):
        col_series = self.texdf.get_dataview_column(self.col_name)
        return col_series.to_string()

    def lowercase(self, action=ActionType.Update):
        column_value = self.texdf.get_dataview_column(self.col_name)
        new_column_value = column_value.str.lower()
        if action is ActionType.Update:
            self.texdf.update_dataview_column(
                self.col_name, VTAColumnType.TEXT, new_column_value
            )
        else:
            raise Exception(
                "[lowercase] unknown action performed on column: %s", self.col_name
            )

    def remove_punctuation(self, action=ActionType.Update):
        def remove_punc_helper(token):
            return not token.is_punct

        column_value = self.texdf.get_dataview_column(self.col_name)
        filtered_tokens = []
        for doc in spacy_nlp.pipe(column_value, n_threads=12):
            tokens = [token.text for token in doc if remove_punc_helper(token)]
            filtered_tokens.append(" ".join(tokens))

        if action is ActionType.Update:
            self.texdf.update_dataview_column(
                self.col_name, VTAColumnType.TEXT, filtered_tokens
            )
        else:
            raise Exception(
                "[remove_punctuation] unknown action performed on column: %s",
                self.col_name,
            )

    def remove_stopwords(self, action=ActionType.Update):
        column_value = self.texdf.get_dataview_column(self.col_name)

        def remove_stopwords_helper(text):
            doc = spacy_nlp(text)
            toks = [token.text for token in doc if not token.is_stop]
            return " ".join(toks)

        new_column_value = column_value.map(remove_stopwords_helper)

        if action is ActionType.Update:
            self.texdf.update_dataview_column(
                self.col_name, VTAColumnType.TEXT, new_column_value
            )
        else:
            raise Exception(
                "[remove_stopwords] unknown action performed on column: %s",
                self.col_name,
            )

