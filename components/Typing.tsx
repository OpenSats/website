import React from 'react'
import Typed from 'typed.js'

export default function Typing() {
  const el = React.useRef(null)

  React.useEffect(() => {
    const typed = new Typed(el.current, {
      strings: [
        'Bitcoin',
        'Contributors',
        'FOSS',
        'Freedom Tools',
        'Freedom',
        'Developers',
        'Decentralization',
        'nostr',
        'Open-Source Projects',
        'OpenSats',
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
