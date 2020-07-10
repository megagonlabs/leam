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
    tw_final_list = []
    tw_list = [(k,v) for k,v in top_words.items()]
    tw_list = sorted(tw_list, key=lambda word: word[1], reverse=True)
    tw_list = [(v[0], v[1], i+1) for i,v in enumerate(tw_list)]
    log.info("top words list:")
    log.info(tw_list)
    for v in tw_list:
        tw_final_list.append({'topword': v[0], 'score': v[1], 'order': v[2]})
    return tw_final_list

def generate_tfidf_visualization(df, column, labels):
    vectors, names = df[column], labels
    tfidf_vectors = np.array([v.todense() for v in vectors])
    tfidf_vectors[tfidf_vectors == 0] = np.nan
    means = np.nanmean(tfidf_vectors, axis=0)
    means = dict(zip(names, means.tolist()[0]))

    tfidf_vectors = np.array([v.todense() for v in vectors])
    # print(means)
    ordered = np.argsort(tfidf_vectors*-1)
    # ordered = ordered
    log.info(means)
    log.info(ordered)

    top_k = 50
    result = { }
    for i in range(len(tfidf_vectors)):
        # Pick top_k from each argsorted matrix for each doc
        for t in range(top_k):
            # Pick the top k word, find its average tfidf from the
            # precomputed dictionary using nanmean and save it to later use
            result[names[ordered[i, 0, t]]] = means[names[ordered[i, 0, t]]]

    # tfidf_word_list = result.items()
    # flat_list = sorted(tfidf_word_list, key=lambda tup: tup[1])
    # log.info(flat_list)
    log.info(result)
    return result


def generate_tfidf_features(df, oldColumn, newColumn):
    vectorizer = TfidfVectorizer(tokenizer = basic_tokenizer)
    tfidf = vectorizer.fit_transform(df[oldColumn])
    df[newColumn] = list(tfidf)
    return vectorizer.get_feature_names()