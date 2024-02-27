(function() {
  window.jf = window.jf || {}

  window.jf.copyElementToClipboard = async function (elementId) {
    const element = document.getElementById(elementId)
    // const text = element.innerHTML
    //
    // await navigator.clipboard.writeText(text)
    const range = document.createRange()
    range.selectNode(element)
    window.getSelection().removeAllRanges()
    window.getSelection().addRange(range)
    document.execCommand('copy')
    window.getSelection().removeAllRanges()
  }

  window.jf.updateQuickLink = async function () {
    const quickLinkGenerator = document.getElementById(`quickLinkGenerator`)
    const fieldQuickLink = document.getElementById(`fieldQuickLink`)
    const quickLinkQr = document.getElementById(`quickLinkQr`)
    const quickLinkText = document.getElementById(`quickLinkText`)

    const quickLink = fieldQuickLink.value

    if (quickLink.trim() === ``) {
      quickLinkGenerator.style.display = `none`
    } else {
      quickLinkGenerator.style.display = `block`
      const encoded = encodeURIComponent(quickLink)

      const qrCodeUrl = `/qr/${encoded}`

      quickLinkQr.visible = true
      quickLinkQr.src = qrCodeUrl
      // convertImageToBase64(quickLinkQr)

      quickLinkText.visible = true
      quickLinkText.innerHTML = quickLink
      quickLinkText.href = quickLink
    }
  }

  function convertImageToBase64(img) {
    if (img.src.startsWith(`data:`)) {
      // Already encoded. Skip!
      return
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = img.width
    canvas.height = img.height

    ctx.drawImage(img, 0, 0, img.width, img.height)

    const dataUrl = canvas.toDataURL()
    img.src = dataUrl
  }

  window.addEventListener('load', function() {
    // Convert images to base64 so they can be copied to Microsoft Teams
    const images = document.querySelectorAll('img')

    images.forEach(img => {
      // convertImageToBase64(img)
      img.addEventListener('load', function() {
        convertImageToBase64(this)
      })
    })
  })
}())
