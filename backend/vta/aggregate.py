from enum import Enum
from typing import List
import pandas as pd
import numpy as np
import spacy
from .texdf import tex_df
from .types import SelectionType, VTAColumnType, ActionType


class Aggregate:
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

    def word_scores(self, md_tag, action=ActionType.Add):
        print("in word scores!")
        metadata_dict = self.texdf.get_column_metadata(self.col_name)
        names = metadata_dict.get_metadata_by_tag(md_tag).value
        vectors = self.texdf.get_dataview_column(self.col_name)
        tfidf_vectors = np.array([v.todense() for v in vectors])
        tfidf_vectors[tfidf_vectors == 0] = np.nan
        means = np.nanmean(tfidf_vectors, axis=0)
        means = dict(zip(names, means.tolist()[0]))

        tfidf_vectors = np.array([v.todense() for v in vectors])
        # print(means)
        ordered = np.argsort(tfidf_vectors * -1)
        # ordered = ordered
        # log.info(means)

        # log.info(ordered)

        top_k = 50
        result = {}
        for i in range(len(tfidf_vectors)):
            # Pick top_k from each argsorted matrix for each doc
            for t in range(top_k):
                # Pick the top k word, find its average tfidf from the
                # precomputed dictionary using nanmean and save it to later use
                result[names[ordered[i, 0, t]]] = means[names[ordered[i, 0, t]]]

        # tfidf_word_list = result.items()
        # flat_list = sorted(tfidf_word_list, key=lambda tup: tup[1])
        # log.info(flat_list)
        # log.info(result)
        self.texdf.add_metadata(self.col_name, "top_scores", VTAColumnType.MAP, result)

