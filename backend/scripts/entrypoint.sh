#!/bin/sh
rm *.pkl
flask db upgrade
flask run --host=0.0.0.0 --port=5000

