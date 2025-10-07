"use client";
import {useRouter} from "next/navigation";
import { useEffect } from "react";

const Home = () => {
    const router = useRouter();
    const handleClick = () => {
        router.push("/dashboard");
    }

    useEffect(()=>{
        handleClick();
    },[])

    return (
        <div>
            
        </div>
    );
}

export default Home;