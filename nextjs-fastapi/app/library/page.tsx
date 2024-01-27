import React from "react";
import { 
  Button,
  Input 
} from "@nextui-org/react"

export default function Library() {
    return (
      <main className="flex justify-center bg-slate-800 min-h-screen max-w-1">
        <div className="max-w-lg flex-col gap-1 bg-slate-900">
          <input className="bg-gray-400 bg-opacity-40 w-full rounded-lg p-3 outline-none text-white"/>
          <Button className="bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10">
            Create Album
          </Button>
        </div>
      </main>
    );
  }