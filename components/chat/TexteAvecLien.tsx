import { isTag } from 'domhandler'
import { Node } from 'domhandler/lib/node'
import parse, {
  DOMNode,
  domToReact,
  HTMLReactParserOptions,
} from 'html-react-parser'
import React from 'react'
import sanitizeHtml from 'sanitize-html'

import { MessageRechercheMatch } from 'interfaces/message'

const cannotEndUrl = ['?', '!', '.', ',', ':', '*', '_', '~', "'", '"']

type TexteAvecLienProps = {
  texte: string
  lighten?: boolean
  highlight?: MessageRechercheMatch
}
export default function TexteAvecLien({
  texte,
  lighten,
  highlight,
}: TexteAvecLienProps) {
  const texteSurligne = highlight ? surlignerTexte(texte, highlight) : texte
  const texteAssaini = detecteBalise(texteSurligne)
    ? sanitizeHtml(texteSurligne, { disallowedTagsMode: 'recursiveEscape' })
    : texteSurligne

  if (!detecteLien(texteAssaini)) return parse(texteAssaini)
  return formateTexteAvecLien(texteAssaini, lighten)
}

function formateTexteAvecLien(texteAFormater: string, lighten?: boolean) {
  const messageFormate = texteAFormater.split(/(\r?\n|\s+)/).flatMap((mot) => {
    const { prefix, link, postfix } = extractLink(mot)

    if (link) {
      return [
        prefix,
        `<a id="lienExterne">` +
          `${link}` +
          `<svg aria-hidden={true} focusable={false} viewBox="0 0 12 12" className="inline ml-1 w-3 h-3" xmlns="http://www.w3.org/2000/svg">` +
          `<path d="M10 10.6667H2C1.63333 10.6667 1.33333 10.3667 1.33333 10V2C1.33333 1.63333 1.63333 1.33333 2 1.33333H5.33333C5.7 1.33333 6 1.03333 6 0.666667C6 0.3 5.7 0 5.33333 0H1.33333C0.593333 0 0 0.6 0 1.33333V10.6667C0 11.4 0.6 12 1.33333 12H10.6667C11.4 12 12 11.4 12 10.6667V6.66667C12 6.3 11.7 6 11.3333 6C10.9667 6 10.6667 6.3 10.6667 6.66667V10C10.6667 10.3667 10.3667 10.6667 10 10.6667ZM7.33333 0.666667C7.33333 1.03333 7.63333 1.33333 8 1.33333H9.72667L3.64 7.42C3.38 7.68 3.38 8.1 3.64 8.36C3.9 8.62 4.32 8.62 4.58 8.36L10.6667 2.27333V4C10.6667 4.36667 10.9667 4.66667 11.3333 4.66667C11.7 4.66667 12 4.36667 12 4V0H8C7.63333 0 7.33333 0.3 7.33333 0.666667Z" fill="currentColor"/>` +
          `</svg>` +
          `</a>`,
        postfix,
      ]
    } else {
      return mot
    }
  })

  const options: HTMLReactParserOptions = {
    replace: (domNode: Node) => {
      if (!isTag(domNode)) return

      const { attribs, children } = domNode
      if (attribs.id === 'lienExterne') {
        const lien = (children[0] as unknown as Text).data

        return (
          <a
            href={lien}
            target='_blank'
            rel='noreferrer noopener'
            aria-label={`${lien} (nouvelle fenêtre)`}
            className={`underline [word-break:_break-word] ${
              lighten
                ? 'text-white hover:text-primary-lighten'
                : 'text-content-color hover:text-primary'
            }`}
            onClick={(e) => confirmationRedirectionLienExterne(e, lien)}
          >
            {domToReact(children as DOMNode[], options)}
          </a>
        )
      }
    },
  }

  return parse(messageFormate.join(''), options)
}

function confirmationRedirectionLienExterne(
  e: React.MouseEvent<HTMLAnchorElement>,
  lien: string
) {
  e.preventDefault()
  if (window.confirm('Vous allez quitter l’espace conseiller')) {
    window.open(lien, '_blank', 'noopener, noreferrer')
  }
}

function detecteLien(str: string) {
  return str.search(/https?:\/\//i) !== -1
}

function detecteBalise(str: string) {
  return str.includes('<') || str.includes('>')
}

function surlignerTexte(
  texteASurligner: string,
  surlignage: MessageRechercheMatch
) {
  const coordDebut = surlignage.match[0]
  const coordFin = surlignage.match[1] + 1

  const debut = texteASurligner.slice(0, coordDebut)
  const highlightedText = texteASurligner.slice(coordDebut, coordFin)
  const fin = texteASurligner.slice(coordFin)

  return `${debut}<mark>${highlightedText}</mark>${fin}`
}

function extractLink(str: string): {
  link?: string
  prefix?: string
  postfix?: string
} {
  if (detecteLien(str)) {
    const indexOfProtocol = str.search(/https?:\/\//i)
    const prefix = str.slice(0, indexOfProtocol)
    let link = str.slice(indexOfProtocol)

    let postfix = ''
    while (link.length) {
      const lastChar = link.at(-1)!
      if (cannotEndUrl.includes(lastChar)) {
        postfix = lastChar + postfix
        link = link.slice(0, -1)
        continue
      }

      if (lastChar === ')') {
        if (countChar(link, /\)/) > countChar(link, /\(/)) {
          postfix = lastChar + postfix
          link = link.slice(0, -1)
          continue
        }
      }

      break
    }

    return { link, prefix, postfix }
  }

  return {}
}

function countChar(link: string, char: RegExp) {
  return (link.match(new RegExp(char, 'g')) || []).length
}
