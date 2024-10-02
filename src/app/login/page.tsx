'use client'
import { useState } from "react";

export default function Login() {
  const [ username, setUsername ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ message, setMessage ] = useState('');

  const handleChange = (e: React.FormEvent, fn: Function) => {
    e.preventDefault();
    fn((e.target as HTMLInputElement).value);
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let req = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', 
      },
      body: JSON.stringify({ username: username, password: password })
    }).then(async res => setMessage((await res.json()).message))
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={onSubmit}>
        <input placeholder="Username" type="text" onChange={e => handleChange(e, setUsername)} defaultValue={username}></input>
        <input placeholder="Password" type="password" onChange={e => handleChange(e, setPassword)} defaultValue={password}></input>
        <button type="submit">Login</button>
      </form>
      <p>{ message }</p>
    </div>
  );
}
