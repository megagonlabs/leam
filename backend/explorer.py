from flask import Flask, Blueprint, request, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from app import create_app, db
from app.models import Dataset

app = create_app()
migrate = Migrate(app, db)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)