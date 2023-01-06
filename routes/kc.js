import express from 'express'
import * as scrapper from '../scrapper.js'
import options from '../options.js'
import * as poll from '../poll.js'

const router = express.Router()

/* GET users listing. */
router.get(`/`, (req, res, next) => {
  res.render(`kc/index`, {  title: `Generate Knowledge Check` })
})

router.get(`/units`, async (req, res, next) => {
  const courseId = req.query.courseId?.toLowerCase()
  const locale = req.query.locale?.toLowerCase() ?? `en-us`
  const format = req.query.format?.toLowerCase() ?? (req.query.raw ? 'json' : null)


  const studyGuide = await scrapper.getStudyGuide(courseId, locale)

  if (studyGuide.error) {
    res.render(`kc/index`, { title: `Knowledge Check Generator`, message: `Course ID '${courseId}' with locale '${locale}' not found`})

    return
  }

  studyGuide.format = format

  res.render('kc/units', { title: `Select units`, studyGuide })
})

router.get(`/generate`, async (req, res, next) => {
  const courseId = req.query.courseId?.toLowerCase()
  const locale = req.query.locale?.toLowerCase() ?? `en-us`
  const format = req.query.format?.toLowerCase() ?? (req.query.raw ? 'json' : null)

  if (courseId) {
    const studyGuide = await scrapper.getStudyGuide(courseId, locale)

    if (studyGuide.error) {
      res.status(404)
      res.render(`kc/index`, options(`Error`, { message: `Course ID '${courseId}' with locale '${locale}' not found`}))

      return
    }

    if (!req.query.all) {
      // Remove de-selected units.
      studyGuide.paths.forEach(p => {
        p.modules.forEach(m => {
          m.units = m.units.filter(u => u.id in req.query)
        })

        p.modules = p.modules.filter(m => m.units.length)
      })
    }

    studyGuide.paths = studyGuide.paths.filter(p => p.modules.length)

    switch (format) {
      case 'json':
        res.json(studyGuide)
        break

      case 'html':
        res.render(`kc/html`, options(studyGuide.title, { studyGuide }))
        break

      case 'outline':
        res.render(`kc/outline`, studyGuide)
        break;

      case 'poll':
        const script = poll.generatePollScript(studyGuide)
        res.render(`kc/poll`, { title: studyGuide.title, script })
        break

      default:
        res.status(400).send(`format must be 'html, 'outline', 'json' or 'poll'`)
    }
  } else {
    res.redirect(`/kc`)
  }
})

export default router
