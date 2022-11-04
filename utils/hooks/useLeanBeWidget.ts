import { useEffect } from 'react'

import { StructureConseiller } from 'interfaces/conseiller'

export namespace LeanBe {
  export const MILO_WIDGET_ID = '6311adec35e9790013bdfdf6'
  export const PE_WIDGET_ID = '6311e7ab83faaf001224e4e8'
}

export function useLeanBeWidget(structure: StructureConseiller | undefined) {
  useEffect(() => {
    const widgetId =
      structure === StructureConseiller.POLE_EMPLOI
        ? LeanBe.PE_WIDGET_ID
        : LeanBe.MILO_WIDGET_ID
    const script = document.createElement('script')
    script.append(
      'window.SGBFWidgetLoader = window.SGBFWidgetLoader || {ids:[],call:function(w,d,s,l,id) {\n' +
        "        w['sgbf']=w['sgbf']||function(){(w['sgbf'].q=w['sgbf'].q||[]).push(arguments[0]);};\n" +
        '        var sgbf1=d.createElement(s),sgbf0=d.getElementsByTagName(s)[0];\n' +
        '        if (SGBFWidgetLoader && SGBFWidgetLoader.ids && SGBFWidgetLoader.ids.length > 0) {SGBFWidgetLoader.ids.push(id);return;}\n' +
        '        SGBFWidgetLoader.ids.push(id);sgbf1.onload = function() {var app = new SGBFLoader();app.run();};\n' +
        '        sgbf1.async=true;sgbf1.src=l;sgbf0.parentNode.insertBefore(sgbf1,sgbf0);return{};\n' +
        `        }};SGBFWidgetLoader.call(window,document, "script", "https://leanbe.ai/assets/api/SGBFWidget.min.js", "${widgetId}");`
    )
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  })
}
