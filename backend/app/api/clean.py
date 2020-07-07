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
    return " ".join(toks)

def remove_stopwords(df, column_name):
    df[column_name] = df[column_name].map(lambda r: remove_stopwords_helper(r))
    return