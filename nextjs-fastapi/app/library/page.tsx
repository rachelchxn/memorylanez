'use client';

import React, { useState } from "react";
import { 
  Button,
  ScrollShadow 
} from "@nextui-org/react";
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import MarkChatUnreadIcon from '@mui/icons-material/MarkChatUnread';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useRouter } from "next/navigation"

export default function Library() {
  const router = useRouter()

  const [unreadNotif, setUnreadNotif] = useState(false);
  
  const createButtonHandler = (event) => {
    router.push('/create')
  }

  return (
      <main className="flex justify-center bg-slate-800 min-h-screen">
        <div className="relative max-w-lg flex-col justify-center w-full h-screen bg-gradient-to-b from-slate-900 from-50% to-emerald-950 to-99% px-20 py-10">
          <div>
            <div className="flex justify-between">
              <div className="my-3 text-white">
                Logo Placeholder
              </div>
              {(unreadNotif) ?
              (<Button isIconOnly>
                <MarkChatUnreadIcon className="bg-gray-400 bg-opacity-40"/>
              </Button>) : 
              (<Button isIconOnly className="bg-gray-400 bg-opacity-40">
                <ChatBubbleIcon />
              </Button>)
              }
            </div>
            <div className="flex">
              <div className="mt-3 mb-6 bg-gray-400 bg-opacity-40 text-white rounded-l-lg py-3 pl-3 pr-1">
                <SearchIcon />
              </div>
              <input className="mt-3 mb-6 bg-gray-400 bg-opacity-40 w-full rounded-r-lg py-3 pl-1 pr-3 outline-none text-white"/>
            </div>
          </div>
          <ScrollShadow hideScrollBar className="max-h-carousel w-full">
            <div className="bg-gray-400 bg-opacity-40 h-32 w-full rounded-lg text-center text-white font-bold py-12 mb-3">Placeholder</div>
            <div className="bg-gray-400 bg-opacity-40 h-32 w-full rounded-lg text-center text-white font-bold py-12 mb-3">Placeholder</div>
            <div className="bg-gray-400 bg-opacity-40 h-32 w-full rounded-lg text-center text-white font-bold py-12 mb-3">Placeholder</div>  
            <div className="bg-gray-400 bg-opacity-40 h-32 w-full rounded-lg text-center text-white font-bold py-12 mb-3">Placeholder</div>
            <div className="bg-gray-400 bg-opacity-40 h-32 w-full rounded-lg text-center text-white font-bold py-12 mb-3">Placeholder</div>
            <div className="bg-gray-400 bg-opacity-40 h-32 w-full rounded-lg text-center text-white font-bold py-12 mb-3">Placeholder</div>
          </ScrollShadow>
          <div className="flex justify-center">
            <Button 
              startContent={<AddIcon/>} 
              className="absolute bottom-0 mt-3 mb-10 font-bold bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-40"
              onClick={createButtonHandler} 
            >  
              Create Album
            </Button>
          </div>
        </div>
      </main>
    );
  }