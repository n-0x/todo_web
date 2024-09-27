'use client'
import { signInUser } from "@/utils/auth";
import { UserCredential } from "firebase/auth";
import { useState } from "react";

export default function Login() {
  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ message, setMessage ] = useState('');

  const handleChange = (e: React.FormEvent, fn: Function) => {
    e.preventDefault();
    fn(e.currentTarget.nodeValue);
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let req = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email, password: password })
    }).then(async res => setMessage('Hello!'))
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={onSubmit}>
        <input placeholder="Email" type="email" onChange={e => handleChange(e, setEmail)} defaultValue={email}></input>
        <input placeholder="Password" type="password" onChange={e => handleChange(e, setPassword)} defaultValue={password}></input>
        <button type="submit">Login</button>
        <p defaultValue={message}></p>
      </form>
    </div>
  );
}
