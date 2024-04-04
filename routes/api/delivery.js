import express from 'express'

import * as auth from '../../auth.js'
import * as cosmos from '../../cosmos.js'
import { HttpStatusCode } from 'axios'

const router = express.Router()

router.get('/private/:courseCode', auth.authenticated, async function (req, res, next) {
  const courseCodeRaw = req.params.courseCode
  const courseCode = courseCodeRaw.toLowerCase()

  const username = auth.getUsername(req)

  const result = await cosmos.getPrivateLinks(username, courseCode)

  const links = {
    id: courseCode,
    username: username,
    links: result.links ?? []
  }

  res.json(links)
})

router.post('/private/:courseCode', auth.authenticated, async function (req, res, next) {
  const courseCodeRaw = req.params.courseCode
  const courseCode = courseCodeRaw.toLowerCase()

  const username = auth.getUsername(req)

  const links = []

  for (const link of req.body.links) {
    links.push({
      label: link.label,
      url: link.url,
    })
  }

  const privateLinks = {
    id: courseCode,
    username,
    links,
  }

  await cosmos.savePrivateLinks(privateLinks)

  res.status(HttpStatusCode.NoContent).send()
})

router.get(`/links`, auth.authenticated, async function (req, res, next) {
  const username = auth.getUsername(req)

  const result = await cosmos.getGlobalLinks(username) ?? {
    id: username,
    links: [],
  }

  res.json(result)
})

router.post(`/links`, auth.authenticated, async function (req, res, next) {
  const username = auth.getUsername(req)

  const links = []

  for (const link of req.body.links) {
    links.push({
      label: link.label,
      url: link.url,
    })
  }

  const globalLinks = {
    id: username,
    links,
  }

  await cosmos.saveGlobalLinks(globalLinks)

  res.status(HttpStatusCode.NoContent).send()
})

export default router