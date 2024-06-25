import { useEffect } from 'react'

import { Conseiller, StructureConseiller } from 'interfaces/conseiller'

export function useLeanBeWidget(conseiller: Conseiller) {
  useEffect(() => {
    const script = document.createElement('script')
    script.append(
      'window.SGBFWidgetLoader = window.SGBFWidgetLoader || {ids:[],call:function(w,d,s,l,id) {\n' +
        "        w['sgbf']=w['sgbf']||function(){(w['sgbf'].q=w['sgbf'].q||[]).push(arguments[0]);};\n" +
        '        var sgbf1=d.createElement(s),sgbf0=d.getElementsByTagName(s)[0];\n' +
        '        if (SGBFWidgetLoader && SGBFWidgetLoader.ids && SGBFWidgetLoader.ids.length > 0) {SGBFWidgetLoader.ids.push(id);return;}\n' +
        '        SGBFWidgetLoader.ids.push(id);sgbf1.onload = function() {var app = new SGBFLoader();app.run();};\n' +
        '        sgbf1.async=true;sgbf1.src=l;sgbf0.parentNode.insertBefore(sgbf1,sgbf0);return{};\n' +
        `        }};SGBFWidgetLoader.call(window,document, "script", "https://leanbe.ai/assets/api/SGBFWidget.min.js", "${getWidgetId(
          conseiller.structure
        )}");`
    )
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  })
}

export function getWidgetId(structure: StructureConseiller): string {
  switch (structure) {
    case StructureConseiller.MILO:
      return process.env.NEXT_PUBLIC_LEANBE_MILO_WIDGET_ID ?? ''
    case StructureConseiller.POLE_EMPLOI:
      return process.env.NEXT_PUBLIC_LEANBE_PE_WIDGET_ID ?? ''
    case StructureConseiller.POLE_EMPLOI_BRSA:
    case StructureConseiller.POLE_EMPLOI_AIJ:
      return process.env.NEXT_PUBLIC_LEANBE_PASS_EMPLOI_WIDGET_ID ?? ''
  }
}
