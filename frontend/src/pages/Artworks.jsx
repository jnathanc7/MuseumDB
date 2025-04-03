import React, {useEffect, useRef} from "react";
import { Swiper, SwiperSlide} from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "../styles/artworks.css";

const slidesData = [
    {   imgSrc: "/Blue_Vessel.jpeg",
        title: "Title",
        description: "description"
    },
    {   imgSrc: "/Blue_Vessel.jpeg",
        title: "Title",
        description: "description"
    },
    {   imgSrc: "/Blue_Vessel.jpeg",
        title: "Title",
        description: "description"
    },
    {   imgSrc: "/Blue_Vessel.jpeg",
        title: "Title",
        description: "description"
    },
    {   imgSrc: "/Blue_Vessel.jpeg",
        title: "Title",
        description: "description"
    },
]

const Artworks = () =>{
    // const swiperWrappedRef = useRef(null);

    // function adjustMargin(){
    //     const screenWidth = window.innerWidth;
    //     if(swiperWrappedRef.current){
    //         swiperWrappedRef.current.style.marginLeft 
    //         = screenWidth <= 520 
    //         ? "0px" 
    //         : screenWidth <= 650 
    //         ? "50px" 
    //         : screenWidth <= 800 
    //         ? "-100px" 
    //         :"-150px";
    //     }
    // }

    // useEffect(() =>{
    //     adjustMargin();
    //     window.addEventListener("resize", adjustMargin);
    //     return () => window.removeEventListener("resize", adjustMargin);
    // })
   return(
    <main className = "main">
        <div className = "container">
            <Swiper modules = {[Pagination]}
            grabCursor ={true}
            initialSlide = {2}
            centeredSlides = {true}
            slideToClickedSlide={true}
            slidesPerView = "auto"
            speed={800}
            pagination = {{clickable:true}}
            breakpoints = {{
                320: {spaceBetween: 40},
                650: {spaceBetween: 30},
                1000: {spaceBetween: 20},
            }}
            /* onSwiper = {(swiper) =>{
            //     swiperWrappedRef.current = swiper.wrapppedEl
            // }}*/>
                {slidesData.map((slidesData, index) =>( 
                    <SwiperSlide key = {index}>
                        <img className = "img" src={slidesData.imgSrc} alt={slidesData.title} />
                        <div className = "title">
                            <h1>{slidesData.title}</h1>
                        </div>
                        <div className = "content">
                            <div className = "text-box"><p>{slidesData.description}</p></div>
                        </div>
                    </SwiperSlide> 
                ))}
            
            </Swiper>
        </div>
    </main>
    )
 
}

export default Artworks;