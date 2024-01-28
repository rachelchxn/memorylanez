"use client";

import { supabase } from "@/db";

import { useEffect, useCallback, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import React from "react";

import orange from "../../../public/circle.png";
import pink from "../../../public/ROSE.png";
import Image from "next/image";
import { Button } from "@nextui-org/react";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

interface Track {
  id: string;
  name: string;
}

export default function Album({ params }: { params: { albumId: string } }) {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [count, setCount] = useState<number>(0);
  const [currPhoto, setCurrPhoto] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [currTrack, setCurrTrack] = useState<Track>();
  const [albumLength, setAlbumLength] = useState<number>();

  // const router = useRouter();
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

      console.log(data);
      setTracks(data.tracks);
    }

    getTracks();
  }, [params.albumId]);

  useEffect(() => {
    updateSlideshow();
  }, [count]);

  async function updateSlideshow() {
    const { data, error } = await supabase
      .from("albums")
      .select("tracks, images, title")
      .eq("id", params.albumId)
      .single();
    if (!data) {
      console.log(error);
      return;
    }
    if (count >= 0 && count <= data.tracks.length) {
      setCurrPhoto(data.images[count]);
      setCurrTrack(data.tracks[count]);
    }

    setAlbumLength(data.tracks.length);
    setTitle(data.title);
  }

  console.log(params.albumId);

  return (
    <main className="flex justify-center bg-bgbeige min-h-screen">
      <div className="relative max-w-lg flex-col w-full h-screen bg-photoalbum px-10 py-10 overflow-hidden">
        <div className="relative z-10">
          <h1>{title}</h1>
          <div className="flex justify-center">
            <img src={currPhoto} alt="" className="w-[100%] bottom-[auto]" />
          </div>
        </div>
        <div className="relative z-10">
          <div className="fixed bottom-10">
            <div className="flex justify-center">
              {count == 0 ? (
                <div className="mt-16 mx-3">
                  <Button isIconOnly className="bg-burnt rounded-md">
                    <ArrowBackIosNewIcon className="text-gray-500" />
                  </Button>
                </div>
              ) : (
                <div className="mt-16 mx-3">
                  <Button
                    onClick={() => setCount(count - 1)}
                    isIconOnly
                    className="bg-burnt rounded-md"
                  >
                    <ArrowBackIosNewIcon className="text-gray-500" />
                  </Button>
                </div>
              )}
              <div className="mt-10 mx-3">
                <iframe
                  src={`https://open.spotify.com/embed/track/${currTrack}`}
                  allow="encrypted-media"
                  height="80"
                  width="300"
                  className="rounded-xl"
                ></iframe>
              </div>
              {count == albumLength ? (
                <div className="mt-16">
                  <Button isIconOnly className="bg-burnt rounded-md">
                    <ArrowForwardIosIcon className="text-white" />
                  </Button>
                </div>
              ) : (
                <div className="mt-16">
                  <Button
                    onClick={() => setCount(count + 1)}
                    isIconOnly
                    className="bg-burnt rounded-md"
                  >
                    <ArrowForwardIosIcon className="text-white" />
                  </Button>
                </div>
              )}
            </div>
          </div>
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
