import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './MainPage.css'
import GroupModal from './GroupModal';

const socket = io('http://localhost:3000');
console.log(socket);

function MainPage() {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [username, setUsername] = useState('');
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [isCreate, setIsCreate] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('/api/authenticate');
                if (res.status !== 200) {
                    console.warn('Authentication failed, redirecting to login');
                    window.location.replace('/login');
                } else {
                    
                    const Username = res.data.username;
                    setUsername(Username);
    
                    const groupsRes = await axios.get(`/api/groups/${Username}`);
                    setGroups(groupsRes.data);

                    socket.on('connection', () => {
                        console.log('Connected to socket server');
                    });

                    socket.on('group created', () => {
                        window.location.reload();
                    });
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                window.location.replace('/login');
            }
        };
    
        fetchData();
    }, []);
    
    useEffect(()=>{
        if (selectedGroup){
            
            socket.emit('join', selectedGroup);

            loadMessages();

            socket.on('chat message', handleMessage);

            return () => {
                socket.off('chat message', handleMessage);
                socket.emit('leave', selectedGroup);
            };
        }
    },[selectedGroup])

    const handleGroupSelect = (group) => {
        if(selectedGroup != group){
            setSelectedGroup(group);
            setMessages([]); 
        }
    };

    const handleMessage = (msg) => {
        setMessages((prevMessages) => [...prevMessages, msg]);
    };

    const loadMessages = async () => {
        try {
            const response = await axios.get(`/api/groups/${selectedGroup}/0`);
            response.data.forEach((message) => {
                setMessages((prevMessages) => [...prevMessages, message]);
            })
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };
    
    const handleMessageSubmit = (e) => {
        if (inputValue.trim() !== '') {
            socket.emit('chat message', {content:inputValue, chat_id:selectedGroup, username:username});
            setInputValue('');
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') { 
          handleMessageSubmit(); 
        }
    };

    const handleFind = ()=>{
        setIsCreate(true);
    }

      

    return (
        <>          
            <div className="mainpage">
                <div className="panel">
                    <div className='headbar'>
                        <h1>SKOUT</h1>
                        <button className= 'add'onClick={handleFind}> + </button>
                    </div>
                    <div style={{paddingLeft:'1vw'}}>
                        <input className='search' type='text' placeholder='Search...'></input>
                    </div>  
                    <div className='groups'>
                            {groups.map((group, index) => (
                                <div key={index} className='item' onClick={() => handleGroupSelect(group.id)}>
                                    {group.chatname}
                                </div>
                            ))}
                    </div>
                    <div className = 'setting'>
                        <div className = 'img'><p>T</p></div>
                        <div className='name'> 
                            {username}
                        </div>
                        <div>Setting</div>
                    </div>
                </div>
                {selectedGroup && <div className="chatarea">
                    <div className='chatbox'>
                        {messages.map((message, index) => (
                            <div className={`messagebox ${message.username == username ? 'user':'other'}`} key={index}>
                                <span>{message.content}</span>
                            </div>
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
                </div>}
            </div>            
            {isCreate && <GroupModal username={username}/>}
        </>
    );
}

export default MainPage;
