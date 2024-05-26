import React, { useState } from 'react';
import './pages.css'
import trashIcon from '../svg/trash-icon.svg';
import inspectIcon from '../svg/inspect-icon.svg';
import { ConversationModal } from '../components/ConversationModal';

const UnansweredQuestions = () => {
    // Data state
    const [jsonData, setJsonData] = React.useState([]);
    const [convoData, setConvoData] = React.useState([]);
    const [isVisible, setIsVisible] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [rowToOpen, setRowToOpen] = useState(null);

    const handleOpenRow = (idx) => {
        setRowToOpen(idx);
        setModalOpen(true);
    }

    const handleDeleteRow = async (idx) => {
        setIsLoading(true);
        // Call API to update the table row
        try {
            await fetch('http://localhost:5000/deleteUnansweredQuestionRow', {
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
            const response = await fetch('http://localhost:5000/getUnansweredQuestions');
            const result = await response.json();
            setJsonData(result);
            setIsLoading(false);
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    }

    const getRowById = () => {
        let conversationId = -1;
        jsonData.forEach(row => {
            if (row.id === rowToOpen) {
                conversationId = row.conversationId;
            }
        });
        let convoToReturn = {};
        convoData.forEach(convo => {
            if (convo.id === conversationId) {
                convoToReturn = convo;
            }
        });
        return convoToReturn;
    }

    // Fetch the data
    React.useEffect(() => {
        async function fetchData() {
            await fetch ('http://localhost:5000/getUnansweredQuestions')
            .then(response => response.json())
            .then(data => setJsonData(data))
            .catch(error => console.error('Error fetching data:', error));
        }
        async function fetchConvoData() {
            await fetch ('http://localhost:5000/getConversations')
            .then(response => response.json())
            .then(data => setConvoData(data))
            .catch(error => console.error('Error fetching data:', error));
            setIsLoading(false);
        }
        fetchData();
        fetchConvoData();
        setIsVisible(true);
    }, []);

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
                        <th className='wider-column'>Klausimas</th>
                        <th className='wider-column'>Tipas</th>
                        <th className='wider-column'>Pokalbio ID</th>
                        <th>Naikinti</th>
                        <th>Peržiūrėti</th>
                    </tr>  
                </thead>
                <tbody>
                    {
                        jsonData.map(item => {
                            let type = '';
                            if (item.type == 'duplicate') {
                                type = 'Boto atsakymas dubliavosi';
                            }
                            else {
                                type = 'Botas neturėjo atsakymo į šį klausimą'
                            }
                            return (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.prompt_text}</td>
                                <td>{type}</td>
                                <td>{item.conversationId}</td>
                                <td className='action-cell'>
                                    <button className='action-button' onClick={() => handleDeleteRow(item.id)}>
                                        <img className='icon' src={trashIcon}/>
                                    </button>
                                </td>
                                <td className='action-cell'>
                                    <button className='action-button' onClick={() => handleOpenRow(item.id)}>
                                        <img className='icon' src={inspectIcon}/>
                                    </button>
                                </td>
                            </tr>
                        )})
                    }
                </tbody>
            </table>
            {
            modalOpen && 
                <ConversationModal 
                    closeModal={() => setModalOpen(false)}
                    data={getRowById(rowToOpen)}/>
            }
        </div>
    )
)
}

export default UnansweredQuestions;