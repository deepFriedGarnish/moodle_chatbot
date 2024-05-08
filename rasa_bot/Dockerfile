FROM python:3.10.11

RUN python -m pip install rasa

WORKDIR /app

COPY . .

RUN rasa train

EXPOSE 5005

CMD ["rasa", "run", "--enable-api", "--port", "5005"]