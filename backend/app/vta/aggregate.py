from enum import Enum
from typing import List
import pandas as pd
import numpy as np
import spacy
from sklearn.metrics import confusion_matrix
from heapq import nlargest
from collections import OrderedDict
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

    def confusion_matrix(self, md_tag, y_test, predictions, action=ActionType.Add):
        cm = confusion_matrix(y_test, predictions)
        metadata = []
        metadata.append({"Value": cm[0][0], "first": "Not Spam", "second": "Not Spam"})
        metadata.append({"Value": cm[0][1], "first": "Not Spam", "second": "Spam"})
        metadata.append({"Value": cm[1][0], "first": "Spam", "second": "Not Spam"})
        metadata.append({"Value": cm[1][1], "first": "Spam", "second": "Spam"})
        print("confusion matrix metadata: ")
        print(metadata)
        self.texdf.add_metadata(
            self.col_name, "confusion_matrix", VTAColumnType.MAP, metadata
        )
        return "confusion_matrix"

    def count(self, md_tag, action=ActionType.Add):
        rows = self.texdf.get_dataview_column(self.col_name)
        counts = rows.value_counts().to_dict()
        print("counts are: ")
        print(counts)
        self.texdf.add_metadata(
            self.col_name, md_tag, VTAColumnType.MAP, counts
        )
        return md_tag


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
        top_k_words = nlargest(top_k, result, key=result.get)
        result_ordered = OrderedDict({k: result[k] for k in top_k_words})
        # result_ordered = {k: result[k] for k in top_k_words}
        # new_label_idx = {k: idx for idx, k in enumerate(top_k_words)}

        print("top words dict: ")
        print(result)
        self.texdf.add_metadata(
            self.col_name, "top_scores", VTAColumnType.MAP, result_ordered
        )

        # add coordination index
        # tfidf_vectors = np.array([v.todense() for v in df[column]])
        # TODO: make this more efficient
        reverse_idx_src = OrderedDict({l: [] for l in result_ordered.keys()})
        reverse_idx_target = {i: [] for i in range(len(tfidf_vectors))}
        for i in range(len(tfidf_vectors)):
            for j in range(len(names)):
                tfidf_value = tfidf_vectors[i, 0, j]
                if names[j] in top_k_words:
                    if tfidf_value > 0.0:
                        reverse_idx_src[names[j]].append(i)

        label_idx = {k: idx for idx, k in enumerate(reverse_idx_src.keys())}
        for k, v in reverse_idx_src.items():
            for idx in v:
                if reverse_idx_target.get(idx) is None:
                    reverse_idx_target[idx] = [label_idx[k]]
                else:
                    reverse_idx_target[idx].append(label_idx[k])

        print("top_scores_src: ")
        print(reverse_idx_src)

        print("top_scores_target: ")
        print(reverse_idx_target)

        self.texdf.add_coord_idx("top_scores_src", reverse_idx_src)
        self.texdf.add_coord_idx("top_scores_target", reverse_idx_target)
        return "top_scores"
