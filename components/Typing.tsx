import React from 'react'
import Typed from 'typed.js'

export default function Typing() {
  const el = React.useRef(null)

  React.useEffect(() => {
    const typed = new Typed(el.current, {
      strings: [
        'Monero Fund',
        'Open Source Software',
        'The Monero Project',
      ],
      typeSpeed: 50,
      loop: true,
      cursorChar: '_',
    })

    return () => {
      typed.destroy()
    }
  }, [])

  return (
    <>
      <span ref={el} />
    </>
  )
}
