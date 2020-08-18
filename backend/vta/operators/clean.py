import spacy

spacy_nlp = spacy.load("en_core_web_sm")


def lowercase(df, column_name):
    return [df[column_name].str.lower()]


def remove_punctuation_helper(token):
    return not token.is_punct


def remove_punctuation(df, column_name):
    filtered_tokens = []
    for doc in spacy_nlp.pipe(df[column_name], n_threads=12):
        tokens = [token.text for token in doc if remove_punctuation_helper(token)]
        filtered_tokens.append(" ".join(tokens))
    return [filtered_tokens]


def remove_stopwords_helper(text):
    doc = spacy_nlp(text)
    toks = [token.text for token in doc if not token.is_stop]
    return " ".join(toks)


def remove_stopwords(df, column_name):
    return [df[column_name].map(remove_stopwords_helper)]
