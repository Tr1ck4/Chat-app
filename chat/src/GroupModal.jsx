import React, { useState } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import io from 'socket.io-client';
import './Modal.css';
import './MainPage.css';

const socket = io('http://localhost:3000');

export default function GroupModal({ username }) {
  const [input, setInput] = useState("");
  const [users, setUsers] = useState([]);
  const [isFinding, setIsFinding] = useState(false);

  const findUser = async (value) => {
    if (value) {
      try {
        const response = await axios.get(`/api/users/${value}`);
        setUsers(response.data);
        setIsFinding(true);
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
        setIsFinding(false);
      }
    } else {
      setUsers([]);
      setIsFinding(false);
    }
  };

  const handleUserClick = (value) => {
    socket.emit('create', { id: uuidv4(), username: username, partner: value });
    setIsFinding(false);
  }

  return (
    <div className='findBox'>
      To :
      <input
        className='findArea'
        value={input}
        placeholder='username...'
        onChange={(e) => {
          setInput(e.target.value);
          findUser(e.target.value);
        }}
      />
      {isFinding && (
        <div className='findRes'>
          {users.length > 0 ? (
            users.map((user, index) => (
              <div className='item' key={index}>
                <p onClick={() => handleUserClick(user.username)}>{user.display_name}</p>
              </div>
            ))
          ) : (
            <p>No users found</p>
          )}
        </div>
      )}
    </div>
  );
}
