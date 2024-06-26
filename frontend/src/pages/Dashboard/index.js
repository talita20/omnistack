import React, {useEffect, useState, useMemo} from 'react'; // useMemo -> memoriza uma variável até o momento que ela mudar
import {Link} from 'react-router-dom';
import socketio from 'socket.io-client';
import api from '../../services/api';

import './styles.css';

export default function Dashboard() {
    const [spots, setSpots] = useState([]);
    const [requests, setRequests] = useState([]);

    // só refaz a conexão se o user_id alterar
    const user_id = localStorage.getItem('user');
    const socket = useMemo(() => socketio('http://localhost:3333', {
        query: {user_id},
    }), [user_id]);

    useEffect(() => {
        socket.on('booking_request', data => {
            setRequests([...requests, data]);
        });

        /*socket.on('hello', data => {
            console.log(data);
        })*/
        //socket.emit('omni', 'Stack');
    }, [requests, socket]);

    useEffect(() => {
        async function loadSpots() {
            const user_id = localStorage.getItem('user');
            const response = await api.get('/dashboard', {
                headers: {user_id}
            });

            setSpots(response.data);
        }

        loadSpots();
    }, []);

    async function handleAccepted(id) {
        await api.post(`/bookings/${id}/approvals`);

        setRequests(requests.filter(request => request._id !== id));
    }

    async function handleReject(id) {
        await api.post(`/bookings/${id}/rejections`);

        setRequests(requests.filter(request => request._id !== id));
    }

    return (
        <>
            <ul className="notifications">
                {requests.map(request => (
                    <li key={request._id}>
                        <p>
                            <strong>{request.user.email}</strong> está solicitando uma reserva
                            em <strong>{request.spot.company}</strong> para a data: <strong>{request.date}</strong>
                            <button className="accept" onClick={() => handleAccepted(requests._id)}>ACEITAR</button>
                            <button className="reject" onClick={() => handleReject(requests._id)}>REJEITAR</button>
                        </p>
                    </li>
                ))}
            </ul>

            <ul className="spot-list">
                {spots.map(spot => (
                    <li key={spot._id}>
                        <header style={{backgroundImage: `url(${spot.thumbnail_url})`}}/>
                        <strong>{spot.company}</strong>
                        <span>{spot.price ? `R$${spot.price}/dia` : 'GRATUITO'}</span>
                    </li>
                ))}
            </ul>

            <Link to="/new">
                <button className="btn">Cadastrar novo spot</button>
            </Link>
        </>
    )
}