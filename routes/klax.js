import express from 'express'
import * as scrapper from '../scrapper.js'
import * as klaxoon from '../klaxoon.js'

const router = express.Router()

/* GET users listing. */
router.get('/', (req, res, next) => {
  const courseId = req.body.courseId?.toLowerCase()
  const locale = req.body.locale?.toLowerCase() ?? `en-us`
  const klaxoon = req.body.klaxoon

  res.render('klax/index')
})

router.post(`/`, async (req, res, next) => {
  const title = req.body.title
  const cookie = req.body.cookie
  const courseId = req.body.courseId?.toLowerCase()
  const locale = req.body.locale?.toLowerCase() ?? `en-us`

  const studyGuide = await scrapper.getStudyGuide(courseId, locale)
  if (!cookie) {
    res.render('klax/modules', studyGuide)
  } else {
    const session = await klaxoon.startSession({
      studyGuide,
      cookie,
      title,
      units: []
    })

    res.redirect(session.uri)
  }
})

export default router
