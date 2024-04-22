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

const convertToArray = (value = '', separator = null) => {
  if (typeof value === 'string' && separator != null) return String(value).split(separator)
  else if (typeof value === 'string') return new Array(String(value))
  else return value
}

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
    productFilterCategory: '.filter--listItem.category > .filter--listOptions',
    productFilterModel: '.filter--listItem.model > .filter--listOptions',
    productFilterSize: '.filter--listItem.size > .filter--listOptions',
    productFilterSex: '.filter--listItem.sex > .filter--listOptions',
    productFilterColor: '.filter--listItem.color > .filter--listOptions',
    productFilterCharacter: '.filter--listItem.character > .filter--listOptions',
  }

  const runtime = {
    clientId: params?.CodCliFor ?? '105964',
    catalogId: params?.IDCatalogo ?? '25439',
    pageItem: convertToArray(params?.Linha) ?? null,
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

    console.log({
      path: path,
      data: data,
      params: params,
      runtime: runtime,
      response: path !== '/Produtos/ListaProdutos' && response,
    })

    return response
  }

  const addToFilter = ({ data, field, local }) => {
    if (data?.length === 0) return

    let htmlFilter = ''

    data?.forEach(({ codigo, descricao }) => {
      const randID = Math.random().toString(36).substring(2, 9)

      htmlFilter += `<div class="filter--optionItem"><input type="checkbox" name="${field}[]" value="${codigo}" id="${randID}-${codigo}" /><label for="${randID}-${codigo}">${descricao}</label></div>`
    })

    $(local).html(htmlFilter)
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

      let htmlMenu = ''
      let url = `?CodCliFor=${runtime.clientId}&IDCatalogo=${runtime.catalogId}`

      data?.forEach(({ codigo, descricao }) => {
        let urlModified = `${url}&Linha=${codigo}`

        htmlMenu += `<li class="menu--item"><a href="${urlModified}" target="_self" data-item="${codigo}" class="menu--itemLink">${descricao}</a></li>`
      })

      htmlMenu += `<li class="menu--item desktop-only"><a href="${url}" target="_self" data-item="null" class="menu--itemLink">Todos</a></li>`

      htmlMenu += `<li class="menu--item menu--allItems"><a href="${url}" target="_self" data-item="null" class="menu--itemLink">Ver todas as categorias</a></li>`

      $(schema.menu)?.html(htmlMenu)
    })
  })()

  const loadCategoriesList = (productParams) => {
    postData(productParams, '/Produtos/Linhas').then((data) => {
      addToFilter({ data, field: 'categories', local: schema.productFilterCategory })
    })
  }

  const loadModelsList = (productParams) => {
    postData(productParams, '/Produtos/Grupos').then((data) => {
      addToFilter({ data, field: 'models', local: schema.productFilterModel })
    })
  }

  const loadSizeList = (productParams) => {
    let htmlSelect = '<option value="">Tamanho</option>'

    postData(productParams, '/Produtos/Tamanhos').then((data) => {
      addToFilter({ data, field: 'sizes', local: schema.productFilterSize })

      data?.forEach(({ codigo, descricao }) => {
        htmlSelect += `<option value="${codigo}">${descricao}</option>`
      })

      $(schema.productControlSize).html(htmlSelect)
    })
  }

  const searchProducts = () => {
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
      .then(() => {
        loadCategoriesList(PRODUCT_PARAMS)
        loadModelsList(PRODUCT_PARAMS)
        loadSizeList(PRODUCT_PARAMS)
      })
  }

  // Initial fetch
  searchProducts()

  function handleMenuClick(e) {
    e.preventDefault()

    const {
      target: {
        dataset: { item },
      },
    } = e

    if (history.pushState) {
      const urlParams = new URLSearchParams(window.location.search)

      // Set the new value for the "Linha" parameter
      if (item && item !== 'null') {
        urlParams.set('Linha', item)
      } else {
        // If item is not provided, remove the parameter
        urlParams.delete('Linha')
      }

      const newUrl = `${location.pathname}?${urlParams.toString()}`

      window.history.pushState({ path: newUrl }, '', newUrl)
      setParams(getParams())
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
