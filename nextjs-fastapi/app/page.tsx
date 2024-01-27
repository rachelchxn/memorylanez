'use client'
import { useEffect } from "react";

//mobile screen size: 430 x 932

export default function Home() {
  useEffect(() => {
    fetch('/api/python').then((res) => {
      res.json().then((data) => {
        console.log(data)
      })
    })
  }, [])
  return (
    <main className="w-[430px] h-[932px] flex justify-center items-center bg-slate-100">
    </main>
  );
}
