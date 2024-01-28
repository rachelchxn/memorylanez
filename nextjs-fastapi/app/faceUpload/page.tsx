"use client";

import { supabase } from "@/db";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { Button } from "@nextui-org/react";
import Image from "next/image";
import orange from "../../public/circle.png";
import pink from "../../public/ROSE.png";

interface Track {
  id: string;
  name: string;
}

export default function Home() {
  const [userProfile, setUserProfile] = useState<any>(null);

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

  return (
    <main className="flex justify-center bg-bgbeige min-h-screen">
      <div className="relative max-w-lg flex-col ustify-center w-full h-screen bg-photoalbum px-10 py-64 overflow-hidden">
        <div className="flex justify-center z-10">
          <Button
            onClick={() => router.push("/camera")}
            className="w-64 h-64 bg-placeholder rounded-full mb-5"
          >
            <div className="flex justify-center p-28">
              <PhotoCameraIcon className="text-burnt" />
            </div>
          </Button>
        </div>
        <input
          id="upload"
          type="file"
          name="faceImage"
          className="relative z-10 bg-burnt text-white outline-none p-3 file:mr-5 w-full font-bold rounded-md"
          onChange={async (event) => {
            console.log("test");
            if (event.target.files && event.target.files[0] && userProfile) {
              const response = await supabase.storage
                .from("user_faces")
                .upload("files/" + userProfile.id, event.target.files[0], {
                  cacheControl: "3600",
                  upsert: false,
                });

              console.log(response);

              if (response.error) {
                console.log(response.error);
                return;
              }

              const { data } = supabase.storage
                .from("user_faces")
                .getPublicUrl(userProfile.id);
              console.log(data);
              await supabase.from("users").upsert({
                face_image_path: `user_faces/files/${userProfile.id}`,
                face_image: data.publicUrl.replace("user_faces/", "user_faces/files/"),
                spotify_username: userProfile.id,
              });
              router.push("/albumUpload");
            }
          }}
        />
        <p className="text-center text-burnt m-5 relative z-10">
          Please upload a photo of yourself.
        </p>
        <div className="-m-[24rem] -z-20">
          <Image width={2000} src={orange} alt="" />
        </div>
        <div className="-my-[72rem] ml-0 -mr-[30rem] -z-10">
          <Image width={1500} src={pink} alt="" />
        </div>
      </div>
    </main>
  );
}
