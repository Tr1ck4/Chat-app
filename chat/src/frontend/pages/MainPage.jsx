import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './MainPage.css';
import GroupModal from '../components/GroupModal';
import UserStatus from '../components/UserStatus';
import Setting from '../components/Setting';

const socket = io('http://localhost:3000');

function MainPage() {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [username, setUsername] = useState('');
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [isCreate, setIsCreate] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 480);


    useEffect(() => {
        window.addEventListener('resize', handleResize);
        
        return () => {
          window.removeEventListener('resize', handleResize);
        };
      }, []);

    useEffect(() => {
        const fetchUserData = async () => {
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

                    socket.emit('connected', Username);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                window.location.replace('/login');
            }
        };

        fetchUserData();

        return () => {
            socket.off('disconnect');
            socket.disconnect();
        };
    }, []);

    const handleResize = () => {
        setIsSmallScreen(window.innerWidth <= 480);
    };
    useEffect(() => {
        if (selectedGroup) {
            socket.emit('join', selectedGroup);

            const fetchMessages = async () => {
                try {
                    const response = await axios.get(`/api/groups/${selectedGroup}/0`);
                    setMessages(response.data.reverse());
                } catch (error) {
                    console.error('Error loading messages:', error);
                }
            };

            fetchMessages();

            const handleMessage = (msg) => {
                setMessages((prevMessages) => [...prevMessages, msg]);
                
            };

            socket.on('chat message', handleMessage);

            return () => {
                socket.off('chat message', handleMessage);
                socket.emit('leave', selectedGroup);
            };
        }
    }, [selectedGroup]);

    const handleGroupSelect = (group) => {
        if (selectedGroup !== group.id) {
            setSelectedGroup(group.id);
            setMessages([]);
        }
    };

    const handleMessageSubmit = () => {
        if (inputValue.trim() !== '') {
            socket.emit('chat message', { content: inputValue, chat_id: selectedGroup, username: username });
            setInputValue('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleMessageSubmit();
        }
    };

    const handleFind = () => {
        setIsCreate(true);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const closeModal = () => {
        setIsCreate(false);
    }

    const filteredGroups = groups.filter(group => 
        group.chatname.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <div className="mainpage">
                <div className="panel">
                    <div className="headbar">
                        <h1>SKOUT</h1>
                        <button className="add" onClick={handleFind}> 
                            <svg width="25px" height="25px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 10.5H16" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"/>
                            <path d="M8 14H13.5" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"/>
                            <path d="M17 3.33782C15.5291 2.48697 13.8214 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22C17.5228 22 22 17.5228 22 12C22 10.1786 21.513 8.47087 20.6622 7" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"/>
                            </svg>
                         </button>
                    </div>
                    <div style={{ paddingLeft: '1vw' }}>
                        <input 
                            className="search" 
                            type="text" 
                            placeholder="Search..." 
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <div className="groups">
                        {filteredGroups.map((group, index) => (
                                <div key={index} className="item" onClick={() => handleGroupSelect(group)}>
                                    <UserStatus username={group.chatname} chatname={group.chatname}></UserStatus>
                                    <span  className = 'chatname'>{group.chatname}</span>
                                </div>
                        ))}
                    </div>
                    <Setting isSmallScreen={isSmallScreen} username={username}></Setting>
                </div>
                {selectedGroup && (                   
                    <div className="chatarea">
                        <div className="chatbox">
                            {messages.map((message, index) => (
                                <div className={`messagebox ${message.username === username ? 'user' : 'other'}`} key={index}>
                                    <span>{message.content}</span>
                                </div>
                            ))}
                        </div>
                        <div className="inputbox">
                            <input
                                type="text"
                                onKeyDown={handleKeyDown}
                                className="chat-input"
                                value={inputValue}
                                placeholder="Message..."
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                        </div>
                    </div>                   
                )}
                
            </div>
            {isCreate && <GroupModal username={username} closeModal={closeModal}/>}
        </>
    );
}

export default MainPage;
