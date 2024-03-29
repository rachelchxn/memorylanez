"use client";

import React, { useEffect, useState } from "react";
import { Button, ScrollShadow } from "@nextui-org/react";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import MarkChatUnreadIcon from "@mui/icons-material/MarkChatUnread";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { useRouter } from "next/navigation";
import Image from "next/image";
import orange from "../../public/circle.png";
import pink from "../../public/ROSE.png";
import { supabase } from "@/db";
import Link from "next/link";

export default function Library() {
  const router = useRouter();

  const [albums, setAlbums] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [invitations, setInvitations] = useState<any>(null);
  const [fromUserProfile, setFromUserProfile] = useState<any>(null);
  const [faceImageUrl, setFaceImageUrl] = useState<any>(null);
  const [inviteData, setInviteData] = useState<any>(null);

  useEffect(() => {
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
    if (!userProfile) return;
    async function wassupReconnections() {
      const { data, error } = await supabase
        .from("invites")
        .select(`*`) //WTF IS GOING ON I HATE SQL
        .eq("spotify_username_to", userProfile.display_name)
        .maybeSingle();

      setInviteData(data);

      if (!data) {
        console.log(error);
        return;
      }

      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("spotify_username", data.spotify_username_from)
        .single();

      setFromUserProfile(user);

      console.log(user);
      if (!user) {
        console.log(userError);
        return;
      }
      setFaceImageUrl(user.face_image);
    }

    wassupReconnections();
  }, [userProfile, setFaceImageUrl]);

  return (
    <main className="flex justify-center bg-bgbeige min-h-screen">
      <div className="relative max-w-lg flex-col justify-center w-full h-screen bg-photoalbum px-10 py-10 overflow-hidden">
        <div className="relative z-10">
          <div>
            <div className="relative flex justify-between">
              <div className="my-3 text-2xl font-bold font-serif text-burnt">
                Momentune
              </div>
            </div>
          </div>
          {inviteData && (
            <Link href={inviteData.link}>
              <div
                className="w-[100%] p-4 flex gap-4 mb-4 rounded-lg"
                style={{ backgroundColor: "rgba(245, 245, 220, 0.5)" }}
              >
                <img
                  src={faceImageUrl}
                  className="w-24 h-24 object-cover rounded-sm"
                />
                <p className="text-burnt">{inviteData.message}</p>
              </div>
            </Link>
          )}
        </div>
        <div className="-m-[64rem] -z-20">
          <Image width={2000} src={orange} alt="" />
        </div>
        <div className="-my-[115rem] ml-0 -mr-[30rem] -z-10">
          <Image width={1500} src={pink} alt="" />
        </div>
      </div>
    </main>
  );
}
