from flask import jsonify, request
from flask_cors import CORS
from . import v1
from .. import log

CORS(v1)
@v1.route('/uploadfile', methods=(['POST']))
def uploadfile():
    log.info("In upload file endpoint!")
    formKeys = request.form.keys()
    for i in formKeys:
        log.info(i)
    log.info(request.form["filename"])
    log.info(request.form["filetype"])
    log.info(request.form["filedata"])
    return jsonify(success=True)
