from typing import Any, Text, Dict, List
import requests
import json
import os

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher

openai_api_key = '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'
chat_gpt_url = 'https://api.openai.com/v1/chat/completions'

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {openai_api_key}"
}

data = {
    "model": "gpt-3.5-turbo",
    "messages": [
        {
            "role": "system",
            "content": "You are a helpful assistant."
        },
        {
            "role": "user",
            "content": "Hello!"
        }
    ]
}

class ActionHelloWorld(Action):
    def name(self) -> Text:
        return "action_hello_world"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        dispatcher.utter_message(text="Hello World!")
        return []
    
class ActionAskChatGPT(Action):
    def name(self) -> Text:
        return "action_ask_chat_gpt"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        if openai_api_key is None:
            raise ValueError("OpenAI API key is not set in environment variables.")
        
        response = requests.post(chat_gpt_url, headers=headers, json=data)
        response_message = 'NONE'

        if response.status_code == 200:
            print("Response from OpenAI:", response.json())
            print("\n")
            response_message = response.json()['choices'][0]['message']['content']
            print(response_message)
        else:
            print("Error:", response.status_code, response.text)
        
        # user_message = tracker.latest_message.get('text')
        
        dispatcher.utter_message(text=response_message)
        return []