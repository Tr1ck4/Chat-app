import { useState } from 'react';
import axios from 'axios';
import './Modal.css'
import ''

export default function GroupModal() {
  const [input, setInput] = useState("");
  const [users, setUsers] = useState([]);
  const [isFinding, setIsFinding] = useState(false);

  const findUser = async (value) => {
    if (value) {
      try {
        const response = await axios.get(`/api/users/${value}`);
        console.log('API response:', response.data); // Log API response
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

  const handleUserClick = () =>{

  }

  return (
    <>
      <div className='findBox'>
        To :
        <input
          className='findArea'
          value={input}
          placeholder='username...'
          onChange={(e) => {setInput(e.target.value);findUser(e.target.value)}}
        />
        {isFinding && (
          <div>
            {users.length > 0 ? (
              users.map((user, index) => (
                <div onClick={handleUserClick} className='item'>
                    <p key={index}>{user.display_name} ({user.username})</p>
                </div>
              ))
            ) : (
              <p>No users found</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
