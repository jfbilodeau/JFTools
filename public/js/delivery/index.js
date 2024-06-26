(function() {
  const jf = window.jf || {}

  jf.updateQuickLink = async function() {
    const quickLinkGenerator = document.getElementById(`quickLinkGenerator`)
    const fieldQuickLink = document.getElementById(`fieldQuickLink`)
    const quickLinkQr = document.getElementById(`quickLinkQr`)
    const quickLinkText = document.getElementById(`quickLinkText`)

    const quickLink = fieldQuickLink.value

    if (quickLink.trim() === ``) {
      quickLinkGenerator.style.display = `none`
    } else {
      quickLinkGenerator.style.display = `block`
      const encodedQuickLink = encodeURIComponent(quickLink)
      console.log(encodedQuickLink)
      const qrCodeUrl = `/qr/${encodedQuickLink}?type=url`
      const response = await fetch(qrCodeUrl)
      const qrCodeDataUrl = await response.text()
      quickLinkQr.src = qrCodeDataUrl

      quickLinkText.innerHTML = quickLink
      quickLinkText.href = quickLink
    }
  }

  jf.addPrivateLink = async function(event) {
    event.preventDefault()

    // In case JF Tools is opened in more than one tab, we want to make sure we're using the latest data
    await jf.getPrivateLinks()

    let formAddPrivateLink = document.getElementById(`formAddPrivateLink`)
    let fieldPrivateLinkLabel = document.getElementById(`fieldPrivateLinkLabel`)
    let fieldPrivateLinkUrl = document.getElementById(`fieldPrivateLinkUrl`)

    const label = fieldPrivateLinkLabel.value
    const url = fieldPrivateLinkUrl.value

    if (label.trim() === ``) {
      alert(`Link label cannot be blank`)
      return
    }

    if (url.trim() === ``) {
      alert(`Link URL cannot be blank`)
      return
    }

    formAddPrivateLink.disabled = true

    fieldPrivateLinkLabel.value = ``
    fieldPrivateLinkUrl.value = ``

    jf.privateLinks.links.push({ label, url })

    await jf.saveAndUpdatePrivateLinks()

    formAddPrivateLink.disabled = false
  }

  jf.saveAndUpdatePrivateLinks = async function() {
    const response = await fetch(`/api/delivery/private/${jf.courseCode}`, {
      method: `POST`,
      headers: {
        'Content-Type': `application/json`
      },
      body: JSON.stringify(jf.privateLinks)
    })

    await jf.getPrivateLinks()
  }

  jf.getPrivateLinks = async function() {
    const response = await fetch(`/api/delivery/private/${jf.courseCode}`)
    jf.privateLinks = await response.json()

    const privateLinks = document.getElementById(`divPrivateLinks`)

    generateLinksTable(privateLinks, jf.privateLinks.links)
  }

  jf.copyLink = async function(index) {
    const link = jf.privateLinks.links[index]

    const label = link.label
    const url = link.url

    const text = `${label}\n${url}`

    await navigator.clipboard.writeText(text)
  }

  jf.deleteLink = async function(index) {
    // In case JF Tools is opened in more than one tab, we want to make sure we're using the latest data
    await jf.getPrivateLinks()

    if (index < 0 || index >= jf.privateLinks.links.length) {
      alert('Link no longer exists. It might have been deleted in another tab.')

      return
    }
    const label = jf.privateLinks.links[index].label
    const url = jf.privateLinks.links[index].url

    const message = `Are you sure you want to delete this link?\n${label} (${url})`

    if (confirm(message)) {
      jf.privateLinks.links.splice(index, 1)

      await jf.saveAndUpdatePrivateLinks()
    }
  }

  jf.movePrivateLinkUp = async function(index) {
    // In case JF Tools is opened in more than one tab, we want to make sure we're using the latest data
    await jf.getPrivateLinks()

    if (index > 0) {
      const link = jf.privateLinks.links[index]
      jf.privateLinks.links.splice(index, 1)
      jf.privateLinks.links.splice(index - 1, 0, link)
    }

    await jf.saveAndUpdatePrivateLinks()
  }

  jf.movePrivateLinkDown = async function(index) {
    // In case JF Tools is opened in more than one tab, we want to make sure we're using the latest data
    await jf.getPrivateLinks()

    if (index < jf.privateLinks.links.length - 1) {
      const link = jf.privateLinks.links[index]
      jf.privateLinks.links.splice(index, 1)
      jf.privateLinks.links.splice(index + 1, 0, link)
    }

    await jf.saveAndUpdatePrivateLinks()
  }

  jf.getGlobalLink = async function() {
    const response = await fetch(`/api/delivery/links`)
    jf.globalLinks = await response.json()

    const globalLinks = document.getElementById(`divGlobalLinks`)

    generateLinksTable(globalLinks, jf.globalLinks.links)
  }

  window.jf = jf

  window.addEventListener('load', async function () {
    jf.courseCode = document.getElementById(`courseCode`).innerText

    await jf.getPrivateLinks()
    await jf.getGlobalLink()
  })

  // Private section
  function generateLinksTable (element, links) {
    while (element.firstChild) {
      element.removeChild(element.firstChild)
    }

    const table = document.createElement(`table`)
    table.style.border = `1px solid black`

    const thead = document.createElement(`thead`)

    const tr = document.createElement(`tr`)

    const thLabel = document.createElement(`th`)

    thLabel.innerHTML = `Label`

    tr.appendChild(thLabel)

    const thUrl = document.createElement(`th`)

    thUrl.innerHTML = `URL`

    tr.appendChild(thUrl)

    const thActions = document.createElement(`th`)
    tr.appendChild(thActions)

    thead.appendChild(tr)

    table.appendChild(thead)

    const tbody = document.createElement(`tbody`)

    for (const index in links) {
      const link = links[index]

      const tr = document.createElement(`tr`)

      const tdLabel = document.createElement(`td`)

      tdLabel.innerHTML = link.label

      tr.appendChild(tdLabel)

      const tdUrl = document.createElement(`td`)

      tdUrl.innerHTML = `<a href=${link.url}>${link.url}</a>`

      tr.appendChild(tdUrl)

      const tdActions = document.createElement(`td`)

      const buttonCopy = document.createElement(`button`)
      buttonCopy.innerHTML = `&#128203;`
      buttonCopy.onclick = async function () {
        await jf.copyLink(index)
      }
      tdActions.appendChild(buttonCopy)

      const buttonDelete = document.createElement(`button`)
      buttonDelete.innerHTML = `&#10060;`
      buttonDelete.onclick = async function () {
        await jf.deleteLink(index)
      }
      tdActions.appendChild(buttonDelete)

      if (index > 0) {
        const buttonMoveUp = document.createElement(`button`)
        buttonMoveUp.innerHTML = `&#11014;`
        buttonMoveUp.onclick = async function () {
          await jf.movePrivateLinkUp(index)
        }
        tdActions.appendChild(buttonMoveUp)
      }

      const buttonMoveDown = document.createElement(`button`)

      if (index < links.length - 1) {
        buttonMoveDown.innerHTML = `&#11015;`
        buttonMoveDown.onclick = async function () {
          await jf.movePrivateLinkDown(index)
        }
        tdActions.appendChild(buttonMoveDown)
      }

      tr.appendChild(tdActions)

      tbody.appendChild(tr)
    }

    table.appendChild(tbody)

    element.appendChild(table)
  }
}())
