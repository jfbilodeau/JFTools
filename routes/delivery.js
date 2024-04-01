import express from 'express'
import * as auth from '../auth.js'
import * as cosmos from '../cosmos.js'
import * as QRCode from 'qrcode'
// import * as openai from ''

const router = express.Router();

/* GET home page. */
router.get('/', auth.authenticated, async function (req, res, next) {
  const username = auth.getUsername(req)

  const settings = await cosmos.getSettings(username)

  if (!settings.courseCode) {
    // No course code. Redirect to settings
    res.redirect('/delivery/settings')
    return
  }

  const surveyQrDataUrl = await QRCode.toDataURL(settings.surveyUrl)

  res.render('delivery/index', { title: `Links`, settings, surveyQrDataUrl })
})

router.get('/genquiz', auth.authenticated, async function (req, res, next) {
  const username = auth.getUsername(req)

  const settings = await cosmos.getSettings(username)

  // Make sure Azure OpenAI settings are set
  if(!settings.openAiUrl || !settings.openAiKey || !settings.openAiDeployment) {
    res.redirect('/delivery/settings')
    return
  }

  const description = req.query.description
  var script = ''

  if (description) {

  }

  res.render('delivery/genquiz', { title: 'Generate Quiz', script })
})

router.get('/settings', auth.authenticated, async function (req, res, next) {
  const username = auth.getUsername(req)

  const settings = await cosmos.getSettings(username) ?? {}
  const courses = await cosmos.getPrivateLinkLists(username) ?? []

  res.render('delivery/settings', { title: `Link settings`, settings, courses })
})

router.post('/settings', auth.authenticated, async function (req, res, next) {
  const username = auth.getUsername(req)

  const settings = {
    id: username,
    courseCode: req.body.courseCode,
    language: req.body.language,
    deliveryId: req.body.deliveryId,
    surveyUrl: req.body.surveyUrl,
    labKey: req.body.labKey,
    isCloudSlice: req.body.isCloudSlice === 'on',
    openAiUrl: req.body.openAiUrl,
    openAiKey: req.body.openAiKey,
    openAiDeployment: req.body.openAiDeployment,
  }

  await cosmos.saveSettings(settings)

  res.redirect('/delivery')
})

export default router
