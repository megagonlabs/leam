import spacy
import json
from sklearn.feature_extraction.text import TfidfVectorizer
from .. import log

spacy_nlp = spacy.load('en_core_web_sm')

def lowercase(df, column_name):
    df[column_name] = df[column_name].str.lower()
    return

def remove_stopwords_helper(text):
    doc = spacy_nlp(text)
    toks = [token.text for token in doc if not token.is_stop]
    return toks

def remove_stopwords(df, column_name):
    df[column_name] = df[column_name].map(lambda r: remove_stopwords_helper(r))
    return

def basic_tokenizer(sentence):
    doc = spacy_nlp(sentence)
    tokens = [token.text for token in doc]
    return tokens

def generate_tf_idf_features(df, column_name):
    vectorizer = TfidfVectorizer(tokenizer = basic_tokenizer)
    df[column_name] = vectorizer.fit_transform(df[column_name])
    return