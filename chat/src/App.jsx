import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import LoginPopUp from './Login.jsx';
import './App.css'

const socket = io('http://localhost:3000');

function App() {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [username, setUsername] = useState('');
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);

    // useEffect(async () => {
    //     const fetchData = async () => {
    //         try {
    //             const res = await axios.get('/api/authenticate');
    //             const Username = res.data.username;
    //             setUsername(Username);
        
    //             const groupsRes = await axios.get(`/api/groups/${Username}`);
    //             setGroups(groupsRes.data);
    //         } catch (error) {
    //             console.error('Error fetching data:', error);
    //         }
    //     };
        
    //     fetchData();
        
    // }, []);

    // useEffect(()=>{
    //     if (selectedGroup){
    //         socket.emit('join', selectedGroup);

            
            
    //         loadMessages();

    //         socket.on('chat message', handleMessage);

    //         return () => {
    //             socket.off('chat message', handleMessage);
    //             socket.emit('leave', selectedGroup);
    //         };
    //     }
    // },[selectedGroup])
    // const handleGroupSelect = (group) => {
    //     setSelectedGroup(group);
    //     setMessages([]); 
    // };

    // const handleMessage = (msg) => {
    //     setMessages((prevMessages) => [...prevMessages, msg]);
    // };

    // const loadMessages = async () => {
    //     try {
    //         const response = await axios.get(`/api/groups/${selectedGroup}/0`);
    //         response.data.forEach((message) => {
    //             setMessages((prevMessages) => [...prevMessages, message.content]);
    //         })
    //     } catch (error) {
    //         console.error('Error loading messages:', error);
    //     }
    // };
    
    

    // const handleMessageSubmit = (e) => {
    //     e.preventDefault();
    //     if (inputValue.trim() !== '') {
    //         socket.emit('chat message', {"content":inputValue, "chat_id":selectedGroup, "username" : username});
    //         setInputValue('');
    //     }
    // };

    return (
        <>
            {/* {!username && <LoginPopUp/>}
            {username && (
                <div>
                    <h1>Welcome, {username}</h1>
                    <div>
                        <h2>Select a Group</h2>
                        <ul>
                            {groups.map((group, index) => (
                                <li key={index} onClick={() => handleGroupSelect(group.id)}>
                                    {group.chatname}
                                </li>
                            ))}
                        </ul>
                    </div>
                    {selectedGroup && (
                        <div>
                            <ul>
                                {messages.map((message, index) => (
                                    <li key={index}>{message}</li>
                                ))}
                            </ul>
                            <form onSubmit={handleMessageSubmit}>
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                />
                                <button type="submit">Send</button>
                            </form>
                        </div>
                    )}
                </div> 
            )} */}
            <main className="bg">
                <LoginPopUp/>
            </main>
        </>
    );
}

export default App;
