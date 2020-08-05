from flask import Flask, Blueprint, request, jsonify
from flask_cors import CORS
from flask_migrate import Migrate, upgrade
from flask_sqlalchemy import SQLAlchemy
from explorer_app import create_app, db
from explorer_app.models import Dataset

app = create_app()
migrate = Migrate(app, db)
# with app.app_context():
#     upgrade("/app/explorer_app/migrations")


# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=5000, threaded=True, processes=4)
