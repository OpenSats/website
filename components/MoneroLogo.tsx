import { SVGProps } from 'react'

function MoneroLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="85.086304mm"
      height="85.084808mm"
      viewBox="0 0 85.086304 85.084808"
      id="svg1"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs id="defs1">
        <clipPath clipPathUnits="userSpaceOnUse" id="clipPath2">
          <path
            d="M 0,841.889 H 595.275 V 0 H 0 Z"
            transform="translate(-193.3003,-554.52051)"
            id="path2"
          />
        </clipPath>
        <clipPath clipPathUnits="userSpaceOnUse" id="clipPath4">
          <path
            d="M 0,841.889 H 595.275 V 0 H 0 Z"
            transform="translate(-187.7847,-507.50881)"
            id="path4"
          />
        </clipPath>
      </defs>
      <g id="layer1">
        <path
          id="path1"
          d="m 0,0 c -20.377,0 -36.903,-16.524 -36.903,-36.902 0,-4.074 0.66,-7.992 1.88,-11.657 h 11.036 V -17.51 L 0,-41.497 23.987,-17.51 v -31.049 h 11.037 c 1.22,3.665 1.88,7.583 1.88,11.657 C 36.904,-16.524 20.378,0 0,0"
          style={{
            fill: '#ff6600',
            fillOpacity: 1,
            fillRule: 'nonzero',
            stroke: 'none',
          }}
          transform="matrix(1.1528216,0,0,-1.1528216,42.542576,0)"
          clipPath="url(#clipPath2)"
        />
        <path
          id="path3"
          d="M 0,0 -10.468,10.469 V -9.068 h -4.002 -4.002 -7.546 c 6.478,-10.628 18.178,-17.726 31.533,-17.726 13.355,0 25.056,7.098 31.533,17.726 H 29.501 22.344 21.499 V 10.469 L 11.03,0 5.515,-5.515 Z"
          style={{
            fill: '#4c4c4c',
            fillOpacity: 1,
            fillRule: 'nonzero',
            stroke: 'none',
          }}
          transform="matrix(1.1528216,0,0,-1.1528216,36.184075,54.196107)"
          clipPath="url(#clipPath4)"
        />
      </g>
    </svg>
  )
}
export default MoneroLogo
