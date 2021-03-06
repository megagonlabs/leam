#!/bin/sh
rm *.pkl
rm *.h5
flask db upgrade
cd /app
# flask run --host=0.0.0.0 --port=5000
exec gunicorn -w 9 --threads 9 -b :5000 explorer:app --preload --timeout 30

