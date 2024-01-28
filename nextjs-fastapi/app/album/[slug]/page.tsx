"use client";
import { useEffect, useCallback, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import React from "react";

import orange from "../../public/circle.png";
import pink from "../../public/ROSE.png";
import Image from "next/image";

import { Button } from "@nextui-org/react";

interface Track {
  id: string;
  name: string;
}  

export default async function Album({ params }: { params: { slug: string } }) {
    const slug = params.slug
    
    console.log(slug)

    const [tracks, setTracks] = useState<Track[]>([]);

    await fetch(`http://localhost:8000/api/get_album?_id=${slug}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      setTracks(data.tracks);
    })
    .catch((error) => {
      console.error("Mamma mia!", error);
    })

    return (
    <main className="flex justify-center bg-bgbeige min-h-screen">
        <div className="relative max-w-lg flex-col w-full h-screen bg-photoalbum px-10 py-[24rem] overflow-hidden">
          <div className="relative z-10">
            {
              tracks.map((track) => (
                <iframe
                  key={track.id}
                  src={`https://open.spotify.com/embed/track/${track.id}`}
                  width="300"
                  height="80"
                  allow="encrypted-media"
                ></iframe>
              ))
            }
          </div>
          <div className="-m-[32rem] -z-20">
              <Image width={2000} src={orange} alt=""/>
          </div>
          <div className="-my-[80rem] ml-0 -mr-[30rem] -z-10">
              <Image width={1500} src={pink} alt=""/>
          </div>
        </div>
      </main>
    );
}