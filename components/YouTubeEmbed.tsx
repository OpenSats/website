import YouTube from 'react-youtube'

const YouTubeEmbed = ({ videoId }) => {
  const opts = {
    height: 'auto',
    width: '100%',
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 0,
    },
  }

  return (
    <div className="video-container">
      <YouTube videoId={videoId} opts={opts} />
    </div>
  )
}

export default YouTubeEmbed
