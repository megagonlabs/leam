from flask import jsonify, request
from flask_cors import CORS
from . import v1
from .. import log

CORS(v1)
@v1.route('/v1/uploadfile', methods=(['POST']))
def uploadfile():
    log.info("In upload file endpoint!")
    log.info(request)
    return jsonify(success=True)


@app.route('/')
def hello_world():
    return 'Hello, World!'