'use client'
import { cookies } from "next/headers";
import { useEffect, useState } from "react";

export default function Login() {
  const [ username, setUsername ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ message, setMessage ] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    setMessage('Loading...');
    e.preventDefault();
    let req = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', 
      },
      body: JSON.stringify({ username: username, password: password })
    }).then(async res => {
      const json = await res.json();
      setMessage(json.message)
      if (res.ok) {
        window.location.replace('/')
      }
    })
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={onSubmit}>
        <input placeholder="Username" type="text" onChange={e => setUsername(e.target.value)} defaultValue={username}></input>
        <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} defaultValue={password}></input>
        <button type="submit">Login</button>
      </form>
      <p>{ message }</p>
    </div>
  );
}
