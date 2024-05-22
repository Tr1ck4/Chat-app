import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'
import icon from './assets/icon.png'

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const handleSubmit = async (event) => {
        event.preventDefault();      
        try {
            const res = await axios.post('/api/login', {//call api for login
                username: username,//username and password for parsing
                password: password
            });
            
            if (res.status >= 200 && res.status < 300) {
                window.location.replace('/'); //if success then process to homepage
            } else {
                throw new Error('Login failed: Invalid credentials');
            }
        } catch (err) {
            alert('Login failed: ' + err.message);
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

                    <button className='loginButton' type="submit" onClick={handleSubmit}>Login</button>

                    <div className='input'>
                        <div className = 'bottomline'>
                            <p>Need an account?</p> 
                            <a href='/register' style={{paddingLeft:'10px'}}>Register</a>
                        </div>
                    </div>
                </form>
                <img src= {icon} className = 'icon'></img>
            </div>
        </main>
    )
}

export default LoginPage;