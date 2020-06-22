import re
import json
from flask import jsonify, request
from flask_cors import CORS
from . import v1
from .. import log
from ..models import Dataset
from app import db

CORS(v1)
@v1.route('/uploadfile', methods=(['POST']))
def uploadfile():
  log.info("In upload file endpoint!")
  formKeys = request.form.keys()
  for i in formKeys:
    log.info(i)
  file_name = request.form["filename"]
  file_type = request.form["filetype"]
  file_text = request.form["filedata"]
  file_lines = re.split('\n|\r', file_text)
  file_rows = len(file_lines) - 1 # to account for header
  header = extract_header(file_lines[0])
  log.info("header of file -> {}".format(header))
  
  # Encoding Dataset object to insert into postgres 
  encoded_header = json.dumps(header)
  dataset = Dataset(name=file_name, type=file_type, num_rows=file_rows, version=0, header=encoded_header)
  db.session.add(dataset)
  db.session.commit()

  return jsonify(success=True)


def extract_header(header_text):
  fields = []
  field_list = header_text.split(',')
  for f in field_list:
    stripped = f.lower()
    stripped.replace(" ", "")
    if len(stripped) > 0:
      fields.append(stripped)
  return fields

# def insert_file_metadata(filename, filetype, file)

