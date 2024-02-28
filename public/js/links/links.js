// import * as QRCode from 'https://cdn.jsdelivr.net/npm/node-qrcode@0.0.4/index.min.js'

(function() {
  window.jf = window.jf || {}

  window.jf.copyElementToClipboard = async function (elementId) {
    const element = document.getElementById(elementId)

    const range = document.createRange()
    range.selectNode(element)
    window.getSelection().removeAllRanges()
    window.getSelection().addRange(range)
    document.execCommand('copy')
    window.getSelection().removeAllRanges()
  }

  window.jf.updateQuickLink = async function() {
    const quickLinkGenerator = document.getElementById(`quickLinkGenerator`)
    const fieldQuickLink = document.getElementById(`fieldQuickLink`)
    const quickLinkQr = document.getElementById(`quickLinkQr`)
    const quickLinkText = document.getElementById(`quickLinkText`)

    const quickLink = fieldQuickLink.value

    if (quickLink.trim() === ``) {
      quickLinkGenerator.style.display = `none`
    } else {
      quickLinkGenerator.style.display = `block`
      // const qrCodeUrl = await jf.qrcode.makeCode(quickLink)
      const encodedQuickLink = encodeURIComponent(quickLink)
      const qrCodeUrl = `/qr/${encodedQuickLink}?type=url`
      const response = await fetch(qrCodeUrl)
      const qrCodeDataUrl = await response.text()
      quickLinkQr.src = qrCodeDataUrl

      quickLinkText.innerHTML = quickLink
      quickLinkText.href = quickLink
    }
  }

  window.jf.addPrivateLink = async function() {
    let fieldPrivateLinkName = document.getElementById(`fieldPrivateLinkName`)
    let fieldPrivateLinkUrl = document.getElementById(`fieldPrivateLinkUrl`)

    const label = fieldPrivateLinkName.value
    const url = fieldPrivateLinkUrl.value

    fieldPrivateLinkName.value = ``
    fieldPrivateLinkUrl.value = ``

    jf.links.links.push({ label, url })

    const response = await fetch(`/api/links/private`, {
      method: `POST`,
      headers: {
        'Content-Type': `application/json`
      },
      body: JSON.stringify(jf.links)
    })

    await jf.updatePrivateLinks()
  }

  window.jf.saveAndUploadPrivateLinks = async function() {
    const response = await fetch(`/api/links/private`, {
      method: `POST`,
      headers: {
        'Content-Type': `application/json`
      },
      body: JSON.stringify(jf.links)
    })

    await jf.updatePrivateLinks()
  }

  window.jf.privateLinks = null

  window.jf.updatePrivateLinks = async function() {
    const response = await fetch(`/api/links/private`)
    jf.links = await response.json()

    const privateLinks = document.getElementById(`divPrivateLinks`)
    while (privateLinks.firstChild) {
      privateLinks.removeChild(privateLinks.firstChild)
    }

    const table = document.createElement(`table`)
    table.style.border = `1px solid black`

    const thead = document.createElement(`thead`)

    const tr = document.createElement(`tr`)

    const thLabel = document.createElement(`th`)

    thLabel.innerHTML = `Name`

    tr.appendChild(thLabel)

    const thUrl = document.createElement(`th`)

    thUrl.innerHTML = `URL`

    tr.appendChild(thUrl)

    const thActions = document.createElement(`th`)
    tr.appendChild(thActions)

    thead.appendChild(tr)

    table.appendChild(thead)

    const tbody = document.createElement(`tbody`)

    for (const index in jf.links.links) {
      const link = jf.links.links[index]

      const tr = document.createElement(`tr`)

      const tdLabel = document.createElement(`td`)

      tdLabel.innerHTML = link.label

      tr.appendChild(tdLabel)

      const tdUrl = document.createElement(`td`)

      tdUrl.innerHTML = link.url

      tr.appendChild(tdUrl)

      const tdActions = document.createElement(`td`)

      const buttonCopy = document.createElement(`button`)
      buttonCopy.innerHTML = `&#128203;`
      buttonCopy.onclick = function() {
        jf.copyLink(index)
      }
      tdActions.appendChild(buttonCopy)

      const buttonDelete = document.createElement(`button`)
      buttonDelete.innerHTML = `&#10060;`
      buttonDelete.onclick = function() {
        jf.deleteLink(index)
      }
      tdActions.appendChild(buttonDelete)

      if (index > 0) {
        const buttonMoveUp = document.createElement(`button`)
        buttonMoveUp.innerHTML = `&#11014;`
        buttonMoveUp.onclick = function () {
          jf.moveLinkUp(index)
        }
        tdActions.appendChild(buttonMoveUp)
      }

      const buttonMoveDown = document.createElement(`button`)

      if (index < jf.links.links.length - 1) {
        buttonMoveDown.innerHTML = `&#11015;`
        buttonMoveDown.onclick = function () {
          jf.moveLinkDown(index)
        }
        tdActions.appendChild(buttonMoveDown)
      }

      tr.appendChild(tdActions)

      tbody.appendChild(tr)
    }

    table.appendChild(tbody)

    privateLinks.appendChild(table)
  }

  window.jf.copyLink = async function(index) {
    const link = jf.links.links[index]

    const label = link.label
    const url = link.url

    const text = `${label}\n${url}`

    await navigator.clipboard.writeText(text)
  }

  window.jf.deleteLink = async function(index) {
    const label = jf.links.links[index].label
    const url = jf.links.links[index].url

    const message = `Are you sure you want to delete this link?\n${label} (${url})`

    if (confirm(message)) {
      jf.links.links.splice(index, 1)

      await jf.saveAndUploadPrivateLinks()
    }
  }

  window.jf.moveLinkUp = async function(index) {
    if (index > 0) {
      const link = jf.links.links[index]
      jf.links.links.splice(index, 1)
      jf.links.links.splice(index - 1, 0, link)
    }

    await jf.saveAndUploadPrivateLinks()
  }

  window.jf.moveLinkDown = async function(index) {
    if (index < jf.links.links.length - 1) {
      const link = jf.links.links[index]
      jf.links.links.splice(index, 1)
      jf.links.links.splice(index + 1, 0, link)
    }

    await jf.saveAndUploadPrivateLinks()
  }

  window.addEventListener('load', async function () {
    await jf.updatePrivateLinks()
  })
}())
