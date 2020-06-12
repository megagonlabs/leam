from flask import Flask, Blueprint, request, jsonify
from flask_cors import CORS
import logging

# set up logging
logging.basicConfig(format='[%(filename)s:%(lineno)d%(message)s]\t')
log = logging.getLogger(__name__)
log.setLevel('INFO')
app = Flask(__name__)

bp = Blueprint('api', __name__)
CORS(bp)
@bp.route('/api/uploadfile', methods=(['POST']))
def uploadfile():
    log.info("In upload file endpoint!")
    log.info(request)
    return jsonify(success=True)


app.register_blueprint(bp)



@app.route('/')
def hello_world():
    return 'Hello, World!'


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)