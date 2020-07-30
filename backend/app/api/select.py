import pandas as pd
import numpy as np
from .. import log

def projection(df, column, indices):
    column_name_tokens = column.split('-')
    new_columns = []
    for i in indices:
        new_column = column_name_tokens[-1] + '_' + str(i)
        new_columns.append(new_column)
        df[new_column] = df[column].map(lambda x: x[i])
    # need to make return type dynamic
    return new_columns, "float"

# just handling visual encoding with type == distribution for now
def coordinate(df, column, labels):
    tfidf_vectors = np.array([v.todense() for v in df[column]])
    reverse_idx = {l: [] for l in labels}
    for i in range(len(tfidf_vectors)):
        for j in range(len(labels)):
            if tfidf_vectors[i, 0, j] > 0.0:
                reverse_idx[labels[j]].append(i)
    log.info('[COORDINATE] reverse idx is -> %s', reverse_idx.__str__())
    return reverse_idx
