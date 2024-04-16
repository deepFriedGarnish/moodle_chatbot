from flask import Flask, render_template, request, jsonify, url_for
import psycopg2
from flask_cors import CORS
import requests
import json

app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/static')
CORS(app)

rasa_api_url = 'http://localhost:5005/webhooks/rest/webhook'

try:
    connection = psycopg2.connect(
        host="localhost",
        database="moodle_chatbot",
        user="postgres",
        password="postgres"
    )

    print("Connection to PostgreSQL database successful")
except psycopg2.Error as e:
    print("Error connecting to PostgreSQL database:", e)

@app.get("/")
def index_get():
    return render_template("base.html")

@app.post("/predict")
def predict():
    jsonData = request.get_json()
    prompt = jsonData['message']
    payload = json.dumps(
        {
            "sender": "Rasa", 
            "message": prompt
        }
    )
    headers = {
        'Content-type': 'application/json',
        'Accept': 'text/plain'
    }
    response = requests.request(
        "POST",
        url = "http://localhost:5005/webhooks/rest/webhook",
        headers = headers,
        data = payload
    )
    if response.status_code != 200:
        print('Error: ', response.status_code)

    answer = []
    for r in response.json():
        if r.get('text') is None:
            answer.append(r.get('image'))
        else:
            answer.append(r.get('text'))

    return jsonify({
        'answer': answer
    })

@app.post("/prompt")
def uploadUnansweredPromptToDB():
    # cursor = connection.cursor()
    # cursor.execute("SELECT * FROM test_table")
    # rows = cursor.fetchall()

    # for row in rows:
    #     print(row)

    jsonData = request.get_json()
    prompt = jsonData['message']
    print(prompt)

    return prompt

if __name__ == '__main__':
    app.run(debug = True)