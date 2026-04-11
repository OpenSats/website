import Image from 'next/image'

const ZIP_ASSET = '/static/brand/opensats-brand-assets.zip'

const ASSETS = [
  {
    label: 'Wordmark',
    svg: '/static/brand/opensats-wordmark.svg',
    png: '/static/brand/opensats-wordmark.png',
    bg: 'bg-white',
  },
  {
    label: 'Icon',
    preview: '/static/brand/opensats-icon.png',
    svg: '/static/brand/opensats-icon.svg',
    png: '/static/brand/opensats-icon.png',
    bg: 'bg-white',
  },
  {
    label: 'Mark',
    svg: '/static/brand/opensats-favicon.svg',
    png: '/static/brand/opensats-favicon.png',
    bg: 'bg-white',
  },
]

const COLOR_GROUPS = [
  {
    label: 'Orange',
    colors: [
      { label: 'Primary', hex: '#ff6b01' },
      { label: 'Secondary', hex: '#ffb200' },
    ],
  },
  {
    label: 'Purple',
    colors: [
      { label: 'Primary', hex: '#a855f7' },
      { label: 'Secondary', hex: '#9333ea' },
    ],
  },
]

function DownloadLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      download
      className="text-sm font-medium text-orange-500 hover:text-orange-600"
    >
      {label}
    </a>
  )
}

type Asset = (typeof ASSETS)[number]

function AssetCard({ asset }: { asset: Asset }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <div className={`${asset.bg} flex items-center justify-center p-8`}>
        <Image
          src={asset.preview || asset.svg}
          alt={`OpenSats ${asset.label}`}
          width={200}
          height={96}
          className="max-h-24 w-auto"
          unoptimized
        />
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {asset.label}
        </span>
        <div className="flex gap-3">
          <DownloadLink href={asset.svg} label="SVG" />
          {asset.png && <DownloadLink href={asset.png} label="PNG" />}
        </div>
      </div>
    </div>
  )
}

function ColorSwatch({ label, hex }: { label: string; hex: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span
        className="h-4 w-4 rounded-sm border border-gray-200 dark:border-gray-700"
        style={{ backgroundColor: hex }}
      />
      <span className="text-gray-900 dark:text-gray-100">{label}</span>
      <span className="font-mono text-gray-600 dark:text-gray-400">{hex}</span>
    </div>
  )
}

export default function MediaKit() {
  return (
    <div className="space-y-4">
      <div className="text-sm sm:text-right">
        <a
          href={ZIP_ASSET}
          download
          className="font-medium text-orange-500 hover:text-orange-600"
        >
          Download all assets (.zip)
        </a>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {ASSETS.map((asset) => (
          <AssetCard key={asset.label} asset={asset} />
        ))}
      </div>
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Colors
        </h2>
        <div className="space-y-4">
          {COLOR_GROUPS.map((group) => (
            <div key={group.label} className="space-y-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {group.label}
              </h3>
              <div className="space-y-2">
                {group.colors.map((color) => (
                  <ColorSwatch
                    key={`${group.label}-${color.label}`}
                    label={`${group.label} ${color.label}`}
                    hex={color.hex}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
