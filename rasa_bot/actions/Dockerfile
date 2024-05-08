FROM python:3.10.11

RUN python -m pip install rasa

WORKDIR /app

COPY .. .

EXPOSE 5055

CMD ["rasa", "run", "actions", "--actions", "actions"]