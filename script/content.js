document?.addEventListener('includeHTMLLoaded', addContent, false)

const IS_DEV = location.hostname === 'localhost' || location.hostname === '127.0.0.1'

function addContent() {
  const host = IS_DEV ? 'https://ti.grupounico.com' : location.origin

  const schema = {
    menu: $('.menu--container > ul.menu--list'),
  }

  const store = {
    clientId: $('#clientId').val(),
  }

  const catalog = {
    id: $('#catalogId').val(),
    order: 'ASC',
  }

  const postData = async (data = {}, path = '') => {
    const response = await $.ajax({
      type: 'POST',
      data,
      url: host + path,
      cache: false,
      async: true,
      traditional: true,
    })

    return response
  }
}
