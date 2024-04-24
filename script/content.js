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
  if (value === '') return []
  if (typeof value === 'string' && separator != null) return String(value).split(separator)
  else if (typeof value === 'string') return new Array(String(value))
  else return value
}

function addContent() {
  const host = IS_DEV ? 'https://ti.grupounico.com' : location.origin

  // Triggers reload of addContent state (re-excute all functions)
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
    productFilterForm: '#filter-form',
    productFilterCategory: '.filter--listItem.category > .filter--listOptions',
    productFilterModel: '.filter--listItem.model > .filter--listOptions',
    productFilterSize: '.filter--listItem.size > .filter--listOptions',
    productFilterSex: '.filter--listItem.sex > .filter--listOptions',
    productFilterColor: '.filter--listItem.color > .filter--listOptions',
    productFilterCharacter: '.filter--listItem.character > .filter--listOptions',
    productFilterInputs: '.filter--listItem > .filter--listOptions input',
    productFilterClear: '.filter-list--footer > .button--clear',
    productFilterApply: '.filter-list--footer > .button--apply',
  }

  const runtime = {
    clientId: params?.CodCliFor ?? '105964',
    catalogId: params?.IDCatalogo ?? '25439',
    pageItem: params?.Pagina ?? null,
    search: typeof search !== 'string' ? '' : search,
    filters: {
      Linhas: convertToArray(params?.Linhas) ?? null,
      Grupos: convertToArray(params?.Grupos) ?? null,
      Tamanhos: convertToArray(params?.Tamanhos) ?? null,
      Sexos: convertToArray(params?.Sexos) ?? null,
      Cores: convertToArray(params?.Cores) ?? null,
      Solucoes: convertToArray(params?.Solucoes) ?? null,
    },
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

  function handleFilterChange(e) {
    const target = $(e.target)

    const allValues = new Array()
    const name = target.attr('name').replace('[]', '')

    $(schema.productFilterInputs + `[name="${name}[]"]`).each((_, item) => {
      const $this = $(item)

      const value = $this.val()
      const checked = $this.is(':checked')

      checked && allValues.push(value)
    })

    if (history.pushState) {
      const urlParams = new URLSearchParams(window.location.search)

      if (allValues.length) {
        urlParams.set(name, encodeURI(allValues.toString()))
      } else {
        urlParams.delete(name)
      }

      const newUrl = `${location.pathname}?${urlParams.toString()}`

      window.history.pushState({ path: newUrl }, '', newUrl)
    }
  }

  function handleFilterClear() {
    const allValues = new Array()

    $(schema.productFilterInputs).each((_, item) => {
      const $this = $(item)

      const name = $this.attr('name').replace('[]', '')

      allValues.push(name)
    })

    if (history.pushState) {
      const urlParams = new URLSearchParams(window.location.search)

      allValues.forEach((item) => urlParams.delete(item))

      const newUrl = `${location.pathname}?${urlParams.toString()}`

      window.history.pushState({ path: newUrl }, '', newUrl)

      setParams(getParams())
    }
  }

  function handleFilterApply(e) {
    e.preventDefault()

    setParams(getParams())
  }

  const addToFilter = ({ data, field, local }) => {
    if (data?.length === 0) return

    let htmlFilter = ''

    data?.forEach(({ codigo, descricao }) => {
      const randID = Math.random().toString(36).substring(2, 9)

      htmlFilter += `<div class="filter--optionItem"><input type="checkbox" name="${field}[]" value="${codigo}" id="${randID}-${codigo}" /><label for="${randID}-${codigo}">${descricao}</label></div>`
    })

    $(local).html(htmlFilter)

    $(local)?.find('input')?.on('change', handleFilterChange)
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
        let urlModified = `${url}&Linhas=${codigo}`

        htmlMenu += `<li class="menu--item"><a href="${urlModified}" target="_self" data-item="${codigo}" class="menu--itemLink">${descricao}</a></li>`
      })

      htmlMenu += `<li class="menu--item desktop-only"><a href="${url}" target="_self" data-item="null" class="menu--itemLink">Todos</a></li>`

      htmlMenu += `<li class="menu--item menu--allItems"><a href="${url}" target="_self" data-item="null" class="menu--itemLink">Ver todas as categorias</a></li>`

      $(schema.menu)?.html(htmlMenu)
    })
  })()

  const loadCategoriesList = (productParams) => {
    postData(productParams, '/Produtos/Linhas').then((data) => {
      addToFilter({ data, field: 'Linhas', local: schema.productFilterCategory })
    })
  }

  const loadModelsList = (productParams) => {
    postData(productParams, '/Produtos/Grupos').then((data) => {
      addToFilter({ data, field: 'Grupos', local: schema.productFilterModel })
    })
  }

  const loadSizeList = (productParams) => {
    let htmlSelect = '<option value="">Tamanho</option>'

    postData(productParams, '/Produtos/Tamanhos').then((data) => {
      addToFilter({ data, field: 'Tamanhos', local: schema.productFilterSize })

      data?.forEach(({ codigo, descricao }) => {
        htmlSelect += `<option value="${codigo}">${descricao}</option>`
      })

      $(schema.productControlSize).html(htmlSelect)
    })
  }

  const loadSexList = (productParams) => {
    postData(productParams, '/Produtos/Sexo').then((data) => {
      addToFilter({ data, field: 'Sexos', local: schema.productFilterSex })
    })
  }

  const loadColorList = (productParams) => {
    postData(productParams, '/Produtos/Cores').then((data) => {
      addToFilter({ data, field: 'Cores', local: schema.productFilterColor })
    })
  }

  const loadCharacterList = (productParams) => {
    postData(productParams, '/Produtos/Solucoes').then((data) => {
      addToFilter({ data, field: 'Solucoes', local: schema.productFilterCharacter })
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
      Linhas: runtime.filters.Linhas,
      Grupos: runtime.filters.Grupos,
      SubGrupos: undefined,
      Categorias: undefined,
      SubCategorias: undefined,
      // not working
      // Cores: runtime.filters.Cores,
      Sexos: runtime.filters.Sexos,
      Tamanhos: runtime.filters.Tamanhos,
      Solucoes: runtime.filters.Solucoes,
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
        loadSexList(PRODUCT_PARAMS)
        loadColorList(PRODUCT_PARAMS)
        loadCharacterList(PRODUCT_PARAMS)
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

      if (item && item !== 'null') {
        urlParams.set('Linhas', item)
      } else {
        urlParams.delete('Linhas')
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
  // These events should be removed before being added because they are at the root of the function,
  // and updating the state may cause them to duplicate
  $(document).off('click', schema.menuItems)
  $(document).on('click', schema.menuItems, handleMenuClick)

  $(schema.searchForm)?.off('submit')
  $(schema.searchForm)?.on('submit', debounceSearch)

  // Prevent form submission, as the form tag is solely used to reset its fields
  $(schema.productFilterForm)?.off('submit')
  $(schema.productFilterForm)?.on('submit', (e) => e.preventDefault())

  $(schema.productFilterClear)?.off('click')
  $(schema.productFilterClear)?.on('click', handleFilterClear)

  $(schema.productFilterApply)?.off('click')
  $(schema.productFilterApply)?.on('click', handleFilterApply)

}
