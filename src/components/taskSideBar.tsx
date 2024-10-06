'use client'
import { MouseEventHandler, useState } from "react"

export default function TaskSideBar() {

    const [hidden, setHidden] = useState(false);

    const sideBarVisible: JSX.Element = (
        <div className="flex bg-red-600  flex-col w-1/6">
            <div className="flex flex-row w-full justify-between *:m-2">
                <h1>Task-Boards</h1>
                <button onClick={ () => setHidden(true) }>Hide</button>
            </div>
            <div className="flex flex-col bg-blue-800 h-screen *:m-4 w-full">

            </div>
        </div>
    );

    const sideBarHidden: JSX.Element = (
        <div className="absolute">
            <button onClick={ () => setHidden(false) }>Show</button>
        </div>
    );


    return hidden ? sideBarHidden : sideBarVisible;
}