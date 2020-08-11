FROM python:3

RUN apt-get update \
    && apt-get install -y postgresql-client \
    && apt-get install -y wget \
    && apt-get install -y default-jdk

RUN wget http://www.antlr.org/download/antlr-4.7.1-complete.jar -O /usr/local/lib/antlr-4.7.1-complete.jar
RUN echo '#!/bin/bash\njava -jar /usr/local/lib/antlr-4.7.1-complete.jar' > /usr/bin/antlr4
RUN chmod +x /usr/bin/antlr4
RUN echo '#!/bin/bash\njava org.antlr.v4.gui.TestRig' > /usr/bin/grun
RUN chmod +x /usr/bin/grun
ENV CLASSPATH .:/usr/local/lib/antlr-4.7.1-complete.jar:$CLASSPATH


ENV FLASK_APP explorer.py

WORKDIR /app
ADD ./explorer_app/* /app/
ADD ./requirements.txt /app/
RUN ls
RUN pip install -r /app/requirements.txt

# CMD ["python", "explorer.py"]

# RUN chmod +x ./entrypoint.sh
# ENTRYPOINT ["./entrypoint.sh"]