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
      <main className="flex justify-center bg-bgbeige min-h-screen">
        <div className="relative max-w-lg flex-col justify-center w-full h-screen bg-photoalbum px-10 py-10">
          <div>
            <div className="flex justify-between">
              <div className="my-3 text-burnt">
                Logo Placeholder
              </div>
              {(unreadNotif) ?
              (<Button isIconOnly variant="bordered" className="bg-gray-400 bg-opacity-40">
                <MarkChatUnreadIcon />
              </Button>) : 
              (<Button isIconOnly className="bg-burnt rounded-md">
                <ChatBubbleIcon className="text-white"/>
              </Button>)
              }
            </div>
            <div className="flex mt-3 mb-6 rounded-lg border-2 border-burnt">
              <div className="bg-transparent text-burnt rounded-l-lg py-3 pl-3 pr-1">
                <SearchIcon />
              </div>
              <input className="bg-transparent w-full rounded-r-lg py-3 pl-1 pr-3 outline-none text-burnt"/>
            </div>
          </div>
          <ScrollShadow hideScrollBar className="max-h-carousel w-full">
            <div className="bg-placeholder h-32 w-full rounded-lg text-center text-burnt font-bold py-12 mb-3">Placeholder</div>
            <div className="bg-placeholder h-32 w-full rounded-lg text-center text-burnt font-bold py-12 mb-3">Placeholder</div>
            <div className="bg-placeholder h-32 w-full rounded-lg text-center text-burnt font-bold py-12 mb-3">Placeholder</div>
            <div className="bg-placeholder h-32 w-full rounded-lg text-center text-burnt font-bold py-12 mb-3">Placeholder</div>
            <div className="bg-placeholder h-32 w-full rounded-lg text-center text-burnt font-bold py-12 mb-3">Placeholder</div>
            <div className="bg-placeholder h-32 w-full rounded-lg text-center text-burnt font-bold py-12 mb-3">Placeholder</div>
            <div className="bg-placeholder h-32 w-full rounded-lg text-center text-burnt font-bold py-12 mb-3">Placeholder</div>
            <div className="bg-placeholder h-32 w-full rounded-lg text-center text-burnt font-bold py-12 mb-3">Placeholder</div>
            <div className="bg-placeholder h-32 w-full rounded-lg text-center text-burnt font-bold py-12 mb-3">Placeholder</div>
          </ScrollShadow>
          <div className="flex justify-center">
            <Button 
              startContent={<AddIcon/>} 
              className="absolute bottom-0 mt-3 mb-10 tracking-widest font-medium text-md bg-burnt rounded-md"
              onClick={createButtonHandler} 
            >  
              CREATE ALBUM
            </Button>
          </div>
        </div>
      </main>
    );
  }