import spacy
import json
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from .. import log

spacy_nlp = spacy.load('en_core_web_sm')

def basic_tokenizer(sentence):
    doc = spacy_nlp(sentence)
    tokens = [token.text for token in doc]
    return tokens

# def generate_tf_idf_features(df, column_name):
#     vectorizer = TfidfVectorizer(tokenizer = basic_tokenizer)
#     vectors = vectorizer.fit_transform(df[column_name])
#     df[column_name] = [v.toarray().tolist() for v in vectors]
#     return vectorizer.get_feature_names()

def get_top_words(top_words):
    tw_list = []
    for k,v in top_words.items():
        tw_list.append({'topword': k, 'score': v})
    return tw_list

def generate_tfidf_features(df, column):
    vectorizer = TfidfVectorizer(tokenizer = basic_tokenizer)
    vectors = vectorizer.fit_transform(df[column])
    tf_vectors = [v.toarray().tolist() for v in vectors]
    feature_array = np.array(vectorizer.get_feature_names())
    tfidf_sorting = np.argsort(vectors.toarray()).flatten()[::-1]
    top_words = {i: 0 for i in feature_array[tfidf_sorting][:10]}
    for row in tf_vectors:
        for i, val in enumerate(row[0]):
            if val > 0 and feature_array[i] in top_words.keys():
                top_words[feature_array[i]] = val

    return top_words