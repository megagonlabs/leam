#!/bin/sh
rm *.pkl
flask db upgrade
# flask run --host=0.0.0.0 --port=5000
exec gunicorn -w 9 --threads 12 -b :5000 explorer:app --preload

