import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import io from 'socket.io-client';
import './GroupModal.css';
import '../pages/MainPage.css';

const socket = io('http://localhost:3000');

export default function GroupModal({ username, closeModal }) {
  const [input, setInput] = useState("");
  const [users, setUsers] = useState([]);
  const [isFinding, setIsFinding] = useState(false);

  const modalRef = useRef(null);

  useEffect(() => {
      function handleClickOutside(event) {//if user click outside modal then close modal
          if (modalRef.current && !modalRef.current.contains(event.target)) {
              closeModal();
          }
      }

      document.addEventListener('mousedown', handleClickOutside);

      return () => {
          document.removeEventListener('mousedown', handleClickOutside);
      };
  }, [closeModal]);

  const findUser = async (value) => {
    if (value) {
      try {
        const response = await axios.get(`/api/users/${value}`);//find all users to create a new conversation
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
    socket.emit('create', { id: uuidv4(), username: username, partner: value });//create a uuid and announce to socket to create a chat
    socket.on('group created', () => {
      window.location.reload();//can change to insert into group set
    });
    setIsFinding(false);//close modal after create
  }

  return (
    <div className='findBox' ref={modalRef}>
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
      {(
        <div className={`findRes ${isFinding ? 'show' : ''}`}>
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
