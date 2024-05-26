import React, { useState } from "react";

import './TrainingModal.css';
import { NLUInput } from "./NLUInput";

export const TrainingModal = (props) => {
    const [formState, setFormState] = useState({
        id: props.defaultValue.id !== undefined ? props.defaultValue.id : "",
        answer_default: props.defaultValue.answer_default !== undefined ? props.defaultValue.answer_default : "",
        answer_more: props.defaultValue.answer_more !== undefined ? props.defaultValue.answer_more : "",
        answer_usage: props.defaultValue.answer_usage !== undefined ? props.defaultValue.answer_usage : "",
        answer_examples: props.defaultValue.answer_examples !== undefined ? props.defaultValue.answer_examples : "",
        answer_readmore: props.defaultValue.answer_readmore !== undefined ? props.defaultValue.answer_readmore : "",
        story_name: props.defaultValue.story_name !== undefined ? props.defaultValue.story_name : "",
        example_input: props.defaultValue.example_input !== undefined ? props.defaultValue.example_input : [""],
        example_input_examples: props.defaultValue.example_input_examples !== undefined ? props.defaultValue.example_input_examples : [""],
        example_input_readmore: props.defaultValue.example_input_readmore !== undefined ? props.defaultValue.example_input_readmore : [""],
        example_input_usage: props.defaultValue.example_input_usage !== undefined ? props.defaultValue.example_input_usage : [""]
    });

    const [nlu_examples_example_input, set_nlu_examples_example_input] = useState(formState.example_input);
    const [nlu_examples_example_input_examples, set_nlu_examples_example_input_examples] = useState(formState.example_input_examples);
    const [nlu_examples_example_input_readmore, set_nlu_examples_example_input_readmore] = useState(formState.example_input_readmore);
    const [nlu_examples_example_input_usage, set_nlu_examples_example_input_usage] = useState(formState.example_input_usage);

    const [errors, setErrors] = useState(false);

    const validateForm = () => {
        let isValid = true;
        if (!formState.answer_default ||
            !formState.answer_more ||
            !formState.answer_usage ||
            !formState.answer_examples ||
            !formState.answer_readmore ||
            !formState.story_name) {
                setErrors(true);
                isValid = false;
            }
        if (formState.example_input.length !== 0 &&
            formState.example_input_examples.length !== 0 &&
            formState.example_input_usage.length !== 0 &&
            formState.example_input_readmore.length !== 0) {
            formState.example_input.forEach(element => {
                if (!element || element === ''){
                    setErrors(true);  
                    isValid = false;
                }            
            });
            formState.example_input_examples.forEach(element => {
                if (!element || element === ''){
                    setErrors(true);  
                    isValid = false;
                }            
            });
            formState.example_input_usage.forEach(element => {
                if (!element || element === ''){
                    setErrors(true);  
                    isValid = false;
                }            
            });
            formState.example_input_readmore.forEach(element => {
                if (!element || element === ''){
                    setErrors(true);  
                    isValid = false;
                }            
            });
        } else {
            isValid = false;
        }
        setErrors(!isValid);
        return isValid;
    }

    const handleChange = (e) => {
        setFormState({
            ...formState,
            [e.target.name] : e.target.value
        });
    };

    const handleQuestionChange = (e, index, type) => {
        if (type === 'question'){
            let updated = nlu_examples_example_input;
            updated[index] = e.target.value;
            set_nlu_examples_example_input(updated);
            setFormState({
                ...formState,
                example_input: nlu_examples_example_input
            });
        } else if (type === 'question_examples') {
            let updated = nlu_examples_example_input_examples;
            updated[index] = e.target.value;
            set_nlu_examples_example_input_examples(updated);
            setFormState({
                ...formState,
                example_input_examples: nlu_examples_example_input_examples
            });
        } else if (type === 'question_usage') {
            let updated = nlu_examples_example_input_usage;
            updated[index] = e.target.value;
            set_nlu_examples_example_input_usage(updated);
            setFormState({
                ...formState,
                example_input_usage: nlu_examples_example_input_usage
            });
        } else if (type === 'question_readmore') {
            let updated = nlu_examples_example_input_readmore;
            updated[index] = e.target.value;
            set_nlu_examples_example_input_readmore(updated);
            setFormState({
                ...formState,
                example_input_readmore: nlu_examples_example_input_readmore
            });
        }
    };

    const handleQuestionRemove = (idx, event, type) => {
        event.preventDefault();
        if (type === 'question'){
            let updated = nlu_examples_example_input;
            updated.splice(idx, 1);
            set_nlu_examples_example_input(updated);
            setFormState({
                ...formState,
                example_input: nlu_examples_example_input
            });
        } else if (type === 'question_usage') {
            let updated = nlu_examples_example_input_usage;
            updated.splice(idx, 1);
            set_nlu_examples_example_input_usage(updated);
            setFormState({
                ...formState,
                example_input_usage: nlu_examples_example_input_usage
            });
        } else if (type === 'question_examples') {
            let updated = nlu_examples_example_input_examples;
            updated.splice(idx, 1);
            set_nlu_examples_example_input_examples(updated);
            setFormState({
                ...formState,
                example_input_examples: nlu_examples_example_input_examples
            });
        } else if (type === 'question_readmore') {
            let updated = nlu_examples_example_input_readmore;
            updated.splice(idx, 1);
            set_nlu_examples_example_input_readmore(updated);
            setFormState({
                ...formState,
                example_input_readmore: nlu_examples_example_input_readmore
            });
        }
    };

    const handleQuestionAdd = (e, type) => {
        e.preventDefault();
        if (type === 'question'){
            let updated = nlu_examples_example_input;
            updated.push('');
            set_nlu_examples_example_input(updated);
            setFormState({
                ...formState,
                example_input: nlu_examples_example_input
            });
        } else if (type === 'question_examples'){
            let updated = nlu_examples_example_input_examples;
            updated.push('');
            set_nlu_examples_example_input_examples(updated);
            setFormState({
                ...formState,
                example_input_examples: nlu_examples_example_input_examples
            });
        } else if (type === 'question_usage'){
            let updated = nlu_examples_example_input_usage;
            updated.push('');
            set_nlu_examples_example_input_usage(updated);
            setFormState({
                ...formState,
                example_input_usage: nlu_examples_example_input_usage
            });
        } else if (type === 'question_readmore'){
            let updated = nlu_examples_example_input_readmore;
            updated.push('');
            set_nlu_examples_example_input_readmore(updated);
            setFormState({
                ...formState,
                example_input_readmore: nlu_examples_example_input_readmore
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if(!validateForm()){
            return;
        }
        props.onSubmit(formState);
        props.closeModal();
    }

    return <div className='modal-container' onClick={(e) => {
                if (e.target.className === "modal-container") {
                    props.closeModal();
                }
            }}>
        <div className='modal'>
            <form>
                <div className='modal-title'>
                    {formState.id === "" ? 'Naujas duomenų apmokymo įrašas' : `Redaguojamo duomenų apmokymo įrašo ID: ${formState.id}`}
                </div>
                <div className="form-group">
                    <label htmlFor='answer_default'>Atsakymas</label>
                    <textarea name='answer_default' value={formState.answer_default} onChange={handleChange}/>
                </div>
                <div className="form-group">
                    <label htmlFor='answer_more'>Papildymas</label>
                    <textarea name='answer_more' value={formState.answer_more} onChange={handleChange}/>
                </div>
                <div className="form-group">
                    <label htmlFor='answer_usage'>Panaudojimas</label>
                    <textarea name='answer_usage' value={formState.answer_usage} onChange={handleChange}/>
                </div>
                <div className="form-group">
                    <label htmlFor='answer_examples'>Pavyzdžiai</label>
                    <textarea name='answer_examples' value={formState.answer_examples} onChange={handleChange}/>
                </div>
                <div className="form-group">
                    <label htmlFor='answer_readmore'>Daugiau pasiskaityti</label>
                    <textarea name='answer_readmore' value={formState.answer_readmore} onChange={handleChange}/>
                </div>
                <div className="form-group">
                    <label htmlFor='story_name'>Istorijos pavadinimas</label>
                    <textarea name='story_name' value={formState.story_name} onChange={handleChange}/>
                </div>
                <label htmlFor='answer_readmore'>NLU pavyzdžiai</label>
                <div className="nlu-wrapper">
                    <NLUInput
                        title={'Paprastas klausimas'}
                        data={formState.example_input}
                        handleQuestionChange={handleQuestionChange}
                        handleQuestionAdd={handleQuestionAdd}
                        handleQuestionRemove={handleQuestionRemove}
                        type={'question'}/>
                    <NLUInput
                        title={'Pavyzdžių prašymas'}
                        data={formState.example_input_examples}
                        handleQuestionChange={handleQuestionChange}
                        handleQuestionAdd={handleQuestionAdd}
                        handleQuestionRemove={handleQuestionRemove}
                        type={'question_examples'}/>
                    <NLUInput
                        title={'Panaudojimo atvejų prašymas'}
                        data={formState.example_input_usage}
                        handleQuestionChange={handleQuestionChange}
                        handleQuestionAdd={handleQuestionAdd}
                        handleQuestionRemove={handleQuestionRemove}
                        type={'question_usage'}/>
                    <NLUInput
                        title={'Papildomo pasiskaitymo prašymas'}
                        data={formState.example_input_readmore}
                        handleQuestionChange={handleQuestionChange}
                        handleQuestionAdd={handleQuestionAdd}
                        handleQuestionRemove={handleQuestionRemove}
                        type={'question_readmore'}/>
                </div>
                {errors === true && 
                    <div className='validation-error'>
                        Negalima išsaugoti, nes yra paliktų neužpildytų laukų.
                    </div>}
                <button type="submit" className="submit-btn" onClick={handleSubmit}>
                    Išsaugoti
                </button>
            </form>
        </div>
    </div>;
}