import React, { useState } from 'react';
import './pages.css';
import trashIcon from '../svg/trash-icon.svg';
import inspectIcon from '../svg/inspect-icon.svg';
import { ConversationModal } from '../components/ConversationModal';
import { DeleteModal } from '../components/DeleteModal';

const AllConversations = () => {
    // Data state
    const [jsonData, setJsonData] = React.useState([]);
    const [isVisible, setIsVisible] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [rowToOpen, setRowToOpen] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
    const [rowToDelete, setRowToDelete] = React.useState(false);

    const handleOpenRow = (idx) => {
        setRowToOpen(idx);
        setModalOpen(true);
    }

    const handleDelete = (id) => {
        setRowToDelete(id);
        setDeleteModalOpen(true);
    }

    const getRowById = () => {
        let rowToReturn = {}
        jsonData.forEach(row => {
            if (row.id === rowToOpen) {
                rowToReturn = row;
            }
        });
        return rowToReturn;
    }

    // Fetch the data
    React.useEffect(() => {
        async function fetchData() {
            await fetch ('http://localhost:5000/getConversations')
            .then(response => response.json())
            .then(data => setJsonData(data))
            .catch(error => console.error('Error fetching data:', error));
        }
        fetchData();
        setIsLoading(false);
        setIsVisible(true);
    }, []);

    const handleDeleteRow = async (idx) => {
        setIsLoading(true);
        // Call API to update the table row
        try {
            await fetch('http://localhost:5000/deleteConversationRow', {
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
            const response = await fetch('http://localhost:5000/getConversations');
            const result = await response.json();
            setJsonData(result);
            setIsLoading(false);
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
        setDeleteModalOpen(false);
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
                        <th className='expand'>Pokalbis</th>
                        <th>Naikinti</th>
                        <th>Peržiūrėti</th>
                    </tr>  
                </thead>
                <tbody>
                    {
                        jsonData.map(item => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.conversation_text}</td>
                                <td className='action-cell'>
                                    <button className='action-button' onClick={() => handleDelete(item.id)}>
                                        <img className='icon' src={trashIcon}/>
                                    </button>
                                </td>
                                <td className='action-cell'>
                                    <button className='action-button' onClick={() => handleOpenRow(item.id)}>
                                        <img className='icon' src={inspectIcon}/>
                                    </button>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            {
            modalOpen && 
                <ConversationModal 
                    closeModal={() => setModalOpen(false)}
                    data={getRowById(rowToOpen)}/>
            }
            {
            deleteModalOpen && 
                <DeleteModal 
                    closeModal={() => setDeleteModalOpen(false)}
                    handleDelete={() => handleDeleteRow(rowToDelete)}
                    handleCancel={() => setDeleteModalOpen(false)}
                    title={`Visi su šiuo pokalbiu susiję neatsakyti klausimai bus taip pat ištrinti. Ar tikrai norite ištrinti pokalbį nr. ${rowToDelete}?`}/>
            }
        </div>
    )
);
}

export default AllConversations;