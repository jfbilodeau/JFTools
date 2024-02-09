import fetch from 'isomorphic-fetch'
import express, { urlencoded } from 'express'
import options from '../options.js'
import * as msal from '@azure/msal-node'
import * as auth from '../auth.js'
import { InteractionType } from '@azure/msal-browser'
import {
  TokenCredentialAuthenticationProvider
} from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials/index.js'
import graph from '@microsoft/microsoft-graph-client'
import { AuthorizationCodeCredential } from '@azure/identity'

const cryptoProvider = new msal.CryptoProvider()

const router = express.Router()

const scopes = [
  `user.read`,
  `Chat.ReadWrite`
]


router.get('/login', async (req, res, next) => {
  const publicClientApplication = new msal.PublicClientApplication({ 
    auth: { 
      clientId: process.env.JFTOOLS_AUTH_CLIENT_ID 
    } 
  })

  req.session.authState = cryptoProvider.createNewGuid()

  const authorizationUrlRequest = {
    scopes,
    redirectUri: process.env.JFTOOLS_AUTH_REDIRECT_URI,
    state: req.query.returnUrl,
  }

  let authCodeUrl = await publicClientApplication.getAuthCodeUrl(authorizationUrlRequest)

  res.redirect(authCodeUrl)
})

router.get('/redirect', async (req, res, next) => {
  try {
    const returnUrl = decodeURI(req.query.state)

    if (req.query.error) {
      return res.redirect(returnUrl)
    }

    const code = req.query.code

    const credentials = new AuthorizationCodeCredential(
      `common`,
      process.env.JFTOOLS_AUTH_CLIENT_ID,
      process.env.JFTOOLS_AUTH_CLIENT_SECRET,
      code,
      process.env.JFTOOLS_AUTH_REDIRECT_URI,
    )

    const authProvider = new TokenCredentialAuthenticationProvider(credentials, {
      scopes
    })

    const client = graph.Client.initWithMiddleware({
      authProvider,
    })

    console.log(client)

    const me = await client.api('/me').get()

    console.log(me)

    auth.setLoggedIn(req, me.userPrincipalName, client)

    const chats = await client.api(`/me/chats`).get()

    console.log(chats)

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