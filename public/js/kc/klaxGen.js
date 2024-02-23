function copyScript() {
  const fieldScript = document.getElementById(`fieldScript`)

  const script = fieldScript.value

  navigator.clipboard.writeText(script)
}