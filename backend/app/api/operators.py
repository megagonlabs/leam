"""operators.py - This file defines functiosn for api endpoints
related to running operators on dataset columns."""

import json
from flask import jsonify, request
from sqlalchemy import create_engine, select, MetaData, Table, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from . import v1
from .clean import lowercase
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

def row2dict(row, columns):
    d = {}
    for column in columns:
        d[column] = str(getattr(row, column))

    return d

def extract_version(table_name):
    # pg table name is something like: table_235234_1
    tokens = table_name.split('_')
    return tokens[2]

@v1.route('/run-operator', methods=(['POST']))
def run_operator():
    log.info('In run operator endpoint!')
    operator, action = request.args.get('operator'), request.args.get('action')
    dataset, column = request.args.get('dataset'), request.args.get('column')
    log.info('operator -> %s , action -> %s,', operator, action)
    log.info(' dataset -> %s , column -> %s', dataset, column)

    # get unique table name from dataset table
    dataset_info = Dataset.query.filter(Dataset.name == dataset).first()
    raw_headers = dataset_info.header
    log.info(raw_headers)
    columns = ["id"]
    columns.extend(raw_headers)
    log.info('dataset unique table -> %s', dataset_info.table_name)
    log.info('dataset headers are: ')
    log.info(columns)

    # db setup
    engine = create_engine(SQLALCHEMY_DATABASE_URI)
    conn = engine.connect()

    # get column(s) data from the unique table
    Base = declarative_base()
    table = Table(dataset_info.table_name, Base.metadata, autoload=True, autoload_with=engine)

    rows = conn.execute(select([table]))
    # log.info('first row of column -> %s has vlue -> %s', column, rows)
    row_data = []
    for r in rows:
        # log.info(r[column])
        row_data.append(row2dict(r, columns))

    # transform data using operator 
    cleaned_rows = lowercase(row_data, column)

    # delete * from table
    conn.execute(table.delete())

    # write modified column back to data table
    # table.insert().values(name='foo')
    log.info(cleaned_rows[0])
    conn.execute(table.insert(), cleaned_rows)


    # Session.close_all()

    return jsonify({})

