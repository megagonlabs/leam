"""operators.py - This file defines functiosn for api endpoints
related to running operators on dataset columns."""

import json, os, time
import pandas as pd
from flask import jsonify, request

# from sqlalchemy import create_engine, select, MetaData, Table, Column, Integer, String
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import sessionmaker
from . import v1

# from .. import db
from .. import log

# from ..models import Dataset
from explorer_app.compiler import compiler
from explorer_app.compiler.vtascript_parser import VTALoader

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


@v1.route("/run-operator", methods=(["POST"]))
def run_operator():
    start_time = time.time()
    log.info("In run operator endpoint!")

    vta_spec = request.json.get("vta_spec")
    is_vta_script = request.json.get("vta_script_flag")
    log.info("VTA spec -> %s", vta_spec)

    if is_vta_script:
        log.info("parsing VTA script...")
        VTA_parser.parseVTAScript(vta_spec)
        return jsonify({"success": False})

    success = compiler.compile_vta(vta_spec)
    time_diff = round(time.time() - start_time, 3)
    log.info("[PERFORM_OPERATOR] total time was %s seconds", time_diff)
    return jsonify({success: success})
