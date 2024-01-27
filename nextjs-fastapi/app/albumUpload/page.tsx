"use client";

import { supabase } from "@/db";
import { useEffect, useState } from "react";

export default function Home() {
  const [userProfile, setUserProfile] = useState<any>(null);
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

  console.log(userProfile)

  return (
    <main className="w-[430px] h-[932px] flex justify-center items-center bg-slate-100">
      <input
        type="file"
        name="userUpload"
        multiple
        onChange={async (event) => {
          console.log("test")
          if (event.target.files && userProfile) {
            const {data, error} = await supabase.from("albums").upsert({
              owner: userProfile.id,
            }, {}).select().single();

            let images_uploaded = [] as string[]

            for (let i = 0; i < event.target.files.length; i++) {
              const file = event.target.files[i];
              const res = await supabase.storage
                .from(`user_uploads/${userProfile.id}/${data.id}`)
                .upload(i.toString(), file, {
                  cacheControl: "3600",
                  upsert: false,
                });
              if (res.error) {
                console.log(res.error);
                return;
              }
              console.log("Uploaded file to object storage:", res);
              const {data: pubUrlData} = await supabase.storage.from(`user_uploads/${userProfile.id}/${data.id}`).getPublicUrl(i.toString())
              images_uploaded.push(pubUrlData.publicUrl);
              // await supabase
              //   .from("albums")
              //   .upsert({
              //     face_image: "face_images/" + userProfile.id + ".png",
              //     spotify_username: userProfile.id,
              //   })
            }
            console.log(images_uploaded)

            const {data: completeData, error: completeError} = await supabase.from("albums").upsert({
              images: images_uploaded,
              owner: userProfile.id,
            }, {}).select().single();

            if (completeError) {
              console.log(completeError);
              return;
            }
          }
        }}
      />
    </main>
  );
}