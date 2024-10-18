import React from 'react';
import ReactPlayer from 'react-player'; // Import ReactPlayer
import styles from './videoPreview.module.css';

const VideoPreview = ({ src }) => {
  // Check if the URL is a valid video type or platform
  const isPlayable = ReactPlayer.canPlay(src);

  if (!isPlayable) {
    // Render unsupported platform or invalid URL message
    return (
      <div className={styles.videoContainer}>
        <p>Unsupported video platform or invalid URL.</p>
      </div>
    );
  }

  // Render the ReactPlayer component for supported platforms and direct video files
  return (
    <div className={styles.videoContainer}>
      <ReactPlayer
        url={src}             // The video URL (Vimeo, YouTube, mp4, etc.)
        controls              // Show player controls (play, pause, etc.)
        width="100%"          // Adjust the width as per your design
        height="100%"         // Adjust the height as per your design
        className={styles.videoPreview} // Optional: Apply custom styles
      />
    </div>
  );
};

export default VideoPreview;
