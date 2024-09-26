'use client'
import { useState } from "react";

export default function Signup() {
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const res = await fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email, password: password })
        })
    }

    return (
        <div>
            <h1>Signup</h1>
            <form onSubmit={handleSubmit}>
                <input placeholder="Username" type="text"></input>
                <input placeholder="Email" type="email"></input>
                <input placeholder="Password" type="password"></input>
                <button type="submit">Signup</button>
            </form>
        </div>
    )
}