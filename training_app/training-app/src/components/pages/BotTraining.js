import React, { useState } from 'react';
import './pages.css';
import trashIcon from '../../svg/trash-icon.svg';
import editIcon from '../../svg/edit-icon.svg';
import { TrainingModal } from '../TrainingModal';

const BotTraining = () => {
    const [data, setData] = useState([]);
    const [isVisible, setIsVisible] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [rowToEdit, setRowToEdit] = useState(null);

    // Fetch the data
    React.useEffect(() => {
        async function fetchData() {
            await fetch ('http://localhost:5000/getTrainingData')
            .then(response => response.json())
            .then(data => setData(data))
            .catch(error => console.error('Error fetching data:', error))
            setIsLoading(false);
        }
        fetchData();
        setIsVisible(true);
    }, []);
    
    const handleEditRow = (idx) => {
        setRowToEdit(idx);
        setModalOpen(true);
    }

    const handleTraining = async () => {
        try {
            await fetch('http://localhost:5000/trainNewModel', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    const handleDeleteRow = async (idx) => {
        setIsLoading(true);
        // Call API to update the table row
        try {
            await fetch('http://localhost:5000/deleteTrainingDataRow', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(idx)
            });
        } catch (error) {
            console.error(error);
        }

        // Call API to fetch new data
        try {
            const response = await fetch('http://localhost:5000/getTrainingData');
            const result = await response.json();
            setData(result);
            setIsLoading(false);
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    }

    const getRowById = () => {
        let rowToReturn = {};
        data.forEach(row => {
            if (row.id == rowToEdit) {
                rowToReturn = {
                    id: row.id,
                    answer_default: row.answer_default,
                    answer_more: row.answer_more,
                    answer_usage: row.answer_usage,
                    answer_examples: row.answer_examples,
                    answer_readmore: row.answer_readmore,
                    story_name: row.story_name,
                    example_input: row.nlu_examples.example_input,
                    example_input_examples: row.nlu_examples.example_input_examples,
                    example_input_readmore: row.nlu_examples.example_input_readmore,
                    example_input_usage: row.nlu_examples.example_input_usage
                }
            }
        });
        return rowToReturn;
    }

    const handleSubmit = async (newRow) => {
        setIsLoading(true);
        
        const body = {
            answer_default: newRow.answer_default,
            answer_usage: newRow.answer_usage,
            answer_examples: newRow.answer_examples,
            answer_readmore: newRow.answer_readmore,
            answer_more: newRow.answer_more,
            story_name: newRow.story_name,
            nlu_examples: {
                example_input: newRow.example_input,
                example_input_examples: newRow.example_input_examples,
                example_input_readmore: newRow.example_input_readmore,
                example_input_usage: newRow.example_input_usage
            }
        }

        let finalBody = {};

        if (newRow.id !== "") {
            finalBody = body;
            finalBody.id = newRow.id;
        } else {
            finalBody = body;
        }


        if (rowToEdit === null) {
            // Call API to update the table row
            try {
                await fetch('http://localhost:5000/createTrainingDataRow', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(finalBody)
                });
            } catch (error) {
                console.error(error);
            }

            // Call API to fetch new data
            try {
                const response = await fetch('http://localhost:5000/getTrainingData');
                const result = await response.json();
                setData(result);
                setIsLoading(false);
            } catch (error) {
                console.error(error);
                setIsLoading(false);
            }
        } else {
            // Call API to update the table row
            try {
                await fetch('http://localhost:5000/updateTrainingDataRow', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(finalBody)
                });
            } catch (error) {
                console.error(error);
            }

            // Call API to fetch new data
            try {
                const response = await fetch('http://localhost:5000/getTrainingData');
                const result = await response.json();
                setData(result);
                setIsLoading(false);
            } catch (error) {
                console.error(error);
                setIsLoading(false);
            }
        }
    }

    return (
        isLoading ? (
            <div className='page-wrapper'>
                <p>Kraunama...</p>
            </div>
        ) : (
        <div className={`table-wrapper ${isVisible ? 'fade-in' : ''}`}>
            
            <table className='table'>
                <thead className='header'>
                    <tr>
                        <th>ID</th>
                        <th className='wider-column'>Atsakymas</th>
                        <th className='wider-column'>Papildymas</th>
                        <th className='wider-column'>Panaudojimas</th>
                        <th className='wider-column'>Pavyzdžiai</th>
                        <th className='wider-column'>Daugiau paskaityti</th>
                        <th className='wider-column'>Istorijos pavadinimas</th>
                        <th className='wider-column'>NLU pavyzdžiai</th>
                        <th>Naikinti</th>
                        <th>Redaguoti</th>
                    </tr>  
                </thead>
                <tbody>
                    {
                        data.map(item => (
                            <tr key={item.id} className='row-btn'>
                                <td>{item.id}</td>
                                <td>{item.answer_default}</td>
                                <td>{item.answer_more}</td>
                                <td>{item.answer_usage}</td>
                                <td>{item.answer_examples}</td>
                                <td>{item.answer_readmore}</td>
                                <td>{item.story_name}</td>
                                <td>{JSON.stringify(item.nlu_examples)}</td>
                                <td className='action-cell'>
                                    <button className='action-button' onClick={() => handleDeleteRow(item.id)}>
                                        <img className='icon' src={trashIcon}/>
                                    </button>
                                </td>
                                <td className='action-cell'>
                                    <button className='action-button' onClick={() => handleEditRow(item.id)}>
                                        <img className='icon' src={editIcon}/>
                                    </button>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            <tfoot>
                <tr>
                    <td colSpan={10} className='btn-wrapper' onClick={() => handleEditRow(null)}>
                        <button className='footer-btn'>Pridėti</button>
                    </td>
                </tr>
                <tr>
                    <td colSpan={10} className='btn-wrapper' onClick={() => handleTraining()}>
                        <button className='footer-btn'>Apmokyti botą</button>
                    </td>
                </tr>
            </tfoot>
            </table>
            {
            modalOpen && 
                <TrainingModal 
                    closeModal={() => setModalOpen(false)}
                    defaultValue={getRowById(rowToEdit)}
                    onSubmit={handleSubmit}/>
            }
        </div>
    )
)
}

export default BotTraining;