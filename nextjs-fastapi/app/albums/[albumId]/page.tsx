"use client";

import { supabase } from "@/db";

import { useEffect, useCallback, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import React from "react";

import orange from "../../../public/circle.png";
import pink from "../../../public/ROSE.png";
import Image from "next/image";

import { Button } from "@nextui-org/react";

interface Track {
  id: string;
  name: string;
}

export default function Album({ params }: { params: { albumId: string } }) {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [tracks, setTracks] = useState<Track[]>([]);

  const router = useRouter();
  useEffect(() => {
    console.log(localStorage.getItem("providerAccessToken"));
    fetch("/api/get_profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: localStorage.getItem("providerAccessToken"),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setUserProfile(data);
      });
  }, []);


  useEffect(() => {
    async function getTracks() {
      const { data, error } = await supabase
        .from("albums")
        .select("tracks")
        .eq("id", params.albumId)
        .single();
      if (!data) {
        console.log(error);
        return;
      }

      console.log(data)
      setTracks(data.tracks);
    }

    getTracks()
  }, [params.albumId])

  console.log(params.albumId)


  return (
    <main className="flex justify-center bg-bgbeige min-h-screen">
      <div className="relative max-w-lg flex-col w-full h-screen px-10 py-[24rem] overflow-hidden">
        <div className="relative z-10">
            {tracks &&
              tracks.map((track) => (
                <div className="flex justify-center">
                  <iframe
                    key={track.id}
                    src={`https://open.spotify.com/embed/track/${track}`}
                    allow="encrypted-media"
                    height="80"
                    width="300"
                    className="rounded-xl my-3"
                  ></iframe>
                </div>
              ))}
        </div>
        <div className="-m-[32rem] -z-20">
          <Image width={2000} src={orange} alt="" />
        </div>
        <div className="-my-[80rem] ml-0 -mr-[30rem] -z-10">
          <Image width={1500} src={pink} alt="" />
        </div>
      </div>
    </main>
  );
}
