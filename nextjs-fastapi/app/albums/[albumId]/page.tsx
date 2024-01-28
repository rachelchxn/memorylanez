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
import ReplyIcon from "@mui/icons-material/Reply";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  ScrollShadow,
} from "@nextui-org/react";

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
  const [faceImageUrl, setFaceImageUrl] = useState<null | string>(null);

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

    async function wassupReconnections() {
      const { data, error } = await supabase
        .from("user_album")
        .select(`spotify_username`) //WTF IS GOING ON I HATE SQL
        .eq("album_id", params.albumId)
        .maybeSingle();
      if (!data) {
        console.log(error);
        return;
      }

      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("spotify_username", data.spotify_username)
        .single();

      if (!user) {
        console.log(userError);
        return;
      }
      setFaceImageUrl(user.face_image);
    }

     updateSlideshow()
     wassupReconnections()

  }, [count, params.albumId])


  const {isOpen, onOpen, onOpenChange} = useDisclosure();


  return (
    <main className="flex justify-center bg-bgbeige min-h-screen">
      <div className="relative max-w-lg flex-col w-full h-screen bg-photoalbum px-10 py-10 overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between">
            <h1 className="text-black text-lg align-center mb-8">{title}</h1>

            <Button isIconOnly onPress={onOpen}>
              <ReplyIcon className="text-white" />
            </Button>
          </div>
          <div className="flex justify-end">
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalHeader>See Your Reconnections!</ModalHeader>
                    <ModalBody>
                      <ScrollShadow></ScrollShadow>
                    </ModalBody>
                  </>
                )}
              </ModalContent>
            </Modal>
          </div>
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
