



import React, { useState } from 'react';
import styles from './layerDisplay.module.css';
import ProfileImage from '../ProfileImage';
import { Carousel } from 'react-responsive-carousel';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';


const LayerDisplay = ({ layers }) => {

    const [currentSlide, setCurrentSlide] = useState(0);

    const images = [
        "https://miro.medium.com/v2/resize:fit:1400/1*zgLVTzkRsG6JqPpAghTqtQ.jpeg",
        "https://d3i71xaburhd42.cloudfront.net/a607e0c6a0d5d1321eca383939dbcb2b638613a2/3-Figure1-1.png",
        "https://pub.mdpi-res.com/electronics/electronics-11-00748/article_deploy/html/images/electronics-11-00748-g001.png?1646126366",
    
      ];
    
      const ImageCarousel = ({ images }) => {
        return (
          <Carousel showThumbs={false} 
          autoPlay 
          infiniteLoop 
          showStatus={false} 
          interval={3000} 
          transitionTime={500} 
          selectedItem={currentSlide} 
          onChange={(index) => setCurrentSlide(index)}>

            {images.map((url, index) => (
              <div key={index}>
                <img src={url} alt={`carousel-${index}`} />
              </div>
            ))}
          </Carousel>
        );
      };

      
      return (
        <div className={styles.container}>
          {layers.map((layer, layerIndex) => (
            <div key={layerIndex} className={styles.layer}>
              {layer.map((column, columnIndex) => (
                <div key={columnIndex} className={styles.column}>
                  {column.type === 'text' && (
                    <div className={styles.text}>{column.value}</div>
                  )}
                  {column.type === 'image' && (
                    <img src={column.value} alt={`Image ${layerIndex}-${columnIndex}`} className={styles.image} />
                  )}
                  {column.type === 'video' && (
                    <video controls className={styles.video}>
                      <source src={column.value} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    };
    
    export default LayerDisplay;