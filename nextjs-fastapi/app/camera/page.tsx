"use client";
import { useEffect, useCallback, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import React from "react";

import orange from "../../public/circle.png";
import pink from "../../public/ROSE.png";
import Image from "next/image";

import { Button } from "@nextui-org/react";

import Webcam from "react-webcam";
import { supabase } from "@/db";

export default function Camera() {
  const [userPhoto, setUserPhoto] = useState(null);
  const webcamRef = useRef<any>(null);
  const [userProfile, setUserProfile] = useState(null); // You need to set this state with the user's profile
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

  const videoConstraints = {
    width: { min: 480 },
    height: { min: 720 },
    aspectRatio: 0.6666666667,
    facingMode: "user",
  };

  const capture = useCallback(() => {
    console.log(webcamRef.current, userProfile);
    if (webcamRef.current && userProfile) {
      const imageSrc = webcamRef.current.getScreenshot();
      setUserPhoto(imageSrc);
      fetch(imageSrc)
        .then((res) => res.blob())
        .then((blob) => {
          // Create a file from the blob
          const file = new File([blob], `file.jpg`, { type: "image/jpeg" });
          uploadImage(userProfile, file); // Call uploadImage function here
        });
    }
  }, [userProfile]);

  interface UserProfile {
    id: string;
    // other user profile fields
  }

  const uploadImage = async (userProfile: { id: any }, file: any) => {
    console.log("TRYING TO SEND TO DB");
    const uploadResponse = await supabase.storage
      .from("user_faces")
      .upload(`files/${userProfile.id}`, file, {
        cacheControl: "3600",
        upsert: false,
      });

    // Check for an error in the upload response
    if (uploadResponse.error) {
      console.error("Error uploading image:", uploadResponse.error);
      return;
    }

    // Retrieve the public URL of the uploaded image
    const { data } = supabase.storage
      .from("user_faces")
      .getPublicUrl(`files/${userProfile.id}`);

    // Update the user's profile with the new image data
    const upsertResponse = await supabase.from("users").upsert({
      spotify_username: userProfile.id, // Assuming 'id' is the primary key of the 'users' table
      face_image_path: `user_faces/files/${userProfile.id}`,
      face_image: data.publicUrl,
    });

    // Check for an error in the upsert response
    if (upsertResponse.error) {
      console.error("Error updating user profile:", upsertResponse.error);
      return;
    }

    router.push("/albumUpload");
  };

  return (
    <main className="flex justify-center bg-bgbeige min-h-screen">
      <div className="relative max-w-lg flex-col w-full h-screen bg-photoalbum px-10 py-[24rem] overflow-hidden">
        <div className="relative z-10">
          {userPhoto == null ? (
            <div className="flex justify-center">
              <div className="flex-col">
                <Webcam
                  ref={webcamRef}
                  videoConstraints={videoConstraints}
                  screenshotFormat="image/jpeg"
                />
                <Button
                  className="bg-burnt rounded-md font-medium text-white tracking-widest"
                  onClick={capture}
                >
                  TAKE PHOTO
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="flex-col">
                <img src={userPhoto} alt="screenshot" />
                <div className="flex">
                  <Button
                    className="bg-burnt rounded-md font-medium text-white tracking-widest"
                    onClick={() => setUserPhoto(null)}
                  >
                    RETAKE PHOTO
                  </Button>
                </div>
              </div>
            </div>
          )}
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
