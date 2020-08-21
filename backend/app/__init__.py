from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import logging

# DB config stuff
POSTGRES = {
    "user": "postgres",
    "pw": "example",
    "db": "db",
    "host": "postgres",
    "port": "5432",
}


class Config(object):
    SQLALCHEMY_DATABASE_URI = (
        "postgresql://%(user)s:\
%(pw)s@%(host)s:%(port)s/%(db)s"
        % POSTGRES
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    DEBUG = True


# set up logging
logging.basicConfig(format="[%(filename)s:%(lineno)d]\t %(message)s")
log = logging.getLogger(__name__)
log.setLevel("INFO")

# set up DB
db = SQLAlchemy()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    from app.api import v1 as v1_blueprint

    app.register_blueprint(v1_blueprint, url_prefix="/v1")
    return app
