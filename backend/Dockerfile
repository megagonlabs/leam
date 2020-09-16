FROM frolvlad/alpine-python3

RUN apt-get update \
    && apt-get install -y postgresql-client

ENV FLASK_APP explorer.py
WORKDIR /app
ADD . /app
RUN pip install -r /app/requirements.txt
