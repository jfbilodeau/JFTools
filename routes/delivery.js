import express from 'express'
import * as auth from '../auth.js'
import * as cosmos from '../cosmos.js'
import * as QRCode from 'qrcode'
import * as openai from '@azure/openai'

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

  res.render('delivery/index', { title: `Delivery`, settings, surveyQrDataUrl })
})

router.get('/genquiz', auth.authenticated, async function (req, res, next) {
  const username = auth.getUsername(req)

  const settings = await cosmos.getSettings(username)

  // Make sure Azure OpenAI settings are set
  if(!settings.openAiUrl || !settings.openAiKey || !settings.openAiDeployment) {
    res.redirect('/delivery/settings')
    return
  }

  let description = req.query.description
  let script = ''

  if (!description) {
    description = `Generate a three question quiz on security for Azure DevOps pipeline. Use the title 'Day 2 - Review'`
  } else {
    const client = new openai.OpenAIClient(
      settings.openAiUrl,
      new openai.AzureKeyCredential(settings.openAiKey),
    )

    const systemMessage = `
      You are 'GenQuiz', an AI that generates quiz questions based on a given text.
      The quiz will be multiple choice, with 4 possible answers. If the number of questions to generate is not specified, generate 5 questions.
      The first line of the answer will be the raw title of the quiz, followed by a blank line.
        - Do not add a label such as 'title:' before the quiz title.
      
      For each question:
        - Provide the question on a single line, followed by the four possible answers. 
        - Start the question with the label 'Poll: '
        - Prefix the answers with a dash and a space ('- '). 
        - The last line of the question will start with a pound sign ('#') and include the right answer with a short, one sentence, explanation of the answer.
    `

    const conversation = [
      {
        role: 'system',
        content: systemMessage,
      },
      {
        role: 'user',
        content: description,
      },
    ]

    const options = {
      max_tokens: 1500,
      n: 1,

      temperature: 1.0,
      top_p: 1.0,
    }

    try {
      const response = await client.getChatCompletions(
        settings.openAiDeployment,
        conversation,
        options,
      )

      script = response.choices[0].message.content
    } catch (e) {
      console.error(e)
      script = `Error generating quiz. Reason: ${e.message}`
    }
  }

  res.render('delivery/genquiz', { title: 'Generate Quiz', script, description })
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
