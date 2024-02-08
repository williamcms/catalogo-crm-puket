;(function includeHTML() {
  var i, file, xhttp
  const component = document.querySelectorAll('div[include-html]')
  let count = component.length

  if (component.length === 0) {
    document?.addEventListener('DOMContentLoaded', () => document.dispatchEvent(new Event('includeHTMLLoaded')), false)
  }

  for (i = 0; i < component.length; i++) {
    let elm = component[i]
    file = elm.getAttribute('include-html')
    if (file) {
      xhttp = new XMLHttpRequest()
      xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
          if (this.status == 200) {
            elm.outerHTML = this.responseText
          }
          if (this.status == 404) {
            elm.innerHTML = 'Page not found.'
          }
          elm.removeAttribute('include-html')
          count--
          if (count === 0) {
            document.dispatchEvent(new Event('includeHTMLLoaded'))
          }
        }
      }
      xhttp.open('GET', file, true)
      xhttp.send()
    }
  }
})()
