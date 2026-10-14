import { useEffect, useState } from 'react'

export type DeviceKind = 'mobile' | 'desktop'
export type AspectKind = 'portrait' | 'landscape'

export type ViewportLayout = {
  device: DeviceKind
  aspect: AspectKind
  /** width / height */
  ratio: number
}

function readLayout(): ViewportLayout {
  const width = window.innerWidth
  const height = Math.max(window.innerHeight, 1)
  const ratio = width / height

  // Web layout follows viewport width (not UA). Narrow = mobile chrome;
  // wide = desktop reading layout. Aspect ratio then shapes the hero.
  const device: DeviceKind = width >= 900 ? 'desktop' : 'mobile'
  const aspect: AspectKind = ratio >= 1 ? 'landscape' : 'portrait'

  return { device, aspect, ratio }
}

function applyLayout(layout: ViewportLayout) {
  const root = document.documentElement
  root.dataset.device = layout.device
  root.dataset.aspect = layout.aspect
  root.style.setProperty('--viewport-ratio', layout.ratio.toFixed(3))
}

/** Identifies mobile/desktop and portrait/landscape from the live viewport. */
export function useViewportLayout(): ViewportLayout {
  const [layout, setLayout] = useState<ViewportLayout>(() => {
    if (typeof window === 'undefined') {
      return { device: 'mobile', aspect: 'portrait', ratio: 0.56 }
    }
    return readLayout()
  })

  useEffect(() => {
    const update = () => {
      const next = readLayout()
      applyLayout(next)
      setLayout((prev) =>
        prev.device === next.device && prev.aspect === next.aspect && prev.ratio === next.ratio
          ? prev
          : next,
      )
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)

    const wide = window.matchMedia('(min-width: 900px)')
    const orientation = window.matchMedia('(orientation: portrait)')

    wide.addEventListener('change', update)
    orientation.addEventListener('change', update)

    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
      wide.removeEventListener('change', update)
      orientation.removeEventListener('change', update)
    }
  }, [])

  return layout
}
