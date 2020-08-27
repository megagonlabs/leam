import pandas as pd
import pickle
import os
from enum import Enum
from sqlalchemy import create_engine, select, MetaData, Table, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.models import Dataset
from flask import current_app
from vta.column import VTAColumn
from vta.texdf.tex_df import TexDF


class VTA:
    def __init__(self, dataset_name: str, texdf=None, started=False):
        # for now assume this is tex dataframe but can be a plain pandas df
        self.dataset = dataset_name
        if started is True:
            name = dataset_name.split(".")[0]
            dataframe_pkl_file = "/app/" + name + ".pkl"
            if os.path.exists(dataframe_pkl_file):
                tex_dataframe = pickle.load(open(dataframe_pkl_file, "rb"))
                self.texdf = tex_dataframe
            else:
                raise Exception("texdf pickle path doesn't exist!")
        else:
            self.texdf = texdf

    def get_column(self, col_name):
        return VTAColumn(self.texdf, col_name)

    def visualize(self, columns, vis_type):
        # create visualization on tex dataframe
        return


if __name__ == "__main__":
    df = pd.read_csv("test_reviews_small.csv")
    tdf = TexDF(df, "test_reviews_small.csv")
    data = VTA("test.csv", tdf)
    col = data.get_column("review")
    # print(col)
    col.project().remove_punctuation()
    new_col = col.mutate().tf_idf()
    # add a column list function and show output on frontend
    col2 = data.get_column(new_col)
    # print(col2)
    # print(col2.print_metadata())
    print(tdf.get_table_view())
