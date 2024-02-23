import express, { urlencoded } from 'express'
import * as msal from '@azure/msal-node'
import * as auth from '../auth.js'
import { AuthorizationCodeCredential } from '@azure/identity'

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
    state: req.query.returnUrl,
  }

  let authCodeUrl = await confidentialClientApplication.getAuthCodeUrl(authorizationUrlRequest)

  res.redirect(authCodeUrl)
})

router.get('/code', async (req, res, next) => {
  try {
    const returnUrl = decodeURI(req.query.state)

    if (req.query.error) {
      return res.redirect(returnUrl)
    }

    const code = req.query.code

    const tokenRequest = {
      code,
      scopes,
      redirectUri: process.env.JFTOOLS_AUTH_REDIRECT_URI,
      state: encodeURI(returnUrl),
    }

    const result = await confidentialClientApplication.acquireTokenByCode(tokenRequest)
    const account = result.account

    // var token = await cryptoProvider.getAccessTokenFromCode(code, process.env.JFTOOLS_AUTH_REDIRECT_URI, clientConfig)
    //
    // const credentials = new AuthorizationCodeCredential(
    //   `common`,
    //   process.env.JFTOOLS_AUTH_CLIENT_ID,
    //   process.env.JFTOOLS_AUTH_CLIENT_SECRET,
    //   code,
    //   process.env.JFTOOLS_AUTH_REDIRECT_URI,
    // )

    // credentials.
    //
    // const authProvider = new msal.TokenCredentialAuthenticationProvider(credentials, {
    //   scopes
    // })
    //
    // const client = graph.Client.initWithMiddleware({
    //   authProvider,
    // })

    auth.setLoggedIn(req, account)

    // console.log(client)
    //
    // const me = await client.api('/me').get()
    //
    // console.log(me)
    //
    // auth.setLoggedIn(req, me.userPrincipalName, client)
    //
    // const chats = await client.api(`/me/chats`).get()
    //
    // console.log(chats)

    //
    // const response = fetch({
    //   url: `https://graph.microsoft.com/v1.0/chats`
    // })

    res.redirect(returnUrl)
  } catch(e) {
    console.log(e)

    res.redirect('/')
  }
})

router.get('/logout', (req, res, next) => {
  auth.logout(req)

  const returnUrl = decodeURI(req.query.returnUrl) ?? `/`

  res.redirect(returnUrl)
})

export default router