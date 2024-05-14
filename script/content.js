document?.addEventListener('includeHTMLLoaded', addContent, false)

const IS_DEV = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
const MIN_PRODUCTS = 20

const useSkeleton = (props) => {
  const { items = 20, className = '', width = '100px', height = '100px' } = props ?? {}

  const updatedClassName = typeof className === 'string' ? `${className} skeleton-layout` : 'skeleton-layout'

  const html = Array.from({ length: items }, () =>
    createElement('div', { className: updatedClassName, style: `width:${width}; height:${height}` })
  )

  return html
}

const getParams = () =>
  location.search
    .substring(1)
    .split('&')
    .reduce((acc, pair) => {
      const [key, value] = pair.split('=')

      if (!!key) acc[key] = decodeURIComponent(decodeURIComponent(value))

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
    productControlOrder: '.product-controls--orderBy > .orderBy--select',
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
    pagination: '.product--pagination .product--paginationButton',
    notFoundClear: '.products--notFound .notFound--button.clearFilters',
    notFoundTryAgain: '.products--notFound .notFound--button.tryAgain',
  }

  const runtime = {
    clientId: params?.CodCliFor ?? '105964',
    catalogId: params?.IDCatalogo ?? '0',
    search: typeof search !== 'string' ? '' : search,
    filters: {
      OrderCatalogo: convertToArray(params?.OrderCatalogo, ',') ?? null,
      Linhas: convertToArray(params?.Linhas, ',') ?? null,
      Grupos: convertToArray(params?.Grupos, ',') ?? null,
      Tamanhos: convertToArray(params?.Tamanhos, ',') ?? null,
      Sexos: convertToArray(params?.Sexos, ',') ?? null,
      Cores: convertToArray(params?.Cores, ',') ?? null,
      Solucoes: convertToArray(params?.Solucoes, ',') ?? null,
      Pagina: params?.Pagina ?? null,
    },
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

    console.info({
      path: path,
      data: data,
      params: params,
      runtime: runtime,
      response: response,
    })

    return response
  }

  const useAvailableFilters = () => {
    const filters = {}

    // Create a new variable based on the default filters
    Object.keys(runtime.filters).forEach((key) => {
      filters[key] = []
    })

    $(schema.productFilterInputs).each((_, item) => {
      const $this = $(item)

      const name = $this.attr('name').replace('[]', '')
      const value = $this.val()
      const checked = $this.is(':checked')

      checked && filters[name].push(value)
    })

    return filters
  }

  const handleFilterChange = () => {
    const filters = useAvailableFilters()

    if (history.pushState) {
      const urlParams = new URLSearchParams(window.location.search)

      Object.entries(filters).forEach(([name, values]) => {
        if (values.length) {
          urlParams.set(name, encodeURIComponent(values.toString()))
        } else {
          urlParams.delete(name)
        }
      })

      const newUrl = `${location.pathname}?${urlParams.toString()}`

      window.history.pushState({ path: newUrl }, '', newUrl)
    }
  }

  const useFilterClear = () => {
    const filters = useAvailableFilters()

    if (history.pushState) {
      const urlParams = new URLSearchParams(window.location.search)

      Object.entries(filters).forEach(([name]) => urlParams.delete(name))

      const newUrl = `${location.pathname}?${urlParams.toString()}`

      window.history.pushState({ path: newUrl }, '', newUrl)
    }
  }

  const handleFilterClear = () => {
    useFilterClear()

    setParams(getParams())
  }

  const handleFilterApply = (e) => {
    e.preventDefault()

    // Double check available filters
    handleFilterChange()

    setParams(getParams())
  }

  const handleSelect = (e, name = 'Tamanhos') => {
    const $this = e.target
    const value = $this.options[$this.selectedIndex].value

    if (history.pushState) {
      const urlParams = new URLSearchParams(window.location.search)

      if (value) {
        urlParams.set(name, encodeURIComponent(value))
      } else {
        urlParams.delete(name)
      }

      const newUrl = `${location.pathname}?${urlParams.toString()}`

      window.history.pushState({ path: newUrl }, '', newUrl)
    }

    setParams(getParams())
  }

  const addToFilter = ({ data, field, local }) => {
    if (data?.length === 0) return

    let htmlFilter = ''

    data?.forEach(({ codigo, descricao }) => {
      const randID = Math.random().toString(36).substring(2, 9)

      htmlFilter += `<div class="filter--optionItem"><input type="checkbox" name="${field}[]" value="${codigo}" id="${randID}-${codigo}" ${runtime.filters?.[field]?.includes(codigo) && 'checked'} /><label for="${randID}-${codigo}">${descricao}</label></div>`
    })

    $(local).html(htmlFilter)

    $(local)?.find('input')?.on('change', handleFilterChange)
  }

  ;(loadMenu = () => {
    $(schema.menu)?.html(useSkeleton({ items: 6, className: 'menu--item', width: '95px', height: '22px' }))

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
    const field = 'Tamanhos'
    const selectContainer = createElement('select', { 'data-filter-field': field }, [
      createElement('option', { value: '' }, field),
    ])

    postData(productParams, `/Produtos/${field}`).then((data) => {
      addToFilter({ data, field, local: schema.productFilterSize })

      data?.forEach(({ codigo, descricao }) => {
        const isSelected = runtime.filters?.[field]?.includes(codigo)

        const option = createElement(
          'option',
          {
            value: codigo,
            ...(isSelected && { selected: true }),
          },
          descricao
        )
        selectContainer.appendChild(option)
      })

      $(schema.productControlSize).html(selectContainer.outerHTML)
      $(schema.productControlSize).one('change', (e) => handleSelect(e, 'Tamanhos'))
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

  const renderNotFound = () => {
    const _notFoundMessage = createElement(
      'p',
      { class: 'notFound--message' },
      'Nenhum produto encontrado, tente verificar os filtros utilizados e tente novamente.'
    )

    const _tryAgainButton = createElement(
      'button',
      { class: 'button normal bg-fill small notFound--button tryAgain' },
      [createElement('span', { class: 'buttonText' }, 'Tentar Novamente')]
    )

    const _clearFiltersButton = createElement(
      'button',
      { class: 'button normal small notFound--button clearFilters' },
      [createElement('span', { class: 'buttonText' }, 'Limpar Filtros')]
    )

    const _buttonsContainer = createElement('div', { class: 'notFound--buttonsContainer' }, [
      _tryAgainButton,
      _clearFiltersButton,
    ])

    const _notFoundContainer = createElement('div', { class: 'products--notFound' }, [
      _notFoundMessage,
      _buttonsContainer,
    ])

    $(schema.productList)?.html(_notFoundContainer)
  }

  const searchProducts = () => {
    const PRODUCT_PARAMS = {
      CodigoCliente: runtime.clientId,
      IDCatalogo: runtime.catalogId,
      Pesquisa: runtime.search,
      OrderCatalogo: runtime.filters.OrderCatalogo,
      QuantidadeRegistrosPagina: MIN_PRODUCTS,
      PaginaAtual: runtime.filters.Pagina,
      Linhas: runtime.filters.Linhas,
      Grupos: runtime.filters.Grupos,
      SubGrupos: undefined,
      Categorias: undefined,
      SubCategorias: undefined,
      Cores: runtime.filters.Cores,
      Sexos: runtime.filters.Sexos,
      Tamanhos: runtime.filters.Tamanhos,
      Solucoes: runtime.filters.Solucoes,
    }

    const width = isMobile() ? '185px' : '286px'
    const height = isMobile() ? '381px' : '526px'

    $(schema.productList)?.html(useSkeleton({ items: MIN_PRODUCTS, className: 'products--listItem', width, height }))

    postData(PRODUCT_PARAMS, '/Produtos/ListaProdutos')
      .then((data) => {
        if (!data || String(data).indexOf('products--listItem') === -1) return renderNotFound()

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

  const handleMenuClick = (e) => {
    e.preventDefault()

    // Clear filters
    useFilterClear()

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

  const debounceSearch = (e) => {
    e.preventDefault()

    const searchValue = $(schema.searchInput).val()

    // Clear filters
    useFilterClear()

    setSearch(searchValue)
  }

  const handlePagination = (e) => {
    const {
      currentTarget,
      currentTarget: { dataset },
    } = e

    const MIN_PAGE = 1
    const pageItem = Number(runtime.filters.Pagina) || MIN_PAGE
    const page = dataset?.page

    const isDisabled = currentTarget.getAttribute('aria-disabled')
    const isCurrentItem = currentTarget.getAttribute('aria-current')
    const isCurrentPage = Number(page) === MIN_PAGE
    const isLowerThanMinimum = page === 'prev' && pageItem == MIN_PAGE

    if (isDisabled || isCurrentItem || isCurrentPage || isLowerThanMinimum) return

    const pageTo = page === 'next' ? pageItem + 1 : page === 'prev' ? pageItem - 1 : page

    if (history.pushState) {
      const urlParams = new URLSearchParams(window.location.search)

      urlParams.set('Pagina', Math.max(pageTo, MIN_PAGE))

      const newUrl = `${location.pathname}?${urlParams.toString()}`

      window.history.pushState({ path: newUrl }, '', newUrl)
      setParams(getParams())
    }
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

  $(document).on('click', schema.notFoundClear, handleFilterClear)
  $(document).on('click', schema.notFoundTryAgain, handleFilterApply)

  $(schema.productFilterApply)?.off('click')
  $(schema.productFilterApply)?.on('click', handleFilterApply)

  $(document).off('click', schema.pagination)
  $(document).on('click', schema.pagination, handlePagination)

  $(schema.productControlOrder).off('change')
  $(schema.productControlOrder).on('change', (e) => handleSelect(e, 'OrderCatalogo'))
}
