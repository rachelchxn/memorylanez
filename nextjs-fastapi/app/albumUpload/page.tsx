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
        onChange={(event) => {
          if (event.target.files && userProfile) {
            supabase.storage
              .from("face_images")
              .upload(userProfile.id, event.target.files[0], {
                cacheControl: "3600",
                upsert: false,
              })
              .then((response) => {
                if (response.error) {
                  console.log(response.error);
                  return;
                }
                console.log("Uploaded file to object storage:", response);
                supabase
                  .from("users")
                  .upsert({
                    face_image: "face_images/" + userProfile.id + ".png",
                    spotify_username: userProfile.id,
                  })
                  .then((response: any) => {
                    if (response.error) {
                      console.log(response.error);
                      return;
                    }
                    console.log("Updated user profile with face image");
                  });
              });
          }
        }}
      />
    </main>
  );
}
