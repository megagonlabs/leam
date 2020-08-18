import pickle
import os
import pandas as pd
from explorer_app.texdf.tex_df import TexDF


def create_pickled_df(name):
    df = pd.read_csv(name + ".csv")
    tex_df = TexDF(df)
    dataframe_pkl_file = "./" + name + ".pkl"
    pickle.dump(tex_df, open(dataframe_pkl_file, "wb"))
    return dataframe_pkl_file


def clean_pickled_df(name):
    os.remove("./" + name + ".pkl")
