;(function includeHTML() {
  var i, file, xhttp
  /* Loop through a collection of all HTML elements: */
  const component = document.querySelectorAll('div[include-html]')
  for (i = 0; i < component.length; i++) {
    let elm = component[i]
    /*search for elements with a certain atrribute:*/
    file = elm.getAttribute('include-html')
    if (file) {
      /* Make an HTTP request using the attribute value as the file name: */
      xhttp = new XMLHttpRequest()
      xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
          if (this.status == 200) {
            elm.innerHTML = this.responseText
          }
          if (this.status == 404) {
            elm.innerHTML = 'Page not found.'
          }
          /* Remove the attribute, and call this function once more: */
          elm.removeAttribute('include-html')
          includeHTML()
        }
      }
      xhttp.open('GET', file, true)
      xhttp.send()
      /* Exit the function: */
      return
    }
  }
})()
