import spacy
import json
from sklearn.feature_extraction.text import TfidfVectorizer
from .. import log

spacy_nlp = spacy.load('en_core_web_sm')

def basic_tokenizer(sentence):
    doc = spacy_nlp(sentence)
    tokens = [token.text for token in doc]
    return tokens

def generate_tf_idf_features(df, column_name):
    vectorizer = TfidfVectorizer(tokenizer = basic_tokenizer)
    vectors = vectorizer.fit_transform(df[column_name])
    df[column_name] = [v.toarray().tolist() for v in vectors]
    return vectorizer.get_feature_names()