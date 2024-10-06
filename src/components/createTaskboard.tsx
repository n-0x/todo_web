import { useState } from "react";
import Dialog from "./dialog";

export default function CreateTaskboard() {
    const [ name, setName ] = useState<string | undefined>();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(name)
    }
    
    return (
        <Dialog>
            <div className="w-1/4 h-1/4 bg-red-700 p-5">
                <h1 className="text-4xl">Create taskboard</h1>
                <form onSubmit={ handleSubmit }>
                    <input placeholder="Name" type="text" onChange={ (e) => setName(e.target.value)} defaultValue= { name }></input>
                    <button type="submit">Create</button>
                </form>
            </div>
        </Dialog>
    )
}