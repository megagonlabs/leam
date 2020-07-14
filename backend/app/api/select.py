import pandas as pd
import numpy as np

def projection(df, column, indices):
    column_name_tokens = column.split('-')
    new_columns = []
    for i in indices:
        new_column = column_name_tokens[-1] + '_' + str(i)
        new_columns.append(new_column)
        df[new_column] = df[column].map(lambda x: x[i])
    # need to make return type dynamic
    return new_columns, "float"