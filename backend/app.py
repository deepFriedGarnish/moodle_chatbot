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

UNANSWERED_PROMPT_TABLE = 'unanswered_prompt'
CONVERSATION_TABLE = 'conversation'

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

@app.post("/unansweredPrompt")
def uploadUnansweredPromptToDB():
    jsonData = request.get_json()
    prompt = jsonData['message']
    
    supabase.table(UNANSWERED_PROMPT_TABLE).insert(
        {
            "prompt_text": prompt
        }
    ).execute()

    print(f'Unanswered prompt "{prompt}" inserted into DB successfully.')
    return 'Unanswered prompt inserted into DB successfully'

@app.post("/duplicatePrompt")
def uploadDublicatePromptToDB():
    jsonData = request.get_json()
    prompt = jsonData['message']
    conversation = json.loads(jsonData['conversation'])

    supabase.table(CONVERSATION_TABLE).insert(
        {
            "conversation_text": conversation
        }
    ).execute()
    supabase.table(UNANSWERED_PROMPT_TABLE).insert(
        {
            "prompt_text": prompt
        }
    ).execute()

    print(f'Duplicate prompt "{prompt}" inserted into DB successfully.')
    return 'Duplicate prompt inserted into DB successfully'

if __name__ == '__main__':
    app.run(debug = True)