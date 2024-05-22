import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'
import icon from './assets/icon.png'

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const handleSubmit = async (event) => {
        event.preventDefault();      
        try {
            const res = await axios.post('/api/register', {//call api for register a new account
                username: username,//parse username and password for data
                password: password
            });
            console.log(res);
            if (res.status >= 200 && res.status < 300) {
                window.location.replace('/login'); //if succeed creating a new account, user needs to login
            } else {
                throw new Error('Register failed: Invalid username or password');
            }
        } catch (err) {
            alert('Register failed: ' + err.message);
        }
    };
    
    return (
        <main className = 'bg'>
            <div className='loginBox'>
                <div className='welcome'>
                    <p className='hello'>Hello, welcome back!</p>
                    <p className='greet'>It's great to see you again!</p>
                </div>
                <form className='form' onSubmit={handleSubmit}>
                    <div className='input'>
                        <div className='part'>USERNAME</div>
                        <input className='formInput' type="text" spellCheck='false' value={username} onChange={(e) => setUsername(e.target.value)} />
                    </div>

                    <div className='input'>
                        <div className='part'>PASSWORD</div>
                        <input className='formInput' type="password" spellCheck='false' value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>

                    <button className='login' type="submit" onClick={handleSubmit}>Register</button>

                </form>
                <img src= {icon} className = 'icon'></img>
            </div>
        </main>
    )
}

export default RegisterPage;