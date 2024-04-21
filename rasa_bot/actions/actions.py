from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet

class ActionAnswerQuestion(Action):
    def name(self) -> Text:
        return "action_answer_question"

    def run(self,
            dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List:
        
        current_intent = tracker.latest_message['intent'].get('name')

        if current_intent.find("question") != 1:
            dispatcher.utter_message(response = 'utter_' + current_intent + '_answer') 

        return [SlotSet("current_topic", current_intent)]
    
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