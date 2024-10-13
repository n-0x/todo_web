'use client'
import { withAuth } from "@/lib/client/auth";
import TaskBoardBar from "@/components/taskBoardBar";
import { useEffect } from "react";

export default function Home() {
    useEffect(withAuth);
    return (
        <div className="flex flex-row h-screen">
            <TaskBoardBar />
        </div>
    )
}