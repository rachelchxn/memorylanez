"use client";

import { supabase } from "@/db";

import { useEffect, useCallback, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import React from "react";

import orange from "../../../public/circle.png";
import pink from "../../../public/ROSE.png";
import Image from "next/image";
import { Button, Link, ScrollShadow } from "@nextui-org/react";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { Reply } from "@mui/icons-material";

interface Track {
  id: string;
  name: string;
}

export default function Album({ params }: { params: { albumId: string } }) {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [count, setCount] = useState<number>(0);
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState<string>("");
  const [currTrack, setCurrTrack] = useState<Track>();
  const [albumLength, setAlbumLength] = useState<number>();
  const [faceImageUrl, setFaceImageUrl] = useState<null | string>(null);
  const scrollIntervalRef = useRef(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null); // Adjust the element type if needed

  const startAutoScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;

      setInterval(() => {
        if (
          container.scrollTop + container.clientHeight >=
          container.scrollHeight
        ) {
          container.scrollTop = 0;
        } else {
          container.scrollTop += 1; // Adjust the scroll speed if needed
        }
      }, 20); // Adjust the interval if needed
    }
  };

  useEffect(() => {
    startAutoScroll();
  }, []);

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
      setImages(data.images);
      setCurrTrack(data.tracks[count]);
    }

    setAlbumLength(data.tracks.length);
    setTitle(data.title);
  }

  console.log(params.albumId);

  return (
    <main className="flex justify-center bg-bgbeige min-h-screen">
      <div className="relative max-w-lg flex-col w-full h-screen bg-photoalbum px-8 py-8 overflow-hidden">
        <div className="relative z-10">
          <h1>{title}</h1>
          <div className="flex justify-center">
            <div
              className="absolute w-[100%] z-50 top-0 px-4 pt-10 pb-20 "
              style={{
                background: "linear-gradient(to bottom, #e3d8cd, transparent)",
              }}
            >
              <Link href="/library">Back</Link>
              <div className="flex justify-between items-baseline">
                <h1 className="text-black text-lg align-center mb-4">
                  {title}
                </h1>
                <Button isIconOnly>
                  <Reply className="text-white" />
                </Button>
              </div>
            </div>
            <ScrollShadow
              hideScrollBar
              className="relative mt-8 h-[80vh] w-full"
              ref={scrollContainerRef}
            >
              {images.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Image ${index}`}
                  className="w-full mb-8"
                />
              ))}
            </ScrollShadow>
          </div>
        </div>
        <div className="relative z-10">
          <div className="fixed bottom-10">
            <div className="flex justify-between items-center w-[115%]">
              {count == 0 ? (
                <div>
                  <Button isIconOnly className="bg-burnt rounded-md">
                    <ArrowBackIosNewIcon className="text-gray-500" />
                  </Button>
                </div>
              ) : (
                <div>
                  <Button
                    onClick={() => setCount(count - 1)}
                    isIconOnly
                    className="bg-burnt rounded-md"
                  >
                    <ArrowBackIosNewIcon className="text-gray-500" />
                  </Button>
                </div>
              )}
              <div>
                <iframe
                  src={`https://open.spotify.com/embed/track/${currTrack}`}
                  allow="encrypted-media"
                  height="80"
                  width="300"
                  className="rounded-xl"
                ></iframe>
              </div>
              {count == albumLength ? (
                <div>
                  <Button isIconOnly className="bg-burnt rounded-md">
                    <ArrowForwardIosIcon className="text-white" />
                  </Button>
                </div>
              ) : (
                <div>
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
