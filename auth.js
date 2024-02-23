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