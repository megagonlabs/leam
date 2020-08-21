import pandas as pd
import pickle
from enum import Enum
from sqlalchemy import create_engine, select, MetaData, Table, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.models import Dataset
from flask import current_app
from vta.column import VTAColumn
from vta.texdf.tex_df import TexDF


class VTA:
    def __init__(self, dataset_name: str, texdf: TexDF):
        # for now assume this is tex dataframe but can be a plain pandas df
        self.dataset = dataset_name
        self.texdf = texdf

    def select(self):
        return Select(self.texdf)


class Select(object):
    def __init__(self, texdf):
        self.texdf = texdf

    def select_column(self, col_name):
        return VTAColumn(self.texdf, col_name)


if __name__ == "__main__":
    df = pd.read_csv("test_reviews_small.csv")
    tdf = TexDF(df)
    data = VTA("test.csv", tdf)
    col = data.select().select_column("review")
    print(col)
    col.project().remove_punctuation()
    new_col = col.mutate().tf_idf()
    col2 = data.select().select_column(new_col)
    print(col2)
    print(col2.print_metadata())
