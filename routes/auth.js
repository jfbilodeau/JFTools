import express, { urlencoded } from 'express'
import options from '../options.js'
import * as msal from '@azure/msal-node'
import * as auth from '../auth.js'

const cryptoProvider = new msal.CryptoProvider()

const router = express.Router()

router.get('/login', async (req, res, next) => {
  const publicClientApplication = new msal.PublicClientApplication({ auth: { clientId: process.env.JFTOOLS_AUTH_CLIENT_ID } })

  req.session.authState = cryptoProvider.createNewGuid()

  const authorizationUrlRequest = {
    scopes: [],
    redirectUri: process.env.JFTOOLS_AUTH_REDIRECT_URI,
    state: req.query.returnUrl,
  }

  let authCodeUrl = await publicClientApplication.getAuthCodeUrl(authorizationUrlRequest)

  res.redirect(authCodeUrl)
})

router.get('/redirect', async (req, res, next) => {
  const code = req.query.code
  const returnUrl = decodeURI(req.query.state)

  const ccaConfiguration = {
    auth: {
      clientId: process.env.JFTOOLS_AUTH_CLIENT_ID,
      clientSecret: process.env.JFTOOLS_AUTH_CLIENT_SECRET,
    }
  }

  const cca = new msal.ConfidentialClientApplication(ccaConfiguration)

  const request = {
    redirectUri: process.env.JFTOOLS_AUTH_REDIRECT_URI,
    code
  }

  const result = await cca.acquireTokenByCode(request)

  console.log(result)

  auth.setLoggedIn(req, result.account.username, result.token)

  res.redirect(returnUrl)
})

router.get('/logout', (req, res, next) => {
  auth.logout(req)

  const returnUrl = decodeURI(req.query.returnUrl) ?? `/`

  res.redirect(returnUrl)
})

export default router