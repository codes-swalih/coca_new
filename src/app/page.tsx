"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Home = () => {
  const router = useRouter();
  const handleClick = () => {
    const adminId = localStorage.getItem("adminId");
    router.push(adminId ? "/dashboard" : "login");
  };

  useEffect(() => {
    handleClick();
  }, []);

  return <div></div>;
};

export default Home;
