import spacy
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans

from .texdf import tex_df
from .types import SelectionType, VTAColumnType, ActionType

nlp = spacy.load("en_core_web_sm")


def basic_tokenizer(sentence):
    doc = nlp(sentence)
    tokens = [token.text for token in doc]
    return tokens


class Mutate:
    selection_type: SelectionType
    texdf: tex_df.TexDF
    col_name: str
    col_type: VTAColumnType

    def __init__(self, selection_type, texdf, column, column_type):
        self.selection_type = selection_type
        self.texdf = texdf
        self.col_name = column
        self.col_type = column_type

    def kmeans(self, action=ActionType.Create):
        column_value = self.texdf.get_dataview_column(self.col_name)
        tfidf_vectors = [v.todense() for v in column_value]
        tfidf_2d = np.vstack(tfidf_vectors)
        tfidf_2d = [list(v) for v in tfidf_2d.A]
        tfidf_2d = np.stack(tfidf_2d, axis=0)
        kmeans = KMeans(n_clusters=6, n_init=10).fit(tfidf_2d)
        cluster_preds = kmeans.predict(tfidf_2d)
        # log.info(
        #     "the first 5 cluster values are: %s",
        #     ", ".join([str(c) for c in cluster_preds[:5]]),
        # )
        col_name_prefix = self.col_name.split("_")[0]
        new_col_name = col_name_prefix + "_kmeans"
        if action is ActionType.Create:
            self.texdf.create_dataview_column(
                new_col_name, VTAColumnType.INT, cluster_preds
            )
            return new_col_name
        else:
            raise Exception(
                "[kmeans] unknown action performed on column: %s", self.col_name,
            )

    def tf_idf(self, action=ActionType.Create, metadata=ActionType.Add):
        column_value = self.texdf.get_dataview_column(self.col_name)
        vectorizer = TfidfVectorizer(tokenizer=basic_tokenizer)
        vectors = vectorizer.fit_transform(column_value)
        tfidf_vectors = list(vectors)
        new_column_name = self.col_name + "_tf_idf"
        if action is ActionType.Create:
            self.texdf.create_dataview_column(
                new_column_name, VTAColumnType.VECTOR, tfidf_vectors
            )
            # handling metadata
            if metadata is ActionType.Add:
                feature_labels = vectorizer.get_feature_names()
                self.texdf.add_metadata(
                    new_column_name,
                    "feature_labels",
                    VTAColumnType.VECTOR,
                    feature_labels,
                )
            return new_column_name

        elif action is ActionType.Update:
            self.texdf.update_dataview_column(
                self.col_name, VTAColumnType.VECTOR, tfidf_vectors
            )
            if metadata is ActionType.Add:
                feature_labels = vectorizer.get_feature_names()
                self.texdf.add_metadata(
                    self.col_name,
                    "feature_labels",
                    VTAColumnType.VECTOR,
                    feature_labels,
                )
        else:
            raise Exception(
                "[tf_idf] unknown action performed on column: %s", self.col_name,
            )

    def num_words(self, action=ActionType.Create):
        column_value = self.texdf.get_dataview_column(self.col_name)
        words = column_value.str.split().map(lambda x: len(x))
        new_col_name = self.col_name + "_nwords"
        if action is ActionType.Create:
            self.texdf.create_dataview_column(new_col_name, VTAColumnType.INT, words)
            return new_col_name
        else:
            raise Exception(
                "[num_words] unknown action performed on column: %s", self.col_name,
            )
