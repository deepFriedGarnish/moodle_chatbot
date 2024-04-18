from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import requests
import json
import os
from utils import connectToDB

# Database host URL
url = os.environ.get("SUPABASE_URL")
# Database host public API key
key = os.environ.get("SUPABASE_KEY")

supabase = connectToDB(url, key)

app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/static')
CORS(app)

rasa_api_url = 'http://localhost:5005/webhooks/rest/webhook'

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
    jsonData = request.get_json()
    prompt = jsonData['message']
    print(prompt)
    return prompt

@app.post("/duplicatePrompt")
def uploadUnansweredPromptToDB():
    jsonData = request.get_json()
    prompt = jsonData['message']
    print(prompt)
    return prompt

if __name__ == '__main__':
    app.run(debug = True)