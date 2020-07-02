import spacy
import json
from sklearn.feature_extraction.text import TfidfVectorizer
from .. import log

spacy_nlp = spacy.load('en_core_web_sm')

def lowercase(dirty_rows, column_name):
    cleaned_rows = []
    for row in dirty_rows:
        clean_row = row
        clean_row[column_name] = row[column_name].lower()
        cleaned_rows.append(clean_row)
    return cleaned_rows

def remove_stopwords(dirty_rows, column_name):
    cleaned_rows = []
    for row in dirty_rows:
        clean_row = row
        doc = spacy_nlp(row[column_name])
        toks = [token.text for token in doc if not token.is_stop]
        clean_row[column_name] = json.dumps(toks)
        cleaned_rows.append(clean_row)
        log.info("clean row:")
        log.info(clean_row)
    return cleaned_rows

def basic_tokenizer(sentence):
    doc = spacy_nlp(sentence)
    tokens = [token.text for token in doc]
    return tokens

def generate_tf_idf_features(dirty_rows, column_name):
    cleaned_rows = []
    tf_idf_rows = [row[column_name] for row in dirty_rows]
    vectorizer = TfidfVectorizer(tokenizer = basic_tokenizer)
    tf_idf_vector = vectorizer.fit_transform(tf_idf_rows)
    labels = vectorizer.get_feature_names()
    assert(len(tf_idf_vector[0]) == len(labels))

    for i, row in enumerate(dirty_rows):
        clean_row = row
        tf_labeled = {}
        tf_idf_row = tf_idf_vector[i]
        for j, score in enumerate(tf_idf_row):
            tf_labeled[labels[j]] = score
        
        clean_row[column_name] = json.dumps(tf_labeled)
        cleaned_rows.append(clean_row)
    return cleaned_rows