import type { SinapsiElement } from '@domain/kernel/element.types'
import type { SinapsiMove, SinapsiPaletteOverrides } from '@domain/kernel/properties.types'
import type { DetailedHTMLProps, HTMLAttributes } from 'react'

export interface SinapsiReactAttributes {
  activation?: number | string
  'color-muted'?: string
  'color-primary'?: string
  'color-text'?: string
  move?: SinapsiMove
  nodes?: number | string
  palette?: SinapsiPaletteOverrides
  speed?: number | string
}

type SinapsiReactHostProps = DetailedHTMLProps<HTMLAttributes<SinapsiElement>, SinapsiElement>

export type SinapsiReactIntrinsicProps = SinapsiReactHostProps & SinapsiReactAttributes

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'sinap-si': SinapsiReactIntrinsicProps
    }
  }
}
