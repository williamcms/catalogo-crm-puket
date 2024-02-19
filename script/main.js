document?.addEventListener('includeHTMLLoaded', init, false)

const isMobile = () => {
  var isMobile = false

  if (
    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
      navigator.userAgent
    ) ||
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
      navigator.userAgent.substr(0, 4)
    )
  ) {
    isMobile = true
  }
  return isMobile
}

function init() {
  // Set aria-expanded for needed overlays
  if (isMobile()) {
    const overlayButtons = document.querySelectorAll('.overlay--button')
    overlayButtons.forEach((item) => {
      const target = item.getAttribute('aria-controls')
      const overlay = document.querySelector(`#${target}`)

      if (!overlay?.style.display === '') return

      if (overlay) overlay.style.display = 'none'
      item.setAttribute('aria-expanded', 'false')
    })
  }

  // Handle overlay opening
  $(document).on('mousedown', '.overlay--button', (e) => handleOverlay(e))
  $(document).on('keyup', '.overlay--button', (e) => handleOverlay(e))

  // Handle overlay close
  $(document).on('mousedown', '.overlay--close', (e) => handleOverlay(e))
  $(document).on('keyup', '.overlay--close', (e) => handleOverlay(e))

  const handleOverlay = (e) => {
    if (e.button !== 0 && e.button !== 1 && e.key !== 'Enter' && e.key !== ' ') return

    const currentElm = e.currentTarget
    const targetElm = e.target

    // Prevent default behavior propagation from affecting interaction elements
    if ($(targetElm).hasClass('summary-item--skuItem')) return
    if ($(targetElm).hasClass('summary-item--addToCart')) return

    // Mount quick-view
    if ($(currentElm).hasClass('summary-item--link')) mountQuickView(e)

    const body = document.querySelector('body')
    const targetToOpen = currentElm.getAttribute('aria-controls')

    const overlay = document.getElementById(targetToOpen)

    const overlayState = overlay.style.display === 'none' || overlay.style.display === ''
    const openingBttn = document.getElementById(overlay.getAttribute('aria-controlledby'))

    // Assign an id to the targeted overlay when needed
    if (currentElm.getAttribute('data-dynamicId') === 'true') {
      const customId = currentElm.getAttribute('id')
      overlay.setAttribute('aria-controlledby', customId)
    }

    overlay.style.display = overlayState ? 'block' : 'none'
    overlay.classList.toggle('isOpen', overlayState)
    overlay.classList.toggle('isClosed', !overlayState)
    body.classList.toggle('noscroll', overlayState)

    currentElm.setAttribute('aria-expanded', overlayState)
    overlay.setAttribute('aria-hidden', !overlayState)

    // Unmount quick-view when the overlay state changes
    if (targetToOpen === 'product-quickview' && !overlayState) unmountQuickView()

    // Alternate focus between trigger & overlay
    if (!overlayState) openingBttn.focus()
    else overlay.focus()
  }

  const getTopOverlay = () => {
    const most = Array.from(document.querySelectorAll('.overlay--wrapper.isOpen')).reduce(
      (acc, current) => {
        const zIndex = window.getComputedStyle(current, null).getPropertyValue('z-index')

        if (zIndex !== null && zIndex !== 'auto' && zIndex >= acc?.zIndex) {
          return { elm: current, zIndex }
        }
      },
      { elm: null, zIndex: 0 }
    )

    return most ?? null
  }

  const closeTopMostOverlay = (e) => {
    const { elm: overlay } = getTopOverlay()

    if (e.button !== 0 && e.button !== 1 && e.key !== 'Escape' && e.key !== ' ') return

    if (overlay && overlay?.getAttribute('aria-hidden') === 'false') {
      const body = document.querySelector('body')
      const openingBttn = document.getElementById(overlay.getAttribute('aria-controlledby'))

      overlay.style.display = 'none'
      overlay.setAttribute('aria-hidden', 'true')
      overlay.classList.remove('isOpen')
      overlay.classList.add('isClosed')
      body.classList.toggle('noscroll', false)
      openingBttn.focus()

      // Removed assigned id to targeted overlay
      if (openingBttn.getAttribute('data-dynamicId') === 'true') {
        overlay.removeAttribute('aria-controlledby')
      }
    }
  }

  window.addEventListener('keyup', (e) => closeTopMostOverlay(e))

  $(document).on('click', '.overlay--wrapper', (e) => {
    const target = e.target
    if (!target.classList.contains('isOpen')) return
    if (target.id === 'product-quickview') unmountQuickView()
    closeTopMostOverlay(e)
  })

  // Check if elm is in viewport
  const isInViewport = (elm) => {
    const rect = elm.getBoundingClientRect()

    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  }

  // Handle images lazyload
  const lazyLoadImages = () => {
    const imagesToOptimize = document.querySelectorAll('img[data-src][data-load="false"]')

    imagesToOptimize.forEach((elm) => {
      if (!isMobile() && elm.classList.contains('mobile-only')) return

      if (isInViewport(elm)) {
        elm.setAttribute('src', elm.dataset.src)
        elm.setAttribute('data-load', 'true')
        elm.removeAttribute('data-src')
      }
    })
  }

  lazyLoadImages()

  // Continuously call the function when the user scrolls the page
  window.addEventListener('scroll', () => lazyLoadImages())
  window.addEventListener('resize', () => lazyLoadImages())

  // Handle form reset
  const handleFormClear = (e) => {
    e.preventDefault()

    const target = e.currentTarget.getAttribute('aria-controls')
    const form = document.getElementById(target)

    form.reset()
  }

  $('.button--clear').on('click', (e) => handleFormClear(e))
  $('.button--clear').on('keyup', (e) => handleFormClear(e))

  // Handle SKU selection
  const handleSKUSelection = (e) => {
    e.preventDefault()

    const current = e.target

    if (
      e.button !== 0 &&
      e.button !== 1 &&
      e.key !== 'Enter' &&
      e.key !== ' ' &&
      e.key !== 'Tab' &&
      e.key !== 'ArrowRight' &&
      e.key !== 'ArrowLeft'
    )
      return

    const container = e.target.parentNode
    const previous = container.querySelector('[aria-checked="true"]')

    const availableElm = container.querySelectorAll('button:not([aria-disabled])')
    const minElm = 0
    const maxElm = availableElm.length - 1

    let currentElm

    Array.from(availableElm).filter((item, i) => {
      if (item.getAttribute('aria-checked') === 'true') return (currentElm = i)
    })

    if (previous) previous.setAttribute('aria-checked', 'false')

    if (e.key === 'ArrowRight') {
      const index = currentElm < maxElm ? currentElm + 1 : minElm

      availableElm[index].setAttribute('aria-checked', 'true')
      availableElm[index].focus()

      return
    }

    if (e.key === 'ArrowLeft') {
      const index = currentElm > minElm ? currentElm - 1 : maxElm

      availableElm[index].setAttribute('aria-checked', 'true')
      availableElm[index].focus()

      return
    }

    if (current.getAttribute('aria-disabled') === null) {
      current.setAttribute('aria-checked', 'true')
      current.focus()
    }

    if (!container.querySelector('[aria-checked="true"]')) {
      previous.setAttribute('aria-checked', 'true')
    }
  }

  $(document).on('click', '.summary-item--skuItem', (e) => handleSKUSelection(e))
  $(document).on('keyup', '.summary-item--skuItem', (e) => handleSKUSelection(e))

  $(document).on('click', '.product-quickview--skuItem', (e) => handleSKUSelection(e))
  $(document).on('keyup', '.product-quickview--skuItem', (e) => handleSKUSelection(e))

  // Handle product quick-view
  const mountQuickView = (e) => {
    if (e.button !== 0 && e.button !== 1 && e.key !== 'Enter' && e.key !== ' ') return

    const trigger = e?.currentTarget
    const modal = document.getElementById('product-quickview')

    // Product data
    const scriptElement = trigger.querySelector('script[type="application/ld+json"]')
    const productData = JSON.parse(scriptElement.textContent.trim())

    // Desctructuring of productData
    const {
      productName,
      productId,
      productVariations,
      price,
      listPrice,
      bestInstallment,
      productImages,
      productDetails,
    } = productData

    // Modal fields
    const _elmImages = modal.querySelector('.product-quickview--images')
    const _elmName = modal.querySelector('.product-quickview--nameText')
    const _elmRef = modal.querySelector('.product-quickview--refText')
    const _elmPrice = modal.querySelector('.product-quickview--productPrice')
    const _elmSku = modal.querySelector('.product-quickview--skuList')
    const _elmDescription = modal.querySelector('.product-quickview--descriptionText')

    // Slick settings
    const settings = {
      infinite: true,
      slidesToShow: 3,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            centerMode: true,
            slidesToShow: 3,
          },
        },
        {
          breakpoint: 600,
          settings: {
            centerMode: true,
            slidesToShow: 2,
          },
        },
        {
          breakpoint: 480,
          settings: {
            centerMode: true,
            centerPadding: '30px',
            slidesToShow: 1,
          },
        },
      ],
    }

    // Handle Images
    $(productImages)
      .each((i, item) => {
        let elm = new Image()

        elm.src = item
        elm.alt = `Imagem ${i} do produto ${productName}`
        elm.className = 'product-quickview--imageElement'

        _elmImages.appendChild(elm)
      })
      // Handle slick
      .promise()
      .done(() => {
        setTimeout(() => {
          // Additional check to initialized sliders
          if ($(_elmImages).hasClass('slick-initialized')) $(_elmImages).slick('unslick')

          $(_elmImages)
            .not('.slick-initialized')
            .slick({ ...settings })
        }, 1000)
      })

    // Handle Name
    _elmName.textContent = productName

    // Handle Ref
    _elmRef.textContent = `Ref: #${productId}`

    // Handle Prices
    const _listPrice = _elmPrice.querySelector('.product-quickview--listPrice')
    const _sellingPrice = _elmPrice.querySelector('.product-quickview--sellingPrice')
    const _installments = _elmPrice.querySelector('.product-quickview--installments')

    _listPrice.textContent = listPrice
    _sellingPrice.textContent = price
    _installments.textContent = bestInstallment

    if (String(listPrice).trim() !== '' && listPrice !== null) _sellingPrice.classList.add('hasListPrice')

    // Handle SKU
    let first = null

    $(productVariations).each((i, item) => {
      let elm = document.createElement('button')

      if (item.isAvailable && first === null) {
        elm.setAttribute('aria-checked', 'true')
        first = item
      }

      if (!item.isAvailable) elm.setAttribute('aria-disabled', 'true')

      elm.setAttribute('role', 'radio')
      elm.textContent = item.name
      elm.className = 'product-quickview--skuItem'

      _elmSku.appendChild(elm)
    })

    // Handle Description
    _elmDescription.innerHTML = productDetails
  }

  const unmountQuickView = () => {
    const modal = document.getElementById('product-quickview')

    const _elmImages = modal.querySelector('.product-quickview--images')
    const _elmName = modal.querySelector('.product-quickview--nameText')
    const _elmRef = modal.querySelector('.product-quickview--refText')
    const _elmPrice = modal.querySelector('.product-quickview--productPrice')
    const _elmSku = modal.querySelector('.product-quickview--skuList')
    const _listPrice = _elmPrice.querySelector('.product-quickview--listPrice')
    const _sellingPrice = _elmPrice.querySelector('.product-quickview--sellingPrice')
    const _installments = _elmPrice.querySelector('.product-quickview--installments')
    const _elmDescription = modal.querySelector('.product-quickview--descriptionText')

    $(_elmImages).slick('unslick')

    _elmImages.innerHTML = ''
    _elmName.innerHTML = ''
    _elmRef.innerHTML = ''
    _listPrice.innerHTML = ''
    _sellingPrice.innerHTML = ''
    _installments.innerHTML = ''
    _elmSku.innerHTML = ''
    _elmDescription.innerHTML = ''
  }
}
