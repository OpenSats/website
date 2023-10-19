/* eslint-disable jsx-a11y/iframe-has-title */
/* eslint-disable jsx-a11y/anchor-has-content */

const YouTube = ({ ytid, ...rest }) => {
  return (
    <div className="aspect-h-9 aspect-w-16">
      <iframe
        src="https://www.youtube.com/embed/${ytid}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  )
}

export default YouTube
