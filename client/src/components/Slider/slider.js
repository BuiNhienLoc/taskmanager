import { useState, useEffect, useRef } from "react";
import { sliderData } from "./slider-data";
import "./slider.css";

const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideLength = sliderData.length;

  const slideInterval = useRef(null);
  const intervalTime = 10000;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slideLength - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    slideInterval.current = setInterval(nextSlide, intervalTime);
    return () => clearInterval(slideInterval.current);
  }, [currentSlide]);

  return (
    <div className="slider">
      {sliderData.map((slide, index) => (
        <div
          className={index === currentSlide ? "slide current" : "slide"}
          key={index}
        >
          {index === currentSlide && (
            <div>
              <img src={slide.image} alt="slide" className="image" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Slider;