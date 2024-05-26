import React from 'react';
import './pages.css';

const FAQ = () => {
    // Data state
    const [jsonData, setJsonData] = React.useState([]);
    const [isVisible, setIsVisible] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

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
                        <button className='footer-btn'>Išvalyti</button>
                    </td>
                </tr>
            </tfoot>
            </table>
        </div>
    )
);
}

export default FAQ;