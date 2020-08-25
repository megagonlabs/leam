"""operators.py - This file defines functiosn for api endpoints
related to running operators on dataset columns."""

import json, os, time
import pandas as pd
from flask import jsonify, request
import pickle
import sys
from io import StringIO
import contextlib

# from sqlalchemy import create_engine, select, MetaData, Table, Column, Integer, String
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import sessionmaker
from . import v1

# from .. import db
from .. import log

# from ..models import Dataset
from vta import VTA
from vta.texdf.tex_df import TexDF

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


@contextlib.contextmanager
def stdoutIO(stdout=None):
    old = sys.stdout
    if stdout is None:
        stdout = StringIO()
    sys.stdout = stdout
    yield stdout
    sys.stdout = old


@v1.route("/run-operator", methods=(["POST"]))
def run_operator():
    start_time = time.time()
    log.info("\n\n-----------------------------------------")
    log.info("Running Operator\n")

    result = {}
    vta_spec = request.json.get("vta_spec")
    spec_view = request.json.get("explorer_view")
    is_vta_script = request.json.get("vta_script_flag")
    log.info("VTA/VITAL command -> %s\n\n", vta_spec)

    if is_vta_script:
        log.info("parsing VITAL command\n")
        try:
            if os.path.exists("vta_session.pkl"):
                vta_session = pickle.load(open("vta_session.pkl", "rb"))
            else:
                vta_session = {}
            VTA_globals = {"pd": pd, "VTA": VTA}
            VTA_locals = vta_session
            code = vta_spec
            # col = None
            # col = data.select().select_column("review")
            with stdoutIO() as s:
                exec(compile(code, "VITAL", "exec"), VTA_globals, VTA_locals)
            for var in VTA_locals:
                log.info("VTA locals var name: %s has value: %s", var, VTA_locals[var])
            if os.path.exists("/app/UI_QUEUE.pkl"):
                UI_QUEUE = pickle.load(open("UI_QUEUE.pkl", "rb"))
            else:
                UI_QUEUE = []
            for task in UI_QUEUE:
                log.info("VTA ui queue has value: %s", task)
            # TODO: check if UI queue has new tasks pushed onto it, need to send these to the front-end
            code_output = s.getvalue()
            log.info("python code output is: %s", code_output)
            vta_session = VTA_locals
            pickle.dump(vta_session, open("vta_session.pkl", "wb"))
        except Exception as e:
            log.error("python command had error: %s", str(e))

        log.debug("generated VTA spec is: %s\n", vta_spec)
        return jsonify({"output": code_output})

    # result = compiler.compile_vta(vta_spec)
    time_diff = round(time.time() - start_time, 3)
    log.info("[PERFORM_OPERATOR] total time was %s seconds", time_diff)
    return jsonify({"result": "true"})
