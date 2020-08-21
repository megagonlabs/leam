import spacy
from sklearn.feature_extraction.text import TfidfVectorizer

from vta.texdf.tex_df import TexDF
from vta.types import SelectionType, ColumnType, ActionType, MetadataType

nlp = spacy.load("en_core_web_sm")


def basic_tokenizer(sentence):
    doc = nlp(sentence)
    tokens = [token.text for token in doc]
    return tokens


class Mutate:
    selection_type: SelectionType
    texdf: TexDF
    col_name: str
    col_type: ColumnType

    def __init__(self, selection_type, texdf, column, column_type):
        self.selection_type = selection_type
        self.texdf = texdf
        self.col_name = column
        self.col_type = column_type

    def tf_idf(self, action=ActionType.Create, metadata=ActionType.Add):
        column_value = self.texdf.get_dataview_column(self.col_name)
        vectorizer = TfidfVectorizer(tokenizer=basic_tokenizer)
        tfidf_vectors = list(vectorizer.fit_transform(column_value))
        new_column_name = self.col_name + "_tf_idf"
        if action is ActionType.Create:
            self.texdf.create_dataview_column(new_column_name, tfidf_vectors)
            # handling metadata
            if metadata is ActionType.Add:
                feature_labels = vectorizer.get_feature_names()
                metadata = self.texdf.get_column_metadata(new_column_name)
                metadata.add_metadata(MetadataType.FEATURE_LABELS, feature_labels)
            return new_column_name

        elif action is ActionType.Update:
            self.texdf.update_dataview_column(self.col_name, tfidf_vectors)
            if metadata is ActionType.Add:
                feature_labels = vectorizer.get_feature_names()
                metadata = self.texdf.get_column_metadata(self.col_name)
                metadata.add_metadata(feature_labels)
        else:
            raise Exception(
                "[tf_idf] unknown action performed on column: %s", self.col_name,
            )
