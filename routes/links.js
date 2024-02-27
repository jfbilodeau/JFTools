import express from 'express'
import * as auth from '../auth.js'
import * as cosmos from '../cosmos.js'
import * as QRCode from 'qrcode'

const router = express.Router();

/* GET home page. */
router.get('/', auth.authenticated, async function (req, res, next) {
  const username = auth.getUsername(req)

  const settings = await cosmos.getSettings(username)

  const surveyQrDataUrl = await QRCode.toDataURL(settings.surveyUrl)

  res.render('links/index', { title: `Links`, settings, surveyQrDataUrl })
})

router.get('/settings', auth.authenticated, async function (req, res, next) {
  const username = auth.getUsername(req)

  const settings = await cosmos.getSettings(username) ?? {}

  res.render('links/settings', { title: `Link settings`, settings })
})

router.post('/settings', auth.authenticated, async function (req, res, next) {
  const username = auth.getUsername(req)

  const settings = {
    id: username,
    courseCode: req.body.courseCode,
    deliveryId: req.body.deliveryId,
    surveyUrl: req.body.surveyUrl,
    labKey: req.body.labKey,
    isCloudSlice: req.body.isCloudSlice === 'on',
  }

  await cosmos.saveSettings(settings)

  res.redirect(req.originalUrl)
})

export default router
