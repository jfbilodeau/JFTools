import express from 'express'

import * as auth from '../../auth.js'
import * as cosmos from '../../cosmos.js'

const router = express.Router()

router.get('/private', auth.authenticated, async function (req, res, next) {
  const username = auth.getUsername(req)

  const result = await cosmos.getPrivateLinks(username)

  const links = {
    id: username,
    links: result.links ?? []
  }

  res.json(links)
})

router.post('/private', auth.authenticated, async function (req, res, next) {
  const username = auth.getUsername(req)

  const links = await cosmos.getPrivateLinks(username)

  const newLinks = req.body.links

  links.links = newLinks

  await cosmos.savePrivateLinks(links)

  res.status(200).send()
})


export default router