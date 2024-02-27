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

  window.addEventListener('load', function() {
    // Convert images to base64 so they can be copied to Microsoft Teams
    const images = document.querySelectorAll('img')

    images.forEach(img => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = img.width
      canvas.height = img.height

      ctx.drawImage(img, 0, 0, img.width, img.height)

      const dataUrl = canvas.toDataURL()
      img.src = dataUrl
    })
  })
}())
