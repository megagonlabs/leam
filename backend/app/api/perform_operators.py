"""operators.py - This file defines functiosn for api endpoints
related to running operators on dataset columns."""

import json, os, time
import pandas as pd
import pickle
from flask import jsonify, request
from sqlalchemy import create_engine, select, MetaData, Table, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from . import v1
from .clean import lowercase, remove_stopwords
from .tex_df import TexDF
from .. import db
from .. import log
from ..models import Dataset

POSTGRES = {
    'user': 'postgres',
    'pw': 'example',
    'db': 'db',
    'host': 'postgres',
    'port': '5432'
}

SQLALCHEMY_DATABASE_URI = 'postgresql://%(user)s:\
%(pw)s@%(host)s:%(port)s/%(db)s' % POSTGRES

@v1.route('/run-operator', methods=(['POST']))
def run_operator():
    start_time = time.time()
    log.info('In run operator endpoint!')
    operator, action = request.args.get('operator'), request.args.get('action')
    dataset, columns, indices = request.args.get('dataset'), request.json.get('columns'), request.json.get('indices')
    log.info('operator -> %s , action -> %s', operator, action)
    log.info(' dataset -> %s', dataset)
    if columns is not None:
        log.info('columns -> %s', ', '.join(columns))
    if indices is not None:
        log.info('indices -> %s', ', '.join([str(i) for i in indices]))

    # get unique table name from dataset table
    dataset_info = Dataset.query.filter(Dataset.name == dataset).first()
    log.info('dataset unique table -> %s', dataset_info.table_name)

    read_start_time = time.time()
    # check if we have table dataframe stored
    dataset_name = dataset.split('.')[0]
    dataframe_pkl_file = "/app/" + dataset_name + ".pkl"
    log.info('dataframe pickle file path: %s', dataframe_pkl_file)
    if os.path.exists(dataframe_pkl_file):
        log.info("reading pickled dataframe")
        tex_dataframe = pickle.load(open(dataframe_pkl_file, 'rb'))
    else:
        df = pd.read_sql_table(dataset_info.table_name, SQLALCHEMY_DATABASE_URI)
        tex_dataframe = TexDF(df)
    read_time_diff = time.time() - read_start_time
    log.info('[TIME] get dataset READ DATAFRAME took %s seconds', read_time_diff)


    log.info('first row of table df is: ')
    log.info(tex_dataframe.get_df_values()[0])

    tex_dataframe.run_operator(columns, operator, action, indices)

    log.info('after first row of table df is: ')
    log.info(tex_dataframe.get_df_values()[0])

    time_diff = round(time.time() - start_time, 3)
    log.info('[TIME] run operator took %s seconds', time_diff)
 
    write_time_start = time.time()
    pickle.dump(tex_dataframe, open(dataframe_pkl_file, 'wb'))
    write_time_diff = round(time.time() - write_time_start, 3)
    log.info('[TIME] get dataset WRITE DATAFRAME took %s seconds', write_time_diff)
    return jsonify({})
