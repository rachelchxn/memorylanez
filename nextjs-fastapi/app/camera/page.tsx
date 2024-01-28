"use client";
import { useEffect, useCallback, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import React from "react";

import orange from "../../public/circle.png";
import pink from "../../public/ROSE.png";
import Image from "next/image";

import { Button } from "@nextui-org/react";

import Webcam from "react-webcam";

export default function Camera() {
    const [userPhoto, setUserPhoto] = useState(null);
    const webcamRef = useRef(null)

    const videoConstraints = {
        width: { min: 480 },
        height: { min: 720 },
        aspectRatio: 0.6666666667,
        facingMode: "user"
    };

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setUserPhoto(imageSrc);
    }, [webcamRef]);

    return (
    <main className="flex justify-center bg-bgbeige min-h-screen">
        <div className="relative max-w-lg flex-col w-full h-screen bg-photoalbum px-10 py-[24rem] overflow-hidden">
          <div className="relative z-10">
            {(userPhoto == null) ?
            (<div className="flex justify-center">
                <div className="flex-col">
                    <Webcam 
                        videoConstraints={videoConstraints}
                    />
                    <Button 
                        className="bg-burnt rounded-md font-medium text-white tracking-widest"
                        onClick={capture}
                    >
                        TAKE PHOTO
                    </Button>
                </div>
            </div>) :
            (<div className="flex justify-center">
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
            </div>)
            }
          </div>
          <div className="-m-[32rem] -z-20">
              <Image width={2000} src={orange} alt=""/>
          </div>
          <div className="-my-[80rem] ml-0 -mr-[30rem] -z-10">
              <Image width={1500} src={pink} alt=""/>
          </div>
        </div>
      </main>
    );
}