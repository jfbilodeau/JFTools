import express, { urlencoded } from 'express'
import * as msal from '@azure/msal-node'
import * as auth from '../auth.js'

const cryptoProvider = new msal.CryptoProvider()

const router = express.Router()

const scopes = [
  `user.read`,
]

const clientConfig = {
  auth: {
    clientId: process.env.JFTOOLS_AUTH_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.JFTOOLS_AUTH_TENANT_ID}/`,
    clientSecret: process.env.JFTOOLS_AUTH_CLIENT_SECRET,
  }
}

const confidentialClientApplication = new msal.ConfidentialClientApplication(clientConfig)

router.get('/login', async (req, res, next) => {
  req.session.authState = cryptoProvider.createNewGuid()

  const authorizationUrlRequest = {
    scopes,
    redirectUri: process.env.JFTOOLS_AUTH_REDIRECT_URI,
    prompt: `select_account`,
    state: req.query.returnTo,
  }

  let authCodeUrl = await confidentialClientApplication.getAuthCodeUrl(authorizationUrlRequest)

  res.redirect(authCodeUrl)
})

router.get('/code', async (req, res, next) => {
  try {
    const returnTo = req.query.state ?? `/`

    if (req.query.error) {
      return res.redirect(returnTo)
    }

    const code = req.query.code

    const tokenRequest = {
      code,
      scopes,
      redirectUri: process.env.JFTOOLS_AUTH_REDIRECT_URI,
      state: returnTo,
    }

    const result = await confidentialClientApplication.acquireTokenByCode(tokenRequest)
    const account = result.account

    auth.setLoggedIn(req, account)

    res.redirect(returnTo)
  } catch(e) {
    console.log(e)

    res.redirect('/')
  }
})

router.get('/logout', (req, res, next) => {
  auth.logout(req)

  const returnTo = decodeURI(req.query.returnTo) ?? `/`

  res.redirect(returnTo)
})

export default router