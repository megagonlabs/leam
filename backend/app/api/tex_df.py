import spacy
import json
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from .. import log
from .featurize import generate_tfidf_features, get_top_words
from .clean import lowercase, remove_stopwords, remove_punctuation

spacy_nlp = spacy.load('en_core_web_sm')

class TexDF(object):
    def __init__(self, df):
        self.df = df
        self.df_types = {i: "string" for i in df.columns}
        # map of column name -> visual encoding data
        self.visual_encodings = {i: {} for i in df.columns}
    

    def get_df_values(self):
        return self.df.values.tolist()

    def get_df_columns(self):
        return self.df.columns.tolist()

    def get_df_types(self):
        return self.df_types
    
    def get_visual_encodings(self):
        return self.visual_encodings

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
                top_words = generate_tfidf_features(self.df, column)
                self.df_types[column] = "tfidf"
                self.visual_encodings[column] = get_top_words(top_words)
        else:
            raise Exception('unknown operator: %s', operator)
    
