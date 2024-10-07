'use client'
import { useState } from "react";

export default function Signup() {
    const [ username, setUsername ] = useState('');
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ message, setMessage ] = useState('');

    const onSubmit = async (event: React.FormEvent) => {
        setMessage('Loading...');
        event.preventDefault();
        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: username, email: email, password: password })
        }).then((res: Response) => {
            console.log(res);
            res.json().then(val => {
                console.log(val);
                setMessage(`${val.message}. Code: ${val.code}`);
            })
        })
    }

    return (
        <div>
            <h1>Signup</h1>
            <form onSubmit={onSubmit}>
                <input placeholder="Username" type="text" defaultValue={username} onChange={e => setUsername(e.target.value)}></input>
                <input placeholder="Email" type="email" defaultValue={email} onChange={e => setEmail(e.target.value)}></input>
                <input placeholder="Password" type="password" defaultValue={password} onChange={e => setPassword(e.target.value)}></input>
                <button type="submit">Signup</button>
            </form>
            <p>{ message }</p>
        </div>
    )
}