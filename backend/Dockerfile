FROM python:3

ENV FLASK_APP explorer.py

WORKDIR /app
ADD . /app
RUN pip install -r /app/requirements.txt
# CMD ["python", "explorer.py"]

# RUN chmod +x ./entrypoint.sh
# ENTRYPOINT ["./entrypoint.sh"]
CMD ["sh", "-c", "chmod 777 /app/entrypoint.sh && /app/entrypoint.sh"]