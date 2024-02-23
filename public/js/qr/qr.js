function generateQr(event) {
  const fieldText = document.getElementById('fieldText')
  const text = fieldText.value

  if (text.trim()) {
    const urlEncodedText = encodeURIComponent(text)

    window.location.href = '/qr/' + urlEncodedText
  }

  // Do not submit the form
  event.preventDefault()
  return false
}

const formQr = document.getElementById('formQr')
formQr.addEventListener('submit', generateQr)

const commandGenerateQr = document.getElementById('commandGenerateQr')
commandGenerateQr.addEventListener('click', generateQr)