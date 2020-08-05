import re, json, uuid, csv, os, time
import pandas as pd
import pickle
import scipy
from io import StringIO
from flask import jsonify, request
from flask_cors import CORS

# from sqlalchemy import create_engine, select, MetaData, Table, Column, Integer, String
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import sessionmaker
from explorer_app.api import v1
from explorer_app import log
from explorer_app.models import Dataset
from explorer_app.texdf import tex_df

from explorer_app import db


POSTGRES = {
    "user": "postgres",
    "pw": "example",
    "db": "db",
    "host": "postgres",
    "port": "5432",
}

SQLALCHEMY_DATABASE_URI = (
    "postgresql://%(user)s:\
%(pw)s@%(host)s:%(port)s/%(db)s"
    % POSTGRES
)
CORS(v1)


@v1.route("/get-datasets", methods=(["GET"]))
def get_datasets():
    log.info("In get datsets endpoint!")
    datasets = Dataset.query.all()
    return jsonify({"datasets": [dataset.to_json() for dataset in datasets]})


@v1.route("/get-datasets/<string:name>", methods=(["GET"]))
def get_dataset(name):
    start_time = time.time()
    num_rows = int(request.headers.get("numrows"))
    log.info(
        "Getting single dataset with name: {} and numrows: {}".format(name, num_rows)
    )
    # engine = create_engine(SQLALCHEMY_DATABASE_URI)
    # Session = sessionmaker()
    # Session.configure(bind=engine)
    # session = Session()
    # query = session.query(Dataset).filter(Dataset.name == name)
    # dataset_row = query.first()
    # table_name = dataset_row.table_name
    # log.info("Got table name -> {}".format(table_name))

    read_start_time = time.time()
    # check if session dataframe has been stored
    dataset_name = name.split(".")[0]
    dataframe_pkl_file = "/app/" + dataset_name + ".pkl"
    if os.path.exists(dataframe_pkl_file):
        log.info("reading pickle file from fs")
        tex_dataframe = pickle.load(open(dataframe_pkl_file, "rb"))
    else:
        raise Exception("[get-dataset] no pickle file found!")

    read_time_diff = time.time() - read_start_time
    log.info("[TIME] get dataset READ DATAFRAME took %s seconds", read_time_diff)

    tex_df_values = tex_dataframe.get_df_values()
    tex_df_columns = json.dumps(tex_dataframe.get_df_columns())
    tex_df_visual_encodings = json.dumps(tex_dataframe.get_visual_encodings())
    tex_df_types = json.dumps(tex_dataframe.get_df_types())
    tex_df_idx = json.dumps(tex_dataframe.get_idx())
    log.info("first row of df: ")
    log.info(tex_df_values[0])
    time_diff = round(time.time() - start_time, 3)
    log.info("[TIME] get dataset took %d seconds", time_diff)

    tex_df_rows = json.dumps(tex_df_values)

    return jsonify(
        {
            "rows": tex_df_rows,
            "columns": tex_df_columns,
            "columnTypes": tex_df_types,
            "encodings": tex_df_visual_encodings,
            "vis_idx": tex_df_idx,
        }
    )


@v1.route("/upload-file", methods=(["POST"]))
def upload_file():
    log.info("In upload file endpoint!")
    formKeys = request.form.keys()
    for i in formKeys:
        log.info(i)
    file_name = request.form["filename"]
    file_type = request.form["filetype"]
    file_text = request.form["filedata"]
    # file_lines = re.split('[\n|\r]+', file_text)
    file = StringIO(file_text)
    # reader = csv.reader(file, delimiter=",")
    df = pd.read_csv(file)
    dataset_pkl_name = "/app/" + file_name.split(".")[0] + ".pkl"
    tdf = tex_df.TexDF(df)
    pickle.dump(tdf, open(dataset_pkl_name, "wb"))

    header = [i for i in df.columns]
    include_header = []
    ignore_header = []
    for col in header:
        if col == "id" or col == "" or col == " ":
            ignore_header.append(col)
        else:
            include_header.append(col)

    log.info("header of file -> {}".format(include_header))

    # # Encoding Dataset object to insert into postgres
    encoded_header = json.dumps(include_header)
    pg_table_name = generate_pg_tablename(file_name, 0)
    dataset = Dataset(
        name=file_name,
        type=file_type,
        num_rows=len(df.index),
        table_name=pg_table_name,
        header=encoded_header,
    )
    db.session.add(dataset)
    db.session.commit()

    # # Now dynamically create new table with the contents of file
    # column_names = ["id"]
    # column_types = [Integer]
    # primary_key_flags = [True]
    # nullable_flags = [False]
    # for col in include_header:
    #     column_names.append(col)
    #     column_types.append(String)
    #     primary_key_flags.append(False)
    #     nullable_flags.append(True)

    # engine = create_engine(SQLALCHEMY_DATABASE_URI)
    # post_meta = MetaData(bind=engine)
    # datasetTable = Table(
    #     pg_table_name,
    #     post_meta,
    #     *(
    #         Column(
    #             column_name,
    #             column_type,
    #             primary_key=primary_key_flag,
    #             nullable=nullable_flag,
    #         )
    #         for column_name, column_type, primary_key_flag, nullable_flag in zip(
    #             column_names, column_types, primary_key_flags, nullable_flags
    #         )
    #     ),
    # )
    # datasetTable.create()

    # # insert the dataset data in the Postgres table
    # conn = engine.connect()
    # insert_data = generate_insert_statements(file_lines[1:], header, ignore_header)
    # conn.execute(datasetTable.insert(), insert_data)

    return jsonify(success=True)


# def extract_header(header_text):
#   fields = []
#   field_list = header_text.split(',')
#   for f in field_list:
#     stripped = f.lower()
#     stripped.replace(" ", "")
#     if len(stripped) > 0:
#       fields.append(stripped)
#   return fields


def generate_pg_tablename(file_name, version):
    id = uuid.uuid4()
    pg_table_id = str(id).replace("-", "_")
    pg_table_id = "table_" + pg_table_id + "_" + str(version)
    return pg_table_id


def generate_insert_statements(dataset_rows, header, ignore_header):
    inserts = []
    count = 0
    for row in dataset_rows:
        pg_row = {}
        # row_cells = row.split(',')
        if count == 0:
            log.info(header)
            log.info(row)
        # log.info(row_cells)
        if len(row) <= 1:
            continue

        for i, cell in enumerate(row):
            if header[i] not in ignore_header:
                pg_row[header[i]] = row[i]

        if count == 0:
            log.info(pg_row)

        inserts.append(pg_row)
        count += 1
    return inserts
