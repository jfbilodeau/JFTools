import express from 'express'
import * as scrapper from '../scrapper.js'

const router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
    res.render('kc/index')
})

router.get(`/document`, async (req, res, next) => {
    const courseId = req.query.courseId?.toLowerCase()
    const locale = req.query.locale?.toLowerCase() ?? `en-us`
    const raw = req.query.raw

    if (courseId) {
        const studyGuide = await scrapper.getStudyGuide(courseId, locale)

        if (raw) {
            res.json(studyGuide)
        } else {
            res.render(`kc/document`, studyGuide)
        }
    } else {
        res.redirect(`index`)
    }
})

export default router;
