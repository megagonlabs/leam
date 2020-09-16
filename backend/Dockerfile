FROM python:3

# RUN apt-get update \
#     && apt-get install -y postgresql-client
RUN apk add --update postgresql-client
ENV FLASK_APP explorer.py
WORKDIR /app
ADD . /app
RUN pip install -r /app/requirements.txt
