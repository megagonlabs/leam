"""operators.py - This file defines functiosn for api endpoints
related to running operators on dataset columns."""

import json
import pandas as pd
import os
from flask import jsonify, request
from sqlalchemy import create_engine, select, MetaData, Table, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from . import v1
from .clean import lowercase, remove_stopwords, generate_tf_idf_features
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
    dataframe_pkl_file = "/app/" + dataset.split('.')[0] + ".pkl"
    log.info("dataframe pickle file path: ")
    log.info(dataframe_pkl_file)
    if os.path.exists(dataframe_pkl_file):
        log.info("reading pickled dataframe")
        df = pd.read_pickle(dataframe_pkl_file)
    else:
        df = pd.read_sql_table(dataset_info.table_name, SQLALCHEMY_DATABASE_URI)

    log.info('first row of table df is: ')
    df_list = df.values.tolist()
    log.info(df_list[0])

    # do some error handling here
    if operator == "clean":
        if action == "lowercase":
            log.info("is in lowercasing branch on column %s", column)
            df[column] = df[column].str.lower()
        elif action == "stopword":
            remove_stopwords(df, column)
    else:
        # for now this means featurize
        if action == "tfidf":
            generate_tf_idf_features(df, column)

    log.info('after first row of table df is: ')
    log.info(df.values.tolist()[0])
    df.to_pickle(dataframe_pkl_file)

    return jsonify({})

