"""operators.py - This file defines functiosn for api endpoints
related to running operators on dataset columns."""

import json
import pandas as pd
import pickle
import os
from flask import jsonify, request
from sqlalchemy import create_engine, select, MetaData, Table, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from . import v1
from .clean import lowercase, remove_stopwords
from .tfidf import TfIdf
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
    log.info('In run operator endpoint!')
    operator, action = request.args.get('operator'), request.args.get('action')
    dataset, column = request.args.get('dataset'), request.args.get('column')
    log.info('operator -> %s , action -> %s', operator, action)
    log.info(' dataset -> %s , column -> %s', dataset, column)

    # get unique table name from dataset table
    dataset_info = Dataset.query.filter(Dataset.name == dataset).first()
    log.info('dataset unique table -> %s', dataset_info.table_name)

    # check if we have table dataframe stored
    dataset_name = dataset.split('.')[0]
    dataframe_pkl_file = "/app/" + dataset_name + ".pkl"
    dataframe_types = "/app/" + dataset_name + "-types.pkl"
    log.info('dataframe pickle file path: %s', dataframe_pkl_file)
    log.info('dataframe types pickle file path: %s', dataframe_types)
    if os.path.exists(dataframe_pkl_file):
        log.info("reading pickled dataframe")
        df = pd.read_pickle(dataframe_pkl_file)
    else:
        df = pd.read_sql_table(dataset_info.table_name, SQLALCHEMY_DATABASE_URI)

    if os.path.exists(dataframe_types):
        log.info("reading pickled dataframe column types!")
        df_types = pd.read_pickle(dataframe_types)
    else:
        column_types = {"column": [i for i in df.columns], "type": ["string" for i in df.columns] }
        df_types = pd.DataFrame(column_types)


    log.info('first row of table df is: ')
    df_list = df.values.tolist()
    log.info(df_list[0])

    # do some error handling here
    if operator == "clean":
        if action == "lowercase":
            lowercase(df, column)
        elif action == "stopword":
            remove_stopwords(df, column)
    elif operator == "featurize":
        if action == "tfidf":
            tdf_idf = TfIdf(df)
            tdf_idf.generate_features(column)
            df_types.loc[df_types['column'] == column, ['type']] = 'tfidf'
            tdfidf_pkl_file = "/app/" + dataset_name + "-tfidf.pkl"
            pickle.dump(tdf_idf, open(tdfidf_pkl_file, 'wb'))


    else:
        raise Exception('unknown operator: %s', operator)

    log.info('after first row of table df is: ')
    log.info(df.values.tolist()[0])
    
    df.to_pickle(dataframe_pkl_file)
    df_types.to_pickle(dataframe_types)


    return jsonify({})

