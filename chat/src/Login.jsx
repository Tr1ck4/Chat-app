import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'
import icon from './assets/icon.png'

const LoginPopUp = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const handleSubmit = async (event) => {
        // event.preventDefault();      
        // try {
            
        //     const res = await axios.post('/api/login', {
        //         username: username,
        //         password: password
        //     });
            
        //     if (res.status >= 200 && res.status < 300) {
        //         window.location.reload(); 
        //     } else {
        //         throw new Error('Login failed: Invalid credentials');
        //     }
        // } catch (err) {
            
        //     alert('Login failed: ' + err.message);
        // }
    };
    
    return (
        <div className='loginBox'>
            <div className='welcome'>
                <p className='hello'>Hello, welcome back!</p>
                <p className='greet'>It's great to see you again!</p>
            </div>
            <form className='form' onSubmit={handleSubmit}>
                <div className='input'>
                    <div className='part'>USERNAME</div>
                    <input className='formInput' type="text" spellcheck='false' value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>

                <div className='input'>
                    <div className='part'>PASSWORD</div>
                    <input className='formInput' type="password" spellcheck='false' value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>

                <button className='login' type="submit" onClick={handleSubmit}>Login</button>

                <div className='input'>
                    <div style={ {color: '#B5BAC1', fontSize:'small', paddingTop: '5px'}}>Need an account? 
                        <a href='/register' style={{paddingLeft:'10px'}}>Register</a>
                    </div>
                </div>
            </form>
            <img src= {icon} style={{scale:'0.5', transform:'translate(150%,-180%)'}}></img>
            {/* <div className='avatar'/> */}
        </div>
    )
}

export default LoginPopUp;