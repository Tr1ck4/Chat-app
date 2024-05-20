import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './UserStatus.css';

function UserStatus({ username, chatname }) {
    const [status, setStatus] = useState(0);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await axios.get(`/api/status/${username}`);
                setStatus(res.data.status);
            } catch (error) {
                console.error('Error fetching user status:', error);
            }
        };

        fetchStatus();

        const interval = setInterval(fetchStatus, 5000);

        return () => clearInterval(interval);
    }, [username]);

    return (
        <div className="user-status">
            <div className="circle">
                <span className="initial" style={{backgroundColor: 'transparent'}}>{username.charAt(0).toUpperCase()}</span>
                <div className={`status-point ${status === 1 ? 'online' : 'offline'}`}></div>
            </div>
        </div>
    );
}

export default UserStatus;
