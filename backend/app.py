from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import requests
import json
import os
from utils import connectToDB
from utils import writeToYAML_Domain, writeToYAML_NLU, writeToYAML_Story

# Database host URL
url = os.environ.get("SUPABASE_URL")
# Database host public API key
key = os.environ.get("SUPABASE_KEY")

supabase = connectToDB(url, key)

UNANSWERED_PROMPT_TABLE = 'unanswered_prompt'
CONVERSATION_TABLE = 'conversation'
TRAINING_DATA_TABLE = 'training_data'

app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/static')
CORS(app)

rasa_api_url = 'http://localhost:5005/webhooks/rest/webhook'

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
        url = rasa_api_url,
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
    conversation_id = jsonData['conversationId']
    prompt_type = jsonData['type']
    conversation = jsonData['conversation']

    if (conversation_id == 0):
        response = supabase.table(CONVERSATION_TABLE).insert(
            {
                "conversation_text": conversation
            }
        ).execute()
        inserted_row_id = response.data[0].get('id')
        supabase.table(UNANSWERED_PROMPT_TABLE).insert(
            {
                "prompt_text": prompt,
                "conversationId": inserted_row_id,
                "type": prompt_type
            }
        ).execute()
        return [inserted_row_id]
    else:
        supabase.table(UNANSWERED_PROMPT_TABLE).insert(
            {
                "prompt_text": prompt,
                "conversationId": conversation_id,
                "type": prompt_type
            }
        ).execute()
        return [conversation_id]

@app.post("/updateConversation")
def updateConversation():
    jsonData = request.get_json()
    row_id = jsonData.get('conversationId')
    conversation = jsonData.get('conversation')

    if (row_id == 0):
        response = supabase.table(CONVERSATION_TABLE).insert(
            {
                "conversation_text": conversation
            }
        ).execute()
        inserted_row_id = response.data[0].get('id')
        return [inserted_row_id]
    else:
        supabase.table(CONVERSATION_TABLE).update(
            {
                "conversation_text": conversation
            }
        ).eq('id', row_id).execute()
        return [row_id]

@app.get("/getConversations")
def getConversations():
    response = supabase.table(CONVERSATION_TABLE).select('*').execute();
    
    return jsonify(response.data)

@app.get("/getUnansweredQuestions")
def getUnansweredQuestions():
    response = supabase.table(UNANSWERED_PROMPT_TABLE).select('*').execute();
    return jsonify(response.data)

@app.get("/getTrainingData")
def getTrainingData():
    response = supabase.table(TRAINING_DATA_TABLE).select('*').execute();
    return jsonify(response.data)

@app.post("/updateTrainingDataRow")
def updateTrainingDataRow():
    jsonData = request.get_json()
    row_id = jsonData.get('id')

    supabase.table(TRAINING_DATA_TABLE).update(jsonData).eq('id', row_id).execute()

    return []

@app.post("/createTrainingDataRow")
def createTrainingDataRow():
    jsonData = request.get_json()

    supabase.table(TRAINING_DATA_TABLE).insert(jsonData).execute()

    return []

@app.delete("/deleteTrainingDataRow")
def deleteTrainingDataRow():
    row_id = request.get_json()

    supabase.table(TRAINING_DATA_TABLE).delete().eq('id', row_id).execute()

    return []

@app.delete("/deleteUnansweredQuestionRow")
def deleteUnansweredQuestionRow():
    row_id = request.get_json()

    response = supabase.table(UNANSWERED_PROMPT_TABLE).select('*').eq('id', row_id).execute()
    conversationId = response.data[0]['conversationId']
    supabase.table(UNANSWERED_PROMPT_TABLE).delete().eq('id', row_id).execute()
    supabase.table(CONVERSATION_TABLE).delete().eq('id', conversationId).execute()

    return []

@app.delete("/deleteConversationRow")
def deleteConversationRow():
    row_id = request.get_json()

    supabase.table(CONVERSATION_TABLE).delete().eq('id', row_id).execute()

    return []

@app.get("/trainNewModel")
def trainNewModel():
    # Fetching training data from DB
    response = supabase.table(TRAINING_DATA_TABLE).select('*').execute()
    training_data = response.data

    # All needed filepaths for rasa model retraining
    domain_filepath = './rasa_bot/domain.yml'
    nlu_filepath = './rasa_bot/data/nlu.yml'
    stories_filepath = './rasa_bot/data/stories.yml'

    writeToYAML_Domain(training_data, domain_filepath)
    writeToYAML_NLU(training_data, nlu_filepath)
    writeToYAML_Story(training_data, stories_filepath)

    return []

if __name__ == '__main__':
    app.run(host='0.0.0.0')