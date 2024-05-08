import yaml
from supabase import create_client
from dotenv import load_dotenv
load_dotenv()

def connectToDB(url, key):
    try:
        connection = create_client(url, key)
        print("---- Connection to Supabase database was successful. ----")
        return connection
    except:
        print("---- Connection to Supabase database failed. ----")

def writeToYAML_Domain(training_data, filepath):
    with open(filepath, 'r', encoding='utf-8') as file:
        existing_domain_data = yaml.safe_load(file)

    for row in training_data:
        question_name = 'utter_question_' + str(row['id'])
        question_answer = question_name + '_answer'
        question_answer_more = question_name + '_answer_more'
        question_provide_example = question_name + '_provide_example'
        question_usage = question_name + '_usage'
        question_readmore = question_name + '_readmore'

        existing_domain_data['responses'][question_answer] = [
            {
                'text': str(row['answer_default'])
            }
        ]
        existing_domain_data['responses'][question_answer_more] = [
            {
                'text': str(row['answer_more'])
            }
        ]
        existing_domain_data['responses'][question_provide_example] = [
            {
                'text': str(row['answer_examples'])
            }
        ]
        existing_domain_data['responses'][question_usage] = [
            {
                'text': str(row['answer_usage'])
            }
        ]
        existing_domain_data['responses'][question_readmore] = [
            {
                'text': str(row['answer_readmore'])
            }
        ]

        question_name = 'question_' + str(row['id'])
        question_usage = question_name + '_usage'
        question_provide_example = question_name + '_examples'
        question_readmore = question_name + '_readmore'

        existing_domain_data['intents'].append(question_name)
        existing_domain_data['intents'].append(question_usage)
        existing_domain_data['intents'].append(question_provide_example)
        existing_domain_data['intents'].append(question_readmore)
    
    with open(filepath, 'w', encoding='utf-8') as file:
        yaml.dump(existing_domain_data, file, sort_keys=False)

def writeToYAML_NLU(training_data, filepath):
    with open(filepath, 'r', encoding='utf-8') as file:
        existing_nlu_data = yaml.safe_load(file)

    for i in range(len(existing_nlu_data['nlu'])):
        string_to_convert_to_array = existing_nlu_data['nlu'][i]['examples']
        string_to_convert_to_array = string_to_convert_to_array.split('\n')
        string_to_convert_to_array = [string[2:] for string in string_to_convert_to_array ]
        string_to_convert_to_array = string_to_convert_to_array[:-1]
        existing_nlu_data['nlu'][i]['examples'] = string_to_convert_to_array

    for row in training_data:
        question_name = 'question_' + str(row['id'])
        question_usage = question_name + '_usage'
        question_examples = question_name + '_examples'
        question_readmore = question_name + '_readmore'

        existing_nlu_data['nlu'].append({
            'intent': question_name,
            'examples':  row['nlu_examples']['example_input']
        })
        existing_nlu_data['nlu'].append({
            'intent': question_usage,
            'examples': row['nlu_examples']['example_input_usage']
        })
        existing_nlu_data['nlu'].append({
            'intent': question_examples,
            'examples': row['nlu_examples']['example_input_examples']
        })
        existing_nlu_data['nlu'].append({
            'intent': question_readmore,
            'examples': row['nlu_examples']['example_input_readmore']
        })

    with open(filepath, 'w', encoding='utf-8') as file:
        yaml.dump(existing_nlu_data, file, sort_keys=False)
    
    with open(filepath, 'r', encoding='utf-8') as file:
        data_to_modify = file.read()

    data_to_modify = data_to_modify.replace('examples:', 'examples: |')
    data_to_modify = data_to_modify.replace('  -', '    -')
    
    with open(filepath, 'w', encoding='utf-8') as file:
        file.write(data_to_modify)

def writeToYAML_Story(training_data, filepath):
    with open(filepath, 'r', encoding='utf-8') as file:
        existing_stories_data = yaml.safe_load(file)

    for row in training_data:
        question_name = 'question_' + str(row['id'])
        question_usage = question_name + '_usage'
        question_examples = question_name + '_examples'
        question_readmore = question_name + '_readmore'

        existing_stories_data['stories'].append({
            'story': row['story_name'],
            'steps': [
                {
                    'or': [
                        {
                            'intent': question_name
                        },
                        {
                            'intent': question_usage
                        },
                        {
                            'intent': question_examples
                        },
                        {
                            'intent': question_readmore
                        }
                    ]
                },
                {
                    'action': 'action_answer_question'
                }
            ]
            }
        ),
    
    with open(filepath, 'w', encoding='utf-8') as file:
        yaml.dump(existing_stories_data, file, sort_keys=False)