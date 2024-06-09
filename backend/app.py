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
FAQ_TABLE = 'faq'

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
    row_id = int(jsonData.get('conversationId'))
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
    response = supabase.table(CONVERSATION_TABLE).select('*').order('id', desc=True).execute();
    
    return jsonify(response.data)

@app.get("/getUnansweredQuestions")
def getUnansweredQuestions():
    response = supabase.table(UNANSWERED_PROMPT_TABLE).select('*').order('id', desc=True).execute();
    return jsonify(response.data)

@app.get("/getTrainingData")
def getTrainingData():
    response = supabase.table(TRAINING_DATA_TABLE).select('*').order('id', desc=True).execute();
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

    supabase.table(UNANSWERED_PROMPT_TABLE).delete().eq('id', row_id).execute()

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

    # All needed default filepaths for rasa model retraining
    default_domain_filepath = './rasa_bot/default_data_files/default_domain.yml'
    default_nlu_filepath = './rasa_bot/default_data_files/default_nlu.yml'
    default_stories_filepath = './rasa_bot/default_data_files/default_stories.yml'

    # All needed filepaths for rasa model retraining
    domain_filepath = './rasa_bot/domain.yml'
    nlu_filepath = './rasa_bot/data/nlu.yml'
    stories_filepath = './rasa_bot/data/stories.yml'

    writeToYAML_Domain(training_data, domain_filepath, default_domain_filepath)
    writeToYAML_NLU(training_data, nlu_filepath, default_nlu_filepath)
    writeToYAML_Story(training_data, stories_filepath, default_stories_filepath)

    return []

@app.post("/updateFAQ")
def updateFAQ():
    data = request.get_json()

    topics = supabase.table(FAQ_TABLE).select('*').execute()
    if len(topics.data) != 0:
        for topic in topics.data:
            if topic['topicId'] == data['topicId']:
                supabase.table(FAQ_TABLE).update({
                    'count': int(topic['count']) + 1
                }).eq('topicId', topic['topicId']).execute()
                return []
    
    supabase.table(FAQ_TABLE).insert({
        'topicId': data['topicId']
    }).execute()
    return []

@app.get("/faq")
def faq():
    topics = supabase.table(FAQ_TABLE).select('*').order('count', desc=True).limit(10).execute()
    result = []

    for topic in topics.data:
        response = supabase.table(TRAINING_DATA_TABLE).select('story_name').eq('id', int(topic['topicId'])).execute()
        if (len(response.data) != 0):
            result.append(response.data[0]['story_name'])

    return json.dumps(result)

@app.get("/getFAQ")
def getFAQ():
    topics = supabase.table(FAQ_TABLE).select('*').order('count', desc=True).execute()
    final_result = []

    for item in topics.data:
        response = supabase.table(TRAINING_DATA_TABLE).select('story_name').eq('id', int(item['topicId'])).execute()
        if (len(response.data) != 0):
            result_item = {
                'id': item['id'],
                'topic': response.data[0]['story_name'],
                'count': item['count']
            }
            final_result.append(result_item)

    return jsonify(final_result)

@app.delete("/deleteFAQ")
def deleteFAQ():
    supabase.table(FAQ_TABLE).delete().neq('id', 0).execute()
    return []

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)