import React from 'react';
import './pages.css';
import { DeleteModal } from '../components/DeleteModal';

const FAQ = () => {
    // Data state
    const [jsonData, setJsonData] = React.useState([]);
    const [isVisible, setIsVisible] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);

    // Fetch the data
    React.useEffect(() => {
        async function fetchData() {
            await fetch ('http://localhost:5000/getFAQ')
            .then(response => response.json())
            .then(data => setJsonData(data))
            .catch(error => console.error('Error fetching data:', error));
        }
        fetchData();
        setIsLoading(false);
        setIsVisible(true);
    }, []);

    const handleDelete =  () => {
        setDeleteModalOpen(true);
    }

    const handleDeleteFAQ = async () => {
        setIsLoading(true);
        // Call API to update the table row
        try {
            await fetch('http://localhost:5000/deleteFAQ', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error(error);
        }

        // Call API to fetch new data
        try {
            const response = await fetch('http://localhost:5000/getFAQ');
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
                        <th className='expand'>Tema</th>
                        <th className='expand'>Dažnis</th>
                    </tr>  
                </thead>
                <tbody>
                    {
                        jsonData.map(item => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.topic}</td>
                                <td>{item.count}</td>
                            </tr>
                        ))
                    }
                </tbody>
                <tfoot>
                <tr>
                    <td colSpan={10} className='btn-wrapper'>
                        <button className='footer-btn' onClick={() => handleDelete()}>Išvalyti</button>
                    </td>
                </tr>
            </tfoot>
            </table>
            {
            deleteModalOpen && 
                <DeleteModal 
                    closeModal={() => setDeleteModalOpen(false)}
                    handleDelete={() => handleDeleteFAQ()}
                    handleCancel={() => setDeleteModalOpen(false)}
                    title={'Ar tikrai norite ištrinti D.U.K.?'}/>
            }
        </div>
    )
);
}

export default FAQ;