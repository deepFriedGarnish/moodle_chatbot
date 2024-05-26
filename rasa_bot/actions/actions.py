from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet, FollowupAction
import requests

class ActionAnswerQuestion(Action):
    def name(self) -> Text:
        return "action_answer_question"

    def run(self,
            dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List:
        
        current_intent = tracker.latest_message['intent'].get('name')
        split_intent_array = current_intent.split('_')
        current_topic = ''
        topic_id = 0


        # Cut of the unnecessary end of the intent string
        for i in range(2):
            if i != 1:
                current_topic += split_intent_array[i]
                current_topic += '_'
            else:
                current_topic += split_intent_array[i]

        topic_id = getCurrentTopicId(split_intent_array)
        
        # Update FAQ table
        data = {
            'topicId': topic_id
        }
        requests.post('http://localhost:5000/updateFAQ', json=data)

        # Check if user asked for straight variations of the topic
        if current_intent.find("question") != 1:
            if "examples" in current_intent:
                return [SlotSet("current_topic", current_topic), FollowupAction('action_provide_examples')]
            elif "usage" in current_intent:
                return [SlotSet("current_topic", current_topic), FollowupAction('action_explain_usage')]
            elif "readmore" in current_intent:
                return [SlotSet("current_topic", current_topic), FollowupAction('action_provide_readmore')]
            else:
                dispatcher.utter_message(response = 'utter_' + current_topic + '_answer') 

        return [SlotSet("current_topic", current_topic)]
    
class ActionClarifyQuestion(Action):
    def name(self) -> Text:
        return "action_clarify_question"

    def run(self,
            dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List:

        current_topic = tracker.get_slot("current_topic")

        dispatcher.utter_message(response = 'utter_' + current_topic + '_answer_more')

        return []

class ActionProvideExamples(Action):
    def name(self) -> Text:
        return "action_provide_examples"

    def run(self,
            dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List:

        current_topic = tracker.get_slot("current_topic")

        dispatcher.utter_message(response = 'utter_' + current_topic + '_provide_example')

        return []

class ActionProvideExamples(Action):
    def name(self) -> Text:
        return "action_explain_usage"

    def run(self,
            dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List:

        current_topic = tracker.get_slot("current_topic")

        dispatcher.utter_message(response = 'utter_' + current_topic + '_usage')

        return []
    
class ActionProvideReadmore(Action):
    def name(self) -> Text:
        return "action_provide_readmore"

    def run(self,
            dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List:

        current_topic = tracker.get_slot("current_topic")

        dispatcher.utter_message(response = 'utter_' + current_topic + '_readmore')

        return []
    
class ActionDefaultFallback(Action):
    def name(self) -> Text:
        return "action_default_fallback"

    def run(self,
            dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List:

        dispatcher.utter_message(response = 'utter_default_fallback')

        return []
    
def getCurrentTopicId(split_intent_array):
    for i in range(2):
        if i != 1:
            continue
        else:
            return int(split_intent_array[i])