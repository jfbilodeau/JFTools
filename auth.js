function initStatus(req) {
  if (!req.session.auth) {
    req.session.auth = {
      loggedIn: false,
    }
  }
}

export function status (req) {
  initStatus(req)

  return req.session.auth
}

export function getUsername(req) {
  return status(req).username
}

export function setLoggedIn (req, account) {
  initStatus(req)

  req.session.auth = {
    loggedIn: true,
    username: account.username,
    account,
  }
}

export function logout(req) {
  delete req.session.auth
}

export function authenticated(req, res, next) {
  if (!status(req).loggedIn) {
    res.redirect(`/auth/login?returnTo=${req.originalUrl}`)
  } else {
    next()
  }
}