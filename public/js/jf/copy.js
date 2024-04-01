(function() {
  const jf = window.jf || {}

  jf.copyElementToClipboard = async function (elementId) {
    const element = document.getElementById(elementId)

    const range = document.createRange()
    range.selectNode(element)
    window.getSelection().removeAllRanges()
    window.getSelection().addRange(range)
    document.execCommand('copy')
    window.getSelection().removeAllRanges()
  }

  window.jf = jf
}())
