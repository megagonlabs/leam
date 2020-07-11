import spacy
import json
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from .. import log
from .featurize import generate_tfidf_features, generate_tfidf_visualization, get_top_words
from .clean import lowercase, remove_stopwords, remove_punctuation

spacy_nlp = spacy.load('en_core_web_sm')

class TexDF(object):
    def __init__(self, df):
        self.df = df
        self.df_types = {i: "string" for i in df.columns}
        # map of column name -> visual encoding data
        self.metadata = {i: {} for i in df.columns}
        self.cached_visual_encodings = {i: {} for i in df.columns}

    def get_df_values(self):
        readable_df = self.df.copy()
        for k, v in self.df_types.items():
            if v == "vector":
                row_vectors = readable_df[k].map(lambda  r: r.toarray().tolist())
                row_vectors = row_vectors.map(lambda r: r[:50])
                row_string_vectors = [r[0] for r in row_vectors]
                row_string_vectors = [[str(f) for f in r] for r in row_string_vectors]
                row_string_vectors = [", ".join(r) for r in row_string_vectors]
                readable_df[k] = row_string_vectors

        return readable_df.values.tolist()

    def get_df_columns(self):
        return self.df.columns.tolist()

    def get_df_types(self):
        return self.df_types
    
    def get_metadata(self):
        return self.metadata

    def get_visual_encodings(self):
        return self.cached_visual_encodings

    # spec is a json specification that describes what should be used to generate the visualization
    def create_visualization(self, column, spec):
        column_type = self.df_types[column]
        if column_type == "vector" and spec == "distribution":
            labels = self.metadata[column]
            top_words = generate_tfidf_visualization(self.df, column, labels)
            visual_encoding = get_top_words(top_words)
            return visual_encoding
        else:
            # raise Exception('invalid visualization: %s on column %s of type %s', spec, column, column_type)
            return {}
            

    def run_operator(self, column, operator, action):
        # do some error handling here
        if operator == "clean":
            if action == "lowercase":
                lowercase(self.df, column)
            elif action == "stopword":
                remove_stopwords(self.df, column)
            elif action == "punctuation":
                remove_punctuation(self.df, column)
        elif operator == "featurize":
            if action == "tfidf":
                # define a new column in the dataframe to assign tf-idf vectors
                new_column = column + "-tfidf"
                spec = "distribution" # hard-code this spec for now, but it could be a dynamic json spec in the future
                feature_names = generate_tfidf_features(self.df, column, new_column)
                self.df_types[new_column] = "vector"
                self.metadata[new_column] = feature_names
                encoding = self.create_visualization(new_column, spec)
                self.cached_visual_encodings[new_column] = {"distribution": encoding}

        else:
            raise Exception('unknown operator: %s', operator)
    
