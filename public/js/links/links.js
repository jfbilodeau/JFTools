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

  window.addEventListener('load', function() {
  })
}())
