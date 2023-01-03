import express from 'express'
import * as scrapper from '../scrapper.js'
import * as klaxgen from '../klaxgen.js'

const router = express.Router()

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.render('kc/index')
})

router.get(`/units`, async (req, res, next) => {
  const courseId = req.query.courseId?.toLowerCase()
  const locale = req.query.locale?.toLowerCase() ?? `en-us`
  const format = req.query.format?.toLowerCase() ?? (req.query.raw ? 'json' : null)

  const studyGuide = await scrapper.getStudyGuide(courseId, locale)

  if (studyGuide.error) {
    res.render(`kc/index`, { message: `Course ID '${courseId}' with locale '${locale}' not found`})

    return
  }

  studyGuide.format = format

  res.render('kc/units', studyGuide)
})

router.get(`/generate`, async (req, res, next) => {
  const courseId = req.query.courseId?.toLowerCase()
  const locale = req.query.locale?.toLowerCase() ?? `en-us`
  const format = req.query.format?.toLowerCase() ?? (req.query.raw ? 'json' : null)

  if (courseId) {
    const studyGuide = await scrapper.getStudyGuide(courseId, locale)

    if (studyGuide.error) {
      res.render(`kc/index`, { message: `Course ID '${courseId}' with locale '${locale}' not found`})

      return
    }

    // Remove de-selected units.
    studyGuide.paths.forEach(p => {
      p.modules.forEach(m => {
        m.units = m.units.filter(u => u.id in req.query)
      })

      p.modules = p.modules.filter(m => m.units.length)
    })

    studyGuide.paths =
      studyGuide.paths.filter(p => p.modules.length)

    switch (format) {
      case 'json':
        res.json(studyGuide)
        break

      case 'html':
        res.render(`kc/generate`, studyGuide)
        break

      case 'klax':
        const script = klaxgen.generateKlaxGenScript(studyGuide)
        res.render(`kc/klax`, { script })
        break

      default:
        res.status(400).send(`format must be 'json', 'klax' or 'html'`)
    }
  } else {
    res.redirect(`index`)
  }
})

export default router
