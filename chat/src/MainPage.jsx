import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './MainPage.css'

//const socket = io('http://localhost:3000');



function MainPage() {
    // const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    // const [username, setUsername] = useState('');
    // const [groups, setGroups] = useState([]);
    // const [selectedGroup, setSelectedGroup] = useState(null);

    // useEffect(async () => {
    //     const fetchData = async () => {
    //         try {
    //             const res = await axios.get('/api/authenticate');
    //             const Username = res.data.username;
    //             if(!Username){
    //                 window.location.replace('/login');
    //             }
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
    
    const handleMessageSubmit = (e) => {
        if (inputValue.trim() !== '') {
            //socket.emit('chat message', {"content":inputValue, "chat_id":selectedGroup, "username" : username});
            setInputValue('');
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') { // Check if the pressed key is Enter
          handleMessageSubmit(); // Call handleMessageSubmit function
        }
      };
      
    const groups = [{"id":'1', "chatname": "Group 1"},{"id":'1', "chatname": "Group 1"},{"id":'1', "chatname": "Group 1"},{"id":'1', "chatname": "Group 1"},{"id":'1', "chatname": "Group 1"},{"id":'1', "chatname": "Group 1"},{"id":'1', "chatname": "Group 1"},{"id":'1', "chatname": "Group 1"},{"id":'2', "chatname": "Group 2"}
        ,{"id":'3', "chatname": "Group 3"},{"id":'4', "chatname": "Group 4"},{"id":'5', "chatname": "Group 5"}
    ];

    const messages = ['hello','hi','no'];

    return (
        <>          
            <div className="mainpage">
                <div className="panel">
                    <div className='search'><div>Search bar</div></div>
                    <div className='groups'>
                            {/* {groups.map((group, index) => (
                                <li key={index} onClick={() => handleGroupSelect(group.id)}>
                                    {group.chatname}
                                </li>
                            ))} */}
                            {groups.map((group, index) => (
                                <div key={index} className='item'>
                                    {group.chatname}
                                </div>
                            ))}
                    </div>
                    <div className = 'setting'>
                        <div className = 'img'><p>T</p></div>
                        <div className='name'> 
                            Your name
                        </div>
                        <div>Setting</div>
                    </div>
                </div>
                <div className="chatarea">
                    <div className='chatbox'>
                        {messages.map((message, index) => (
                            <div key={index}>{message}</div>
                        ))}
                    </div>
                    <div className='inputbox'>
                        <input
                            type="text"
                            onKeyDown={handleKeyDown}
                            className='chat-input'
                            value={inputValue}
                            placeholder='Message...'
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                    </div>
                </div>
            </div> 
                {/* {selectedGroup && (
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
                )} */}
            
        </>
    );
}

export default MainPage;
