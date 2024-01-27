"use client";

import { supabase } from "@/db";
import { useEffect, useState } from "react";

export default function Home() {
  const [userProfile, setUserProfile] = useState<any>(null);
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

  return (
    <main className="w-[430px] h-[932px] flex justify-center items-center bg-slate-100">
      <input
        type="file"
        name="faceImage"
        onChange={async (event) => {
          if (event.target.files && event.target.files[0] && userProfile) {
            const response = await supabase.storage
              .from("face_images")
              .upload(userProfile.id, event.target.files[0], {
                cacheControl: "3600",
                upsert: false,
              });

            if (response.error) {
              console.log(response.error);
              return;
            }

            const {data} = supabase.storage.from("face_images").getPublicUrl(
              userProfile.id
            );
            await supabase.from("users").upsert({
              face_image_path: "face_images" + "/" + userProfile.id,
              face_image: data.publicUrl,
              spotify_username: userProfile.id,
            });
          }
        }}
      />
    </main>
  );
}
