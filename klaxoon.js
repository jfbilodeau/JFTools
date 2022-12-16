import { getStudyGuide } from './scrapper.js'
import axios from 'axios'
import fetch from 'node-fetch'
import { parse } from 'node-html-parser'

async function createSessionToken(session) {
  const uri = `https://enterprise.klaxoon.com/manager/meeting/${session.id}/klax/popup-create/poll?isCreation=true`

  const createPollResponse = await fetch(uri, {
    headers: {
      cookie: session.cookie,
      referer: `https://enterprise.klaxoon.com/manager/activities/?parent=https%3A%2F%2Fenterprise.klaxoon.com&t=1670967451258`
    }
  })
  const body = await createPollResponse.text()

  const root = parse(body)

  const input = root.querySelector(`#poll__token`)

  const token = input.attrs.value

  return token
}

async function createSession (options) {
  let {
    title,
    cookie
  } = options

  const uri = `https://enterprise.klaxoon.com/manager/api/meeting_create`
  const payload = `--BOUNDARY\r\nContent-Disposition: form-data; name="data"\r\n\r\n{"label":"${title}","type":null,"image":{}}\r\n--BOUNDARY--`

  const init = {
    method: `post`,
    body: payload,
    headers: {
      cookie,
      'accept': `application/json`,
      'accept-language': `en-CA,en;q=0.9,fr-CA;q=0.8,fr;q=0.7`,
      'sec-ch-ua': '"Not?A_Brand";v="8", "Chromium";v="108", "Microsoft Edge";v="108"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'same-origin',
      'sec-fetch-site': 'same-origin',
      'x-requested-with': 'XMLHttpRequest',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'origin': `https://enterprise.klaxoon.com`,
      'referer': `https://enterprise.klaxoon.com/userspace/studio/manager/activities/`,
      'content-type': `multipart/form-data; boundary=BOUNDARY`,
    }
  }

  // const response = await fetch(uri, init)
  // const body = await response.text()

  const response = await axios.post(uri, payload, init)

  const result = response.data

  return {
    id: result.id,
    accessId: result.accessId,
    uri: `https://enterprise.klaxoon.com/manager/meeting/${result.id}`,
    cookie,
  }
}

async function createPollToken (session) {
  const uri = `https://enterprise.klaxoon.com/manager/meeting/${session.id}/klax/popup-create/poll?isCreation=true`

  const createPollResponse = await fetch(uri, {
    headers: {
      cookie: session.cookie,
      referer: `https://enterprise.klaxoon.com/manager/activities/?parent=https%3A%2F%2Fenterprise.klaxoon.com?t=1670968437467`,
      accept: `*/*`,
      'sec-ch-ua': '"Not?A_Brand";v="8", "Chromium";v="108", "Microsoft Edge";v="108"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'x-requested-with': `XMLHttpRequest`
    }
  })
  const body = await createPollResponse.text()

  const root = parse(body)

  const input = root.querySelector(`#poll__token`)

  const token = input.attrs.value

  return token
}

async function createPoll (session) {
  const token = await createPollToken(session)

  const uri = `https://enterprise.klaxoon.com/manager/meeting/12271/klax/poll/create`

  const init = {
    method: `post`,
    body: payload,
    headers: {
      cookie,
      'accept': `application/json`,
      'accept-language': `en-CA,en;q=0.9,fr-CA;q=0.8,fr;q=0.7`,
      'sec-ch-ua': '"Not?A_Brand";v="8", "Chromium";v="108", "Microsoft Edge";v="108"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'same-origin',
      'sec-fetch-site': 'same-origin',
      'x-requested-with': 'XMLHttpRequest',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'origin': `https://enterprise.klaxoon.com`,
      'referer': `https://enterprise.klaxoon.com/manager/meeting/${session.id}?parent=https%3A%2F%2Fenterprise.klaxoon.com`,
      'content-type': `multipart/form-data; boundary=BOUNDARY`,
    }
  }

  const response = await axios.post(uri, payload, init)

  const result = response.data

  return {
    id: result.id,
    accessId: result.accessId,
    uri: `https://enterprise.klaxoon.com/manager/meeting/${result.id}`,
    cookie,
  }

}

export async function startSession (options) {
  let {
    studyGuide,
    cookie,
    title,
    units
  } = options

  const session = await createSession(options)

  const poll = await createPoll(session)

  return session
}