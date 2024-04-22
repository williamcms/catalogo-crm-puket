document?.addEventListener('includeHTMLLoaded', addContent, false)

const IS_DEV = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
const MIN_PRODUCTS = 20

const skeleton = (props) => {
  let { items = 20, className = '', width = '100px', height = '100px' } = props ?? {}

  typeof className === 'string' && (className += ' skeleton-layout')

  let html = [...Array(items)].map(() =>
    createElement('div', { className: className, style: `width:${width}; height:${height}` })
  )

  return html
}

const getParams = () =>
  location.search
    .substring(1)
    .split('&')
    .reduce((acc, pair) => {
      const [key, value] = pair.split('=')
      acc[key] = value
      return acc
    }, {})

function addContent() {
  const host = IS_DEV ? 'https://ti.grupounico.com' : location.origin

  const [params, setParams] = useState(getParams(), arguments)
  const [search, setSearch] = useState('', arguments)

  const schema = {
    menu: '.menu--container > ul.menu--list',
    menuItems: '.menu--container > ul.menu--list a.menu--itemLink',
    searchForm: '.header--search #header-search',
    searchInput: '.header--search input[type="search"]',
    searchButton: '.header--search button.search--button',
    productList: '.products--wrapper > .products--container > .products--listage',
    productControlSize: '.product-controls--size > .size--select',
    productFilterSize: '.filter--listItem > .filter--listOptions',
  }

  const runtime = {
    clientId: params?.CodCliFor ?? '105964',
    catalogId: params?.IDCatalogo ?? '25439',
    pageItem: params?.Linha ?? null,
    search: typeof search !== 'string' ? '' : search,
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

    console.log(path, response)

    return response
  }

  ;(loadMenu = () => {
    $(schema.menu)?.html(skeleton({ items: 6, className: 'menu--item', width: '95px', height: '22px' }))

    postData(
      {
        CodigoCliente: runtime.clientId,
        IDCatalogo: runtime.catalogId,
      },
      '/Produtos/Linhas'
    ).then((data) => {
      if (data?.length === 0) return

      let html = ''
      let url = `?CodCliFor=${runtime.clientId}&IDCatalogo=${runtime.catalogId}`

      data?.forEach(({ codigo, descricao }) => {
        let urlModified = `${url}&Linha=${codigo}`

        html += `<li class="menu--item"><a href="${urlModified}" target="_self" data-item="${codigo}" class="menu--itemLink">${descricao}</a></li>`
      })

      html += `<li class="menu--item desktop-only"><a href="${url}" target="_self" data-item="null" class="menu--itemLink">Todos</a></li>`

      html += `<li class="menu--item menu--allItems"><a href="${url}" target="_self" data-item="null" class="menu--itemLink">Ver todas as categorias</a></li>`

      $(schema.menu)?.html(html)
    })
  })()

  const loadSizeList = (productParams) => {
    let htmlSelect = '<option value="">Tamanho</option>'
    let htmlFilter = ''

    postData(productParams, '/Produtos/Tamanhos').then((data) => {
      data?.forEach(({ codigo, descricao }) => {
        htmlSelect += `<option value="${codigo}">${descricao}</option>`
        htmlFilter += `<div class="filter--optionItem"><input type="checkbox" name="tamanhos[]" value="${codigo}" id="tamanhos-${codigo}" /><label for="tamanhos-${codigo}">${descricao}</label></div>`
      })

      $(schema.productControlSize).html(htmlSelect)
      $(schema.productFilterSize).html(htmlFilter)
    })
  }

  const searchProducts = () => {
    console.log('searchProducts', runtime)
    const PRODUCT_PARAMS = {
      CodigoCliente: runtime.clientId,
      IDCatalogo: runtime.catalogId,
      Pesquisa: runtime.search,
      Ordenar: undefined,
      QuantidadeRegistrosPagina: MIN_PRODUCTS,
      PaginaAtual: undefined,
      Linhas: runtime.pageItem,
      Grupos: undefined,
      SubGrupos: undefined,
      Categorias: undefined,
      SubCategorias: undefined,
      Sexos: undefined,
      Tamanhos: undefined,
      Solucoes: undefined, //personagem
    }

    const width = isMobile() ? '185px' : '286px'
    const height = isMobile() ? '381px' : '526px'

    $(schema.productList)?.html(skeleton({ items: MIN_PRODUCTS, className: 'products--listItem', width, height }))

    postData(PRODUCT_PARAMS, '/Produtos/ListaProdutos')
      .then((data) => {
        if (!data || String(data).indexOf('products--listItem') === -1) return

        // Treatment to use lazyload
        const html = $(data).each(() => {
          var $this = $(this).find('.summary-item--imageElement')
          $this
            .attr({
              'data-src': $this.attr('src'),
            })
            .removeAttr('src')
        })

        $(schema.productList)?.html(html)
      })
      .then(() => loadSizeList(PRODUCT_PARAMS))
  }

  console.log('params', params, getParams())

  // Initial fetch
  searchProducts()

  function handleMenuClick(e) {
    e.preventDefault()

    const {
      target: {
        dataset: { item },
      },
    } = e

    console.log('$(schema.menuItems)', runtime, item)

    if (history.pushState) {
      const params = new URLSearchParams(window.location.search)

      // Set the new value for the "Linha" parameter
      if (item && item !== 'null') {
        params.set('Linha', item)
      } else {
        // If item is not provided, remove the parameter
        params.delete('Linha')
      }

      const newUrl = `${location.pathname}?${params.toString()}`

      window.history.pushState({ path: newUrl }, '', newUrl)
      setParams()
    }
  }

  function debounceSearch(e) {
    e.preventDefault()

    const searchValue = $(schema.searchInput).val()

    setSearch(searchValue)
  }

  // Fetch products triggers
  $(document).one('click', schema.menuItems, handleMenuClick)

  $(schema.searchForm)?.one('submit', debounceSearch)
}
