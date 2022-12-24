function selectAll() {
  const checkboxes = document.querySelectorAll(`input[type='checkbox']`)

  checkboxes.forEach(c => c.checked = true)
}

function selectNone() {
  const checkboxes = document.querySelectorAll(`input[type='checkbox']`)

  checkboxes.forEach(c => c.checked = false)
}