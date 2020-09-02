import spacy
import json, os, pickle
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sqlalchemy import create_engine, select, MetaData, Table, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from typing import List, Dict, Any

from flask import current_app
from app.models import Dataset

# from vta.operators import featurize
# from vta.operators import clean
# from vta.operators import select

# from vta import spacy_nlp
from .tex_column import TexColumn
from .tex_metadata import MetadataItem
from .tex_vis import TexVis
from ..types import VTAColumnType, VisType


class TexDF:
    dataset_name: str
    data_view: pd.DataFrame
    table_view: []
    columns: Dict[str, TexColumn]
    visualizations: List[TexVis]

    def __init__(self, df, name):
        self.dataset_name = name
        self.data_view = df
        self.table_view = []
        self.columns = {i: TexColumn(i, VTAColumnType.TEXT) for i in df.columns}
        self.visualizations = []
        # self.cached_visual_encodings = {i: {} for i in self.df.columns}
        # self.view_indexes = {}
        self.update_table_view()
        if os.path.exists("/app/UI_QUEUE.pkl"):
            self.UI_QUEUE = pickle.load(open("UI_QUEUE.pkl", "rb"))
        else:
            self.UI_QUEUE = []
            pickle.dump(self.UI_QUEUE, open("/app/UI_QUEUE.pkl", "wb"))

    def get_dataview_column(self, col_name: str) -> pd.Series:
        return self.data_view[col_name]

    def get_column_type(self, col_name: str) -> VTAColumnType:
        return self.columns[col_name].col_type

    def get_column_types(self, col_names: List[str]) -> List[VTAColumnType]:
        return [self.columns[col].col_type for col in col_names]

    def get_all_column_types(self) -> List[str]:
        return [self.columns[col].col_type.value for col in self.columns.keys()]

    def get_table_view(self):
        return self.table_view

    def get_table_view_columns(self):
        return [i for i in self.data_view.columns]

    def get_vis(self, i):
        return self.visualizations[i]

    def get_visualizations(self):
        vis_list = [i.to_dict() for i in self.visualizations]
        return vis_list

    def get_column_metadata(self, col_name: str) -> TexColumn:
        return self.columns[col_name]

    def get_all_metadata(self):
        # metadata will be a table with 3 columns: tag | data_type | data
        all_metadata = []
        for _, col in self.columns.items():
            col_metadata = []
            for _, md in col.metadata.items():
                col_metadata_item = []
                col_metadata_item.append(md.tag)
                col_metadata_item.append(md.md_type.value)
                col_metadata_item.append(md.value)
                col_metadata.append(col_metadata_item)
            all_metadata.append(col_metadata)
        return all_metadata

    def get_columns_vega_format(self, columns, data_type, md_tag=None):
        # Take in list of columns, output data from those columns formatted
        # in vega-lite format: [{"id": 1, "x": 0.3}, {"id": 2, "x": 0.7}, ...]
        vega_rows = []
        if data_type == "dataview":
            for _, row in self.data_view[columns].iterrows():
                vega_row = {c: row[c] for c in columns}
                vega_rows.append(vega_row)
        elif data_type == "metadata":
            col_name = columns[0]
            data = self.get_column_metadata(col_name).get_metadata_by_tag(md_tag)
            # add some way to handle different types of metadata
            tw_list = [(k, v) for k, v in data.value.items()]
            tw_list = sorted(tw_list, key=lambda word: word[1], reverse=True)
            tw_list = [(v[0], v[1], i + 1) for i, v in enumerate(tw_list)]
            # log.info("top words list:")
            # log.info(tw_list)
            for v in tw_list:
                vega_rows.append({"topword": v[0], "score": v[1], "order": v[2]})

        return vega_rows

    def select_vis_element(self, vis_idx, item_idx):
        # TODO: add support for words in select like in topwords tf-idf barchart
        # TODO: add support for linking, where we might generate many new select ui tasks
        task = {
            "view": "datavis",
            "type": "select",
            "vis_idx": vis_idx,
            "rows": item_idx
        }
        self.add_to_uiq(task)
        self.checkpoint_texdf()

    def add_visualization(self, columns, vis_type, selection=None, md_tag=None):
        # if aggregate type vis, using metadata, if not using column(s)
        if vis_type == VisType.barchart:
            data_type = "metadata"
            vis_data = self.get_columns_vega_format(columns, data_type, md_tag=md_tag)
        else:
            data_type = "dataview"
            vis_data = self.get_columns_vega_format(columns, data_type)
        col_types = self.get_column_types(columns)
        new_vis = TexVis(
            vis_type, columns, col_types, vis_data, selection_type=selection
        )
        self.visualizations.append(new_vis)
        vis_index = len(self.visualizations) - 1
        task = {
            "view": "datavis",
            "type": "add_vis",
            "idx": vis_index,
            "vis_type": new_vis.vis_type.value,
            "selection_type": new_vis.selection_type,
        }
        self.add_to_uiq(task)
        self.checkpoint_texdf()

    def update_table_view(self):
        readable_df = self.data_view.copy()
        for k, v in self.columns.items():
            col_type = v.col_type
            if col_type == VTAColumnType.VECTOR:
                is_column_list = type(readable_df[k][0]) == list
                row_vectors = (
                    readable_df[k].map(lambda r: np.array(r).tolist())
                    if is_column_list
                    else readable_df[k].map(lambda r: r.toarray().tolist())
                )
                row_vectors = (
                    row_vectors if is_column_list else [r[0] for r in row_vectors]
                )
                row_string_vectors = [[str(f)[:6] for f in r] for r in row_vectors]
                row_string_vectors = map(lambda r: r[:6], row_string_vectors)
                row_string_vectors = [
                    ", ".join(r) + ", ..." for r in row_string_vectors
                ]
                readable_df[k] = row_string_vectors
            elif col_type == VTAColumnType.FLOAT:
                float_column = readable_df[k]
                row_floats = [round(f, 5) for f in float_column]
                readable_df[k] = row_floats

        self.table_view = readable_df.values.tolist()

    def update_dataview_column(
        self, col_name: str, col_type: VTAColumnType, new_column: Any
    ):
        self.data_view[col_name] = new_column
        col = self.columns[col_name]
        col.col_type = col_type
        self.update_table_view()
        task = {"view": "table", "type": "update_column"}
        self.add_to_uiq(task)
        self.checkpoint_texdf()

    def create_dataview_column(
        self, new_col_name: str, col_type: VTAColumnType, new_column: Any
    ):
        self.data_view[new_col_name] = new_column
        self.columns[new_col_name] = TexColumn(new_col_name, col_type)
        task = {"view": "table", "type": "create_column"}
        self.add_to_uiq(task)
        self.update_table_view()
        self.checkpoint_texdf()

    # make sure that an aggregate is returning a data structure with the corresponding rows included
    # b/c will use those to determine coordination
    def add_metadata(
        self, col_name: str, tag: str, md_type: VTAColumnType, md_value: Any
    ):
        new_metadata = MetadataItem(tag, col_name, md_type, md_value)
        col = self.columns[col_name]
        col.metadata[tag] = new_metadata
        task = {"view": "table", "type": "add_metadata"}
        self.add_to_uiq(task)
        # TODO: update table view to create presentable version of metadata???
        self.checkpoint_texdf()

    def add_to_uiq(self, task):
        self.UI_QUEUE.append(task)
        pickle.dump(self.UI_QUEUE, open("UI_QUEUE.pkl", "wb"))

    def checkpoint_texdf(self):
        name = self.dataset_name.split(".")[0]
        dataframe_pkl_file = "/app/" + name + ".pkl"
        pickle.dump(self, open(dataframe_pkl_file, "wb"))

    # def get_visual_encodings(self):
    #     return self.cached_visual_encodings

    # def get_idx(self):
    #     return self.view_indexes

    # # spec is a json specification that describes what should be used to generate the visualization
    # def create_visualization(self, columns, spec):
    #     # column_types = self.df_types[column]
    #     column_types = [self.df_types[c] for c in columns]
    #     if spec == "distribution":
    #         assert len(columns) == 1
    #         column = columns[0]
    #         labels = self.metadata[column]
    #         top_words = featurize.generate_tfidf_visualization(self.df, column, labels)
    #         visual_encoding = featurize.get_top_words(top_words)
    #         return visual_encoding
    #     elif spec == "scatterplot":
    #         # generate a list of maps to specific fields
    #         # do type check logic
    #         # for i in column_types:
    #         #     assert(i == "float")
    #         vega_rows = []
    #         for _, row in self.df[columns].iterrows():
    #             vega_row = {c: row[c] for c in columns}
    #             vega_rows.append(vega_row)
    #         return vega_rows
    #     else:
    #         # raise Exception('invalid visualization: %s on column %s of type %s', spec, column, column_type)
    #         return {}

    # # TODO: use static types for typechecking column operations, different handlers for each type
    # def run_operator(self, columns, operator_class, operator, action, indices=None):
    #     # do some error handling here
    #     if operator == "lowercase":
    #         assert len(columns) == 1
    #         column = columns[0]
    #         new_columns = clean.lowercase(self.df, column)
    #     elif operator == "stopword":
    #         assert len(columns) == 1
    #         column = columns[0]
    #         new_columns = clean.remove_stopwords(self.df, column)
    #     elif operator == "punctuation":
    #         assert len(columns) == 1
    #         column = columns[0]
    #         new_columns = clean.remove_punctuation(self.df, column)
    #     elif operator == "tfidf":
    #         # define a new column in the dataframe to assign tf-idf vectors
    #         assert len(columns) == 1
    #         column = columns[0]
    #         new_column_names = [column + "-tfidf"]
    #         spec = "distribution"  # hard-code this spec for now, but it could be a dynamic json spec in the future
    #         new_columns, feature_names = featurize.generate_tfidf_features(
    #             self.df, column
    #         )
    #         self.df_types[new_column_names[0]] = "vector"
    #         self.metadata[new_column_names[0]] = feature_names
    #         # encoding = self.create_visualization(new_column_names, spec)
    #         # self.cached_visual_encodings[new_column_names[0]] = {
    #         #     "distribution": encoding
    #         # }
    #     elif operator == "pca":
    #         assert len(columns) == 1
    #         column = columns[0]
    #         new_column_names = [column + "-pca"]
    #         spec = "scatterplot"  # hard-code this spec for now, but it could be dynamic json in future, also put this in separate visualization operator
    #         new_columns = featurize.generate_pca_features(self.df, column)
    #         self.df_types[new_column_names[0]] = "vector"
    #         self.metadata[new_column_names[0]] = {"num_components": 10}
    #     elif operator == "kmeans":
    #         assert len(columns) == 1
    #         column = columns[0]
    #         new_column_names = [column + "-kmeans"]
    #         new_columns = featurize.generate_kmeans_clusters(self.df, column)
    #         self.df_types[new_column_names[0]] = "float"
    #         self.metadata[new_column_names[0]] = {"num_clusters": 5}
    #     elif operator == "sentiment":
    #         assert len(columns) == 1
    #         column = columns[0]
    #         new_column_names = [column + "-sentiment"]
    #         new_columns = featurize.generate_sentiment_features(self.df, column)
    #         self.df_types[new_column_names[0]] = "float"
    #     elif operator == "projection":
    #         assert len(columns) == 1
    #         column = columns[0]
    #         new_column_names = [column + "_" + str(i) for i in indices]
    #         new_columns, column_type = select.projection(self.df, column, indices)
    #         for nc in new_column_names:
    #             self.df_types[nc] = column_type
    #     elif operator == "visualization":
    #         log.info("[run-operator] in visualizationi operator")
    #         spec = "scatterplot"  # need to make this part of vta inference, or user can define their own spec maybe?
    #         visual_encoding = self.create_visualization(columns, spec)
    #         vis_name = "<" + "_".join(columns) + ">"
    #         self.cached_visual_encodings[vis_name] = {"scatterplot": visual_encoding}
    #         return
    #     elif operator == "coordination":
    #         column = columns[0]
    #         labels = self.metadata[column]
    #         log.info("[Coordinate]: labels are -> %s", labels.__str__())
    #         self.view_indexes["barchart"] = select.coordinate(self.df, column, labels)
    #         return
    #     else:
    #         raise Exception("unknown operator: %s", operator)

    #     if action == "update":
    #         # update dataframe column(s)
    #         for i, col in enumerate(new_columns):
    #             self.df[columns[i]] = col
    #         # TODO: update metadata if exists
    #     elif action == "create":
    #         # create new dataframe column(s)
    #         for i, col in enumerate(new_columns):
    #             self.df[new_column_names[i]] = col
    #         # TODO: update metadata if exists
