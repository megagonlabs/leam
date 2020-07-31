import spacy
import json
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from .. import log
from .featurize import *
from .clean import lowercase, remove_stopwords, remove_punctuation
from .select import projection, coordinate

spacy_nlp = spacy.load('en_core_web_sm')

class TexDF(object):
    def __init__(self, df):
        self.df = df
        self.df_types = {i: "string" for i in df.columns}
        # map of column name -> visual encoding data
        self.metadata = {i: {} for i in df.columns}
        self.cached_visual_encodings = {i: {} for i in df.columns}
        self.view_indexes = {}

    def get_df_values(self):
        readable_df = self.df.copy()
        for k, v in self.df_types.items():
            if v == "vector":
                is_column_list = type(readable_df[k][0]) == list
                row_vectors = readable_df[k].map(lambda r: np.array(r).tolist()) if is_column_list else readable_df[k].map(lambda  r: r.toarray().tolist())
                row_vectors =  row_vectors if is_column_list else [r[0] for r in row_vectors]
                row_string_vectors = [[str(f) for f in r] for r in row_vectors]
                row_string_vectors = map(lambda r: r[:10], row_string_vectors)
                row_string_vectors = [", ".join(r) for r in row_string_vectors]
                readable_df[k] = row_string_vectors
            elif v == "float":
                float_column = readable_df[k]
                row_floats = [round(f, 5) for f in float_column]
                readable_df[k] = row_floats


        return readable_df.values.tolist()

    def get_df_columns(self):
        return self.df.columns.tolist()

    def get_df_types(self):
        return self.df_types
    
    def get_metadata(self):
        return self.metadata

    def get_visual_encodings(self):
        return self.cached_visual_encodings

    def get_idx(self):
        return self.view_indexes

    # spec is a json specification that describes what should be used to generate the visualization
    def create_visualization(self, columns, spec):
        # column_types = self.df_types[column]
        column_types = [self.df_types[c] for c in columns]
        if spec == "distribution":
            assert(len(columns) == 1)
            column = columns[0]
            labels = self.metadata[column]
            top_words = generate_tfidf_visualization(self.df, column, labels)
            visual_encoding = get_top_words(top_words)
            return visual_encoding
        elif spec == "scatterplot":
            # generate a list of maps to specific fields
            # do type check logic
            # for i in column_types:
            #     assert(i == "float")
            vega_rows = []
            for _, row in self.df[columns].iterrows():
                vega_row = {c: row[c] for c in columns}
                vega_rows.append(vega_row)
            return vega_rows        
        else:
            # raise Exception('invalid visualization: %s on column %s of type %s', spec, column, column_type)
            return {}
            

    def run_operator(self, columns, operator, action, indices, visualization):
        # do some error handling here
        if operator == "clean":
            if action == "lowercase":
                assert(len(columns) == 1)
                column = columns[0]
                lowercase(self.df, column)
            elif action == "stopword":
                assert(len(columns) == 1)
                column = columns[0]
                remove_stopwords(self.df, column)
            elif action == "punctuation":
                assert(len(columns) == 1)
                column = columns[0]
                remove_punctuation(self.df, column)
        elif operator == "featurize":
            if action == "tfidf":
                # define a new column in the dataframe to assign tf-idf vectors
                assert(len(columns) == 1)
                column = columns[0]
                new_column = column + "-tfidf"
                spec = "distribution" # hard-code this spec for now, but it could be a dynamic json spec in the future
                feature_names = generate_tfidf_features(self.df, column, new_column)
                self.df_types[new_column] = "vector"
                self.metadata[new_column] = feature_names
                encoding = self.create_visualization([new_column], spec)
                self.cached_visual_encodings[new_column] = {"distribution": encoding}
            elif action == 'pca':
                assert(len(columns) == 1)
                column = columns[0]
                new_column = column + '-pca'
                spec = "scatterplot" # hard-code this spec for now, but it could be dynamic json in future, also put this in separate visualization operator
                generate_pca_features(self.df, column, new_column)
                self.df_types[new_column] = "vector"
                self.metadata[new_column] = {"num_components": 10}
            elif action == 'kmeans':
                assert(len(columns) == 1)
                column = columns[0]
                new_column = column + '-kmeans'
                generate_kmeans_clusters(self.df, column, new_column)
                self.df_types[new_column] = "float"
                self.metadata[new_column] = {"num_clusters": 5}
            elif action == "sentiment":
                assert(len(columns) == 1)
                column = columns[0]
                new_column = column + '-sentiment'
                generate_sentiment_features(self.df, column, new_column)
                self.df_types[new_column] = "float"
        elif operator == "select":
            if action == "projection":
                assert(len(columns) == 1)
                column = columns[0]
                new_columns, column_type = projection(self.df, column, indices)
                for nc in new_columns:
                    self.df_types[nc] = column_type
            elif action == "visualization":
                spec = "scatterplot" # need to make this part of vta inference, or user can define their own spec maybe?
                visual_encoding = self.create_visualization(columns, spec)
                vis_name = '<' + '_'.join(columns) + '>'
                self.cached_visual_encodings[vis_name] = {"scatterplot": visual_encoding}
            elif action == "coordination":
                column = columns[0]
                labels = self.metadata[column]
                log.info('[Coordinate]: labels are -> %s', labels.__str__())
                self.view_indexes["barchart"] = coordinate(self.df, column, labels)
        else:
            raise Exception('unknown operator: %s', operator)
    
