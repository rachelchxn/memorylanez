"use client";

import { useEffect, useState } from "react";

interface Track {
  id: string;
  name: string;
}

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([]);

  // useEffect(() => {
  //   if (localStorage.getItem("providerAccessToken")) {
  //     const queryParams = new URLSearchParams({
  //       limit: "3",
  //       min_energy: "0.5",
  //       max_energy: "0.8",
  //       valence: "0.7",
  //       genre: "pop",
  //       track: "2tHiZQ0McWbtuWaax3dh4P",
  //     });
  //     fetch(`/api/recommendations?${queryParams}`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         token: localStorage.getItem("providerAccessToken"),
  //       }),
  //     })
  //       .then((res) => res.json())
  //       .then((data) => {
  //         console.log(data);
  //         setTracks(data.tracks);
  //       });
  //   }
  // }, [localStorage.getItem("providerAccessToken")]);

  return (
    <main className="w-[430px] h-[932px] flex justify-center items-center bg-slate-100">
      <h1>Home</h1>
      {/* {tracks.map((track) => (
        <iframe
          key={track.id}
          src={`https://open.spotify.com/embed/track/${track.id}`}
          width="300"
          height="80"
          frameBorder="0"
          allow="encrypted-media"
        ></iframe>
      ))} */}
    </main>
  );
}
