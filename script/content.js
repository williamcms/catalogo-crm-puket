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

  ;(loadMenu = () => {
    postData(
      {
        CodigoCliente: store.clientId,
        IDCatalogo: catalog.id,
      },
      '/Produtos/Linhas'
    ).then((data) => {
      if (data?.length === 0) return

      let html = ''
      let url = `/Produtos/Catalogo?CodCliFor=${store.clientId}&IDCatalogo=${catalog.id}`

      data?.forEach(({ codigo, descricao }) => {
        let urlModified = `${url}&Linha=${codigo}`

        html += `<li class="menu--item"><a href="${urlModified}" target="_self" class="menu--itemLink">${descricao}</a></li>`
      })

      html += `<li class="menu--item menu--allItems"><a href="${url}" target="_self" class="menu--itemLink">Ver todas as categorias</a></li>`

      schema.menu?.html(html)
    })
  })()
}
