/* eslint-disable jsx-a11y/media-has-caption */

const VideoPlayer = ({ src, width, height, controls }) => {
  return (
    <video
      src={`https://video.nostr.build/d65541cfd81143f02c28f78978f73c134970817fa30eeba0f532e5a1cbfb25cb.mov`}
      width={width}
      height={height}
      controls={controls}
      preload="metadata"
    />
  )
}

export default VideoPlayer
