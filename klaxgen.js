export function generateKlaxGenScript (studyGuide) {
  var script = `# Script for KlaxGen extension\n# https://github.com/jfbilodeau/KlaxGen#readme\n${studyGuide.title}\n\n`

  studyGuide.paths.forEach(p => {
    p.modules.forEach(m => {
      m.units.forEach(u => {
        u.questions.forEach(q => {
          script += `${q.question}\n`
          script += q.options.map(o => `- ${o}\n`).reduce((a, c) => `${c}${a}`, ``)
          script += `\n`
        })
      })
    })
  })

  return script
}