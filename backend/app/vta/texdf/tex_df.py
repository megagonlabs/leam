import spacy
import json, os
import dill as pickle
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
    table_links: []
    columns: Dict[str, TexColumn]
    visualizations: List[TexVis]
    coordination_indexes: Dict[str, Dict]
    udf: Dict[str, Any]  # TODO: specify typing of function expected

    def __init__(self, df, name):
        self.dataset_name = name
        self.data_view = df
        self.table_view = []
        self.table_links = []
        self.columns = {i: TexColumn(i, VTAColumnType.TEXT) for i in df.columns}
        self.visualizations = []
        self.coordination_indexes = {}
        self.udf = {}
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
            for _, md in col.metadata.items():
                all_metadata.append(
                    {"tag": md.tag, "type": md.md_type.value, "value": md.value}
                )
        return all_metadata

    def print_metadata(self):
        # metadata will be a table with 3 columns: tag | data_type | data
        pretty_print = ""
        for _, col in self.columns.items():
            for _, md in col.metadata.items():
                col_metadata_item = {}
                col_metadata_item["column"] = col.col_name
                col_metadata_item["tag_name"] = md.tag
                col_metadata_item["metadata_type"] = md.md_type.value
                col_metadata_item["value"] = str(md.value)[:80] + "..."
                pretty_print += str(col_metadata_item) + "\n\n"
        print(pretty_print)

    def get_vis_lookup_table(self, vis_idx):
        return self.visualizations[vis_idx].row_lookup_table

    def get_coordination_idx(self, metadata_name):
        return self.coordination_indexes[metadata_name]

    def get_vis_links(self, vis_idx):
        if vis_idx == "table":
            return self.table_links
        return self.visualizations[vis_idx].links

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
            if md_tag == "top_scores":
                tw_list = [(k, v) for k, v in data.value.items()]
                tw_list = sorted(tw_list, key=lambda word: word[1], reverse=True)
                tw_list = [(v[0], v[1], i + 1) for i, v in enumerate(tw_list)]
                # log.info("top words list:")
                # log.info(tw_list)
                for v in tw_list:
                    vega_rows.append({"topword": v[0], "score": v[1], "order": v[2]})
            else:
                print("data is: ")
                print(data.value)
                assert isinstance(data.value, dict)
                for label, count in data.value.items():
                    vega_rows.append({"label": label, "count": count})

        return vega_rows

    def get_udf(self, func_name):
        return self.udf[func_name]

    # TODO: specify a certain function params/return values
    def add_udf(self, func):
        self.udf[func.__name__] = func
        self.checkpoint_texdf()

    def print_udfs(self):
        print(self.udf)

    def rename_column(self, old_col, new_col):
        self.data_view = self.data_view.rename(columns={old_col: new_col})
        self.columns[new_col] = self.columns[old_col]
        del self.columns[old_col]
        self.update_table_view()
        task = {"view": "table", "type": "update_column"}
        self.add_to_uiq(task)
        self.checkpoint_texdf()

    # TODO: add regex to this
    def replace_column_value(self, col_name, old_value, new_value):
        # data_view["category"].replace("ham", 0, inplace=True)
        self.data_view[col_name].replace(old_value, new_value, inplace=True)
        self.update_table_view()
        task = {"view": "table", "type": "update_column"}
        self.add_to_uiq(task)
        self.checkpoint_texdf()

    def select_vis_element(self, vis_idx, item_idx):
        # TODO: add support for words in select like in topwords tf-idf barchart
        # TODO: add support for linking, where we might generate many new select ui tasks
        if vis_idx == "table":
            task = {"view": "table", "type": "select", "rows": item_idx}
        else:
            task = {
                "view": "datavis",
                "type": "select",
                "vis_idx": vis_idx,
                "rows": item_idx,
            }
        self.add_to_uiq(task)
        self.checkpoint_texdf()

    def add_coord_idx(self, metadata, coord_idx):
        self.coordination_indexes[metadata] = coord_idx
        self.checkpoint_texdf()

    def remove_vis(self, vis_idx):
        if vis_idx < 0 or vis_idx >= len(self.visualizations):
            return
        # remove vis in place and save
        del self.visualizations[vis_idx]
        for v in self.visualizations:
            if vis_idx in v.links:
                v.links.remove(vis_idx)
        # update the rest of the links to correspond to their new positions
        for v in self.visualizations:
            for link_idx, link in enumerate(v.links):
                if vis_idx > link:
                    pass
                elif vis_idx < link:
                    v.links[link_idx] = link - 1
                else:
                    raise Exception(
                        "there should be no link with vis idx %d it was deleted",
                        vis_idx,
                    )
        task = {
            "view": "table",
            "type": "update_vis",
        }  # change this to be related to vis
        self.add_to_uiq(task)
        self.checkpoint_texdf()

    def remove_link(self, src, target):
        if src == "table":
            vis_obj = self.table_links
        else:
            vis_obj = self.visualizations[src].links
        if target in vis_obj:
            vis_obj.remove(target)
            self.checkpoint_texdf()

    def add_uni_link(self, src, target):
        if src == "table":
            vis_obj = self.table_links
        else:
            vis_obj = self.visualizations[src].links
        if target not in vis_obj:
            vis_obj.append(target)
            self.checkpoint_texdf()

    def add_bi_link(self, src, target):
        if src == "table":
            vis_obj_src = self.table_links
        else:
            vis_obj_src = self.visualizations[src].links
        if target == "table":
            vis_obj_target = self.table_links
        else:
            vis_obj_target = self.visualizations[target].links
        if target not in vis_obj_src:
            vis_obj_src.append(target)
        if src not in vis_obj_target:
            vis_obj_target.append(src)
        self.checkpoint_texdf()

    def add_visualization(self, columns, vis_type, selection=None, md_tag=None):
        # if aggregate type vis, using metadata, if not using column(s)
        if vis_type == VisType.tw_barchart or vis_type == VisType.barchart:
            data_type = "metadata"
            vis_data = self.get_columns_vega_format(columns, data_type, md_tag=md_tag)
        else:
            data_type = "dataview"
            vis_data = self.get_columns_vega_format(columns, data_type)
        col_types = self.get_column_types(columns)
        new_vis = TexVis(
            vis_type,
            columns,
            col_types,
            vis_data,
            selection_type=selection,
            md_tag=md_tag,
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
