import spacy
import json
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from .. import log

spacy_nlp = spacy.load('en_core_web_sm')

class TfIdf(object):
    def __init__(self, df):
        self.df = df
        self.features = []
        # something like {"topword": "fridge", "count": 53}
        self.top_words = {}
    
    def get_top_words(self):
        tw_list = []
        for k,v in self.top_words.items():
            tw_list.append({'topword': k, 'score': v})
        return tw_list

    def basic_tokenizer(self, sentence):
        doc = spacy_nlp(sentence)
        tokens = [token.text for token in doc]
        return tokens

    def generate_features(self, column):
        vectorizer = TfidfVectorizer(tokenizer = self.basic_tokenizer)
        vectors = vectorizer.fit_transform(self.df[column])
        self.df[column] = [v.toarray().tolist() for v in vectors]
        feature_array = np.array(vectorizer.get_feature_names())
        tfidf_sorting = np.argsort(vectors.toarray()).flatten()[::-1]
        tw_list = feature_array[tfidf_sorting][:10]
        self.top_words = {i: 0 for i in feature_array[tfidf_sorting][:10]}
        for row in self.df[column]:
            for i, val in enumerate(row[0]):
                if val > 0 and feature_array[i] in self.top_words.keys():
                    self.top_words[feature_array[i]] = val

        return 