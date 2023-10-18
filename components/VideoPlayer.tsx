/* eslint-disable jsx-a11y/media-has-caption */

const VideoPlayer = ({ src }) => {
  return (
    <video controls width="100%">
      <source src={src} />
    </video>
  )
}

export default VideoPlayer
