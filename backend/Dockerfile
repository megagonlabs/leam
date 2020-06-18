FROM python:3

ENV FLASK_APP explorer.py

WORKDIR /app
ADD . /app
RUN pip install -r /app/requirements.txt
CMD ["python", "explorer.py"]