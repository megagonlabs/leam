import spacy
import json
from sklearn.feature_extraction.text import TfidfVectorizer
from .. import log

spacy_nlp = spacy.load('en_core_web_sm')

def lowercase(df, column_name):
    df[column_name] = df[column_name].str.lower()
    return

def remove_punctuation_helper(token):
    return not token.is_punct

def remove_punctuation(df, column_name):
    filtered_tokens = []
    for doc in spacy_nlp.pipe(df[column_name], n_threads=12):
        tokens = [token.text for token in doc if remove_punctuation_helper(token)]
        filtered_tokens.append(" ".join(tokens))
    df[column_name] = filtered_tokens
    return

def remove_stopwords_helper(text):
    doc = spacy_nlp(text)
    toks = [token.text for token in doc if not token.is_stop]
    return " ".join(toks)

def remove_stopwords(df, column_name):
    df[column_name] = df[column_name].map(lambda r: remove_stopwords_helper(r))
    return