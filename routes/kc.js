import express from 'express'
import * as scrapper from '../scrapper.js'

const router = express.Router()

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.render('kc/index')
})

router.get(`/document`, async (req, res, next) => {
  const courseId = req.query.courseId?.toLowerCase()
  const locale = req.query.locale?.toLowerCase() ?? `en-us`
  const format = req.query.format?.toLowerCase() ?? (req.query.raw ? 'json' : null)

  if (courseId) {
    const studyGuide = await scrapper.getStudyGuide(courseId, locale)

    if (studyGuide.error) {
      res.render(`kc/index`, { message: `Course ID '${courseId}' not found`})

      return
    }
    switch (format) {
      case 'json':
        res.json(studyGuide)
        break
      case 'html':
        res.render(`kc/document`, studyGuide)
        break
      default:
        res.status(400).send(`format must be 'json' or 'html'`)
    }
  } else {
    res.redirect(`index`)
  }
})

export default router
