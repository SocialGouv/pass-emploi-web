declare module '*.svg' {
  const component: React.FC<React.SVGProps<SVGSVGElement>>

  export default component
}

// / <reference types="next" />
// / <reference types="next/types/global" />

interface Window {
  _paq?: null | (string | string[] | number | number[])[][]
}
declare namespace NodeJS {
  interface Global {
    _paq?: null | (string | string[] | number | number[])[][]
  }
}

declare module 'next-auth/providers/keycloak'
