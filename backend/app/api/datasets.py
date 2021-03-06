import re, json, uuid, csv, os, time
import pandas as pd
import pickle
import scipy
from io import StringIO, BytesIO
from flask import jsonify, request, session, current_app
from flask_cors import CORS
import base64
from sqlalchemy import create_engine, select, MetaData, Table, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.api import v1
from app import log
from app.models import Dataset
from app import db

from ..vta.texdf.tex_df import TexDF
from ..vta import VTA

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


@v1.route("/get-models", methods=(["GET"]))
def get_models():
    m_path = "/app/"
    files = os.listdir(m_path)
    models = []
    for f in files:
        ending = f.split(".")[-1]
        if ending == "h5":
            models.append(f)
    return jsonify({"models": models})


@v1.route("/get-datasets", methods=(["GET"]))
def get_datasets():
    datasets = Dataset.query.all()
    return jsonify({"datasets": [dataset.to_json() for dataset in datasets]})


@v1.route("/reset-dataset/<string:name>", methods=(["GET"]))
def reset_dataset(name):
    log.info("\n\n-----------------------------------------")
    log.info("RESET DATASET: %s\n", name)
    engine = create_engine(current_app.config["SQLALCHEMY_DATABASE_URI"])
    Session = sessionmaker()
    Session.configure(bind=engine)
    session = Session()
    query = session.query(Dataset).filter(Dataset.name == name)
    dataset_row = query.first()
    table_name = dataset_row.table_name
    dataset_name = name.split(".")[0]
    dataframe_pkl_file = "/app/" + dataset_name + ".pkl"
    log.info("deleting dataset pickle file")
    os.remove(dataframe_pkl_file)
    if os.path.exists("/app/UI_QUEUE.pkl"):
        os.remove("/app/UI_QUEUE.pkl")
    if os.path.exists("/app/vta_session.pkl"):
        os.remove("/app/vta_session.pkl")
    log.info("getting dataset from db")
    df = pd.read_sql_table(table_name, current_app.config["SQLALCHEMY_DATABASE_URI"])
    tex_dataframe = TexDF(df, name)
    pickle.dump(tex_dataframe, open(dataframe_pkl_file, "wb"))
    return jsonify(success=True)


@v1.route("/get-datasets/<string:name>", methods=(["GET"]))
def get_dataset(name):
    log.info("\n\n-----------------------------------------")
    log.info("Retrieving Dataset\n")

    read_start_time = time.time()
    # check if session dataframe has been stored
    # use vta dataset load command instead
    engine = create_engine(current_app.config["SQLALCHEMY_DATABASE_URI"])
    Session = sessionmaker()
    Session.configure(bind=engine)
    session = Session()
    query = session.query(Dataset).filter(Dataset.name == name)
    dataset_row = query.first()
    table_name = dataset_row.table_name
    dataset_name = name.split(".")[0]
    dataframe_pkl_file = "/app/" + dataset_name + ".pkl"
    if os.path.exists(dataframe_pkl_file):
        log.info("reading pickled dataset")
        tex_dataframe = pickle.load(open(dataframe_pkl_file, "rb"))
    else:
        log.info("getting dataset from db")
        df = pd.read_sql_table(
            table_name, current_app.config["SQLALCHEMY_DATABASE_URI"]
        )
        tex_dataframe = TexDF(df, name)
        pickle.dump(tex_dataframe, open(dataframe_pkl_file, "wb"))

    tex_df_values = tex_dataframe.get_table_view()
    tex_df_columns = json.dumps(tex_dataframe.get_table_view_columns())
    tex_df_metadata = json.dumps(tex_dataframe.get_all_metadata())
    tex_vis_list = json.dumps(tex_dataframe.get_visualizations())
    tex_df_types = json.dumps(tex_dataframe.get_all_column_types())
    # tex_df_idx = json.dumps(tex_dataframe.get_idx())
    tex_df_rows = json.dumps(tex_df_values)

    return jsonify(
        {
            "rows": tex_df_rows,
            "columns": tex_df_columns,
            "metadata": tex_df_metadata,
            "visualizations": tex_vis_list,
            "columnTypes": tex_df_types,
            # "encodings": tex_df_visual_encodings,
            # "vis_idx": tex_df_idx,
        }
    )


@v1.route("/upload-model", methods=(["POST"]))
def upload_model():
    log.info("\n\n-----------------------------------------")
    log.info("Uploading Model\n")
    formKeys = request.form.keys()
    model_name = request.form["modelName"]
    model_data = request.form["modelData"]
    model_data = model_data.split(",")[1]
    model_bytes = base64.b64decode(model_data)
    if not (model_name == "disaster_tweets.h5" or model_name == "sms_spam.h5"):
        log.info("rejecting data upload for model: %s", model_name)
        return jsonify(success=False)
    # file = BytesIO(model_data)
    # model_bytes = file.read()
    file_name = "/app/" + model_name
    with open(file_name, "wb") as f:
        f.write(model_bytes)
    return jsonify(success=True)


@v1.route("/upload-file", methods=(["POST"]))
def upload_file():
    log.info("\n\n-----------------------------------------")
    log.info("Uploading Dataset\n")
    formKeys = request.form.keys()
    file_name = request.form["filename"]
    file_type = request.form["filetype"]
    file_text = request.form["filedata"]
    if not (
        file_name == "reviews.csv"
        or file_name == "tweets.csv"
        or file_name == "spam.csv"
    ):
        log.info("rejecting data upload for file: %s", file_name)
        return jsonify(success=False)

    # file_lines = re.split('[\n|\r]+', file_text)
    file = StringIO(file_text)
    reader = csv.reader(file, delimiter=",")
    file_lines = [row for row in reader]
    file_rows = len(file_lines) - 1
    header = file_lines[0]
    include_header = []
    ignore_header = []
    for col in header:
        if col == "id" or col == "" or col == " ":
            ignore_header.append(col)
        else:
            include_header.append(col)

    # # Encoding Dataset object to insert into postgres
    encoded_header = json.dumps(include_header)
    pg_table_name = generate_pg_tablename(file_name, 0)
    dataset = Dataset(
        name=file_name,
        type=file_type,
        num_rows=file_rows,
        table_name=pg_table_name,
        header=encoded_header,
    )
    db.session.add(dataset)
    db.session.commit()

    # Now dynamically create new table with the contents of file
    column_names = ["id"]
    column_types = [Integer]
    primary_key_flags = [True]
    nullable_flags = [False]
    for col in include_header:
        column_names.append(col)
        column_types.append(String)
        primary_key_flags.append(False)
        nullable_flags.append(True)

    engine = create_engine(SQLALCHEMY_DATABASE_URI)
    post_meta = MetaData(bind=engine)
    datasetTable = Table(
        pg_table_name,
        post_meta,
        *(
            Column(
                column_name,
                column_type,
                primary_key=primary_key_flag,
                nullable=nullable_flag,
            )
            for column_name, column_type, primary_key_flag, nullable_flag in zip(
                column_names, column_types, primary_key_flags, nullable_flags
            )
        ),
    )
    datasetTable.create()

    # insert the dataset data in the Postgres table
    conn = engine.connect()
    insert_data = generate_insert_statements(file_lines[1:], header, ignore_header)
    conn.execute(datasetTable.insert(), insert_data)

    return jsonify(success=True)


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
        if len(row) <= 1:
            continue

        for i, cell in enumerate(row):
            if header[i] not in ignore_header:
                pg_row[header[i]] = row[i]

        inserts.append(pg_row)
        count += 1
    return inserts
