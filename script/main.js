document?.addEventListener('DOMContentLoaded', init, false)

const states = new Map()

const useState = (initialValue, context) => {
  const dispatch = (v) => {
    const currentState = states.get(context.callee)
    currentState[0] = typeof v === 'function' ? v(currentState[0]) : v

    context.callee.call(context)
  }
  const current = states.get(context.callee) || [initialValue, dispatch]
  states.set(context.callee, current)
  return current
}

const isMobile = () => {
  var isMobile = false

  if (
    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
      navigator.userAgent
    ) ||
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
      navigator.userAgent.substring(0, 4)
    )
  ) {
    isMobile = true
  }
  return isMobile
}

const { format: formatPrice } = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
})

const createElement = (tag, attributes, children) => {
  const elm = document.createElement(tag)

  for (const key in attributes) {
    if (key === 'className') {
      elm.setAttribute('class', attributes[key])
    } else {
      elm.setAttribute(key, attributes[key])
    }
  }

  if (children) {
    if (typeof children === 'string') {
      elm.textContent = children
    } else if (Array.isArray(children)) {
      children.forEach((child) => {
        if (typeof child === 'string') {
          elm.appendChild(document.createTextNode(child))
        } else {
          elm.appendChild(child)
        }
      })
    } else {
      elm.appendChild(children)
    }
  }

  return elm
}

function init() {
  // Handle overlay opening
  $(document).on('mousedown', '.overlay--button', (e) => handleOverlay(e))
  $(document).on('keyup', '.overlay--button', (e) => handleOverlay(e))

  // Handle overlay close
  $(document).on('mousedown', '.overlay--close', (e) => handleOverlay(e))
  $(document).on('keyup', '.overlay--close', (e) => handleOverlay(e))
  $(document).on('customtrigger', '.overlay--close', (e) => handleOverlay(e))

  const handleOverlay = (e) => {
    e.stopImmediatePropagation()

    if (e.button !== 0 && e.button !== 1 && e.key !== 'Enter' && e.key !== ' ' && e.type !== 'customtrigger') return

    const currentElm = e.currentTarget
    const targetElm = e.target

    const isDesktopFilter = !isMobile() && currentElm.getAttribute('id') === 'filter-button'

    // Prevent default behavior propagation from affecting interaction elements
    if ($(targetElm).hasClass('summary-item--skuItem')) return
    if ($(targetElm).hasClass('addToCart--button')) return

    // Mount quick-view
    if ($(currentElm).hasClass('summary-item--link')) mountQuickView(e)

    const body = document.querySelector('body')
    const targetToOpen = currentElm.getAttribute('aria-controls')

    const overlay = document.getElementById(targetToOpen)

    const overlayState = !overlay.classList.contains('isOpen')

    const overlayBttnElm = e.currentTarget
    const overlayBttnValid = overlayBttnElm.getAttribute('id') && overlayBttnElm.classList.contains('overlay--button')
    const openingBttn = document.getElementById(
      overlayBttnValid ? overlayBttnElm.getAttribute('id') : overlay.getAttribute('aria-controlledby')
    )

    // Assign an id to the targeted overlay when needed
    if (currentElm.getAttribute('data-dynamicId') === 'true') {
      const customId = currentElm.getAttribute('id')
      overlay.setAttribute('aria-controlledby', customId)
    }

    overlay.classList.toggle('isOpen', overlayState)
    overlay.classList.toggle('isClosed', !overlayState)
    if (!isDesktopFilter) body.classList.toggle('noscroll', overlayState)

    openingBttn?.setAttribute('aria-expanded', overlayState)
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

    if (!overlay) return
    if (e.button !== 0 && e.button !== 1 && e.key !== 'Escape') return

    if (overlay.id === 'product-quickview') unmountQuickView()

    if (overlay && overlay?.getAttribute('aria-hidden') === 'false') {
      const body = document.querySelector('body')
      const openingBttn = document.getElementById(overlay.getAttribute('aria-controlledby'))

      overlay.setAttribute('aria-hidden', 'true')
      overlay.classList.remove('isOpen')
      overlay.classList.add('isClosed')
      body.classList.toggle('noscroll', false)
      openingBttn.setAttribute('aria-expanded', 'false')
      openingBttn.focus()

      // Removed assigned id to targeted overlay
      if (openingBttn.getAttribute('data-dynamicId') === 'true') {
        overlay.removeAttribute('aria-controlledby')
      }
    }
  }

  window.addEventListener('keydown', (e) => closeTopMostOverlay(e))

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

    if (e.button !== 0 && e.button !== 1 && e.key !== 'Enter' && e.key !== ' ') return

    const target = e.currentTarget.getAttribute('aria-controls')
    const form = document.getElementById(target)

    form.reset()
  }

  $('.button--clear').on('mousedown', (e) => handleFormClear(e))
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

    const availableElm = container.querySelectorAll('button:not([aria-disabled="true"])')
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

    if (current.getAttribute('aria-disabled') === null || current.getAttribute('aria-disabled') === 'false') {
      current.setAttribute('aria-checked', 'true')
      current.focus()
    }

    if (!container.querySelector('[aria-checked="true"]')) {
      previous?.setAttribute('aria-checked', 'true')
    }
  }

  $(document).on('mousedown', '.summary-item--skuItem', (e) => handleSKUSelection(e))
  $(document).on('keyup', '.summary-item--skuItem', (e) => handleSKUSelection(e))

  $(document).on('mousedown', '.product-quickview--skuItem', (e) => handleSKUSelection(e))
  $(document).on('keyup', '.product-quickview--skuItem', (e) => handleSKUSelection(e))

  // Handle modal focus trapping
  const handleModalFocus = (e, focusableElms) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === focusableElms?.first) {
          focusableElms?.last.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === focusableElms?.last) {
          focusableElms?.first.focus()
          e.preventDefault()
        }
      }
    }
  }

  // Reference to the function for trapping the modal focus
  let trapModalRef = null

  // Handle product quick-view
  const mountQuickView = (e) => {
    console.info('MOUNTED QUICKVIEW')

    if (e.button !== 0 && e.button !== 1 && e.key !== 'Enter' && e.key !== ' ') return

    const trigger = e?.currentTarget
    const modal = document.getElementById('product-quickview')

    // Gather focusable elements inside the modal
    var focusableElms = modal.querySelectorAll(
      'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])'
    )

    var firstModalFocus = focusableElms[0]
    var lastModalFocus = focusableElms[focusableElms.length - 1]

    modal.addEventListener(
      'keydown',
      (trapModalRef = (e) => handleModalFocus(e, { first: firstModalFocus, last: lastModalFocus }))
    )

    // Get current addToCart text
    const addToCartText = trigger.querySelector('.summary-item--addToCartText')?.textContent

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
    const _elmScript = modal.querySelector('script[type="application/ld+json"]')
    const _elmImages = modal.querySelector('.product-quickview--images')
    const _elmName = modal.querySelector('.product-quickview--nameText')
    const _elmRef = modal.querySelector('.product-quickview--refText')
    const _elmPrice = modal.querySelector('.product-quickview--productPrice')
    const _elmSku = modal.querySelector('.product-quickview--skuList')
    const _elmDescription = modal.querySelector('.product-quickview--descriptionText')
    const _elmAddToCart = modal.querySelector('.addToCart--button')
    const _elmAddToCartText = _elmAddToCart.querySelector('.buttonText')

    const prodImageQty = productImages.length
    const prodImageMaxQty = isMobile() ? 1 : 3

    // Slick settings
    const settings = {
      infinite: true,
      slidesToShow: 3,
      swipeToSlide: true,
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

    // Set a copy of the JSON data
    _elmScript.textContent = JSON.stringify(productData)

    // Handle Images
    $(productImages)
      .each((i, item) => {
        let elm = new Image()

        elm.src = item
        elm.alt = `Imagem ${i + 1} do produto ${productName}`
        elm.className = 'product-quickview--imageElement'

        _elmImages.appendChild(elm)
      })
      // Handle slick
      .promise()
      .done(() => {
        setTimeout(() => {
          // Additional check to initialized sliders
          if ($(_elmImages).hasClass('slick-initialized')) {
            $(_elmImages).slick('unslick')
          }

          if (prodImageQty > prodImageMaxQty) {
            $(_elmImages)
              .not('.slick-initialized')
              .slick({ ...settings })
          }

          firstModalFocus.focus()
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

    _sellingPrice.textContent = formatPrice(price)
    _installments.textContent = bestInstallment

    if (String(listPrice).trim() !== '' && listPrice !== null) {
      _listPrice.textContent = formatPrice(listPrice)
      _sellingPrice.classList.add('hasListPrice')
    }

    // Add Label
    let label = document.createElement('label')

    label.textContent = 'Tamanho:'
    label.className = 'product-quickview--skuLabel'

    _elmSku.appendChild(label)

    const firstAvailableSKU = productVariations.find((item) => !!item.isAvailable)

    productVariations.forEach((item) => {
      let elm = document.createElement('button')

      if (item.isAvailable && item.name === firstAvailableSKU?.name) {
        elm.setAttribute('aria-checked', 'true')
      }

      if (!item.isAvailable) elm.setAttribute('aria-disabled', 'true')

      elm.setAttribute('role', 'radio')
      elm.textContent = item.name
      elm.className = 'product-quickview--skuItem'

      if (!firstAvailableSKU) {
        _elmAddToCart.setAttribute('aria-disabled', 'true')
      } else {
        _elmAddToCart.setAttribute('aria-disabled', 'false')
      }

      _elmAddToCartText.textContent = addToCartText

      _elmSku.appendChild(elm)
    })

    // Reset scroll
    setTimeout(() => _elmImages.scrollIntoView({ behavior: 'instant', block: 'center' }), 100)

    function decodeHTMLEntities(text) {
      const parser = new DOMParser()
      const fragment = parser.parseFromString(text, 'text/html')

      return fragment.documentElement.textContent
    }

    // Handle Description
    _elmDescription.innerHTML = decodeHTMLEntities(productDetails)
  }

  const unmountQuickView = () => {
    console.info('UNMOUNTED QUICKVIEW')
    const modal = document.getElementById('product-quickview')

    modal.removeEventListener('keydown', trapModalRef)

    const _elmScript = modal.querySelector('script[type="application/ld+json"]')
    const _elmImages = modal.querySelector('.product-quickview--images')
    const _elmName = modal.querySelector('.product-quickview--nameText')
    const _elmRef = modal.querySelector('.product-quickview--refText')
    const _elmPrice = modal.querySelector('.product-quickview--productPrice')
    const _elmSku = modal.querySelector('.product-quickview--skuList')
    const _listPrice = _elmPrice.querySelector('.product-quickview--listPrice')
    const _sellingPrice = _elmPrice.querySelector('.product-quickview--sellingPrice')
    const _installments = _elmPrice.querySelector('.product-quickview--installments')
    const _elmDescription = modal.querySelector('.product-quickview--descriptionText')

    if ($(_elmImages).hasClass('slick-initialized')) $(_elmImages).slick('unslick')

    _elmScript.innerHTML = ''
    _elmImages.innerHTML = ''
    _elmName.innerHTML = ''
    _elmRef.innerHTML = ''
    _listPrice.innerHTML = ''
    _sellingPrice.innerHTML = ''
    _installments.innerHTML = ''
    _elmSku.innerHTML = ''
    _elmDescription.innerHTML = ''
  }

  // Handle cart process
  const handleCartState = (e) => {
    if (e.button !== 0 && e.button !== 1 && e.key !== 'Enter' && e.key !== ' ') return

    const target = e.currentTarget

    if ($(target).attr('aria-disabled') === 'true') return

    const selectedQuantity = $(target).hasClass('cart-summary--removeButton') ? 0 : 1

    const id = target.getAttribute('aria-controls')
    const trigger = document.getElementById(id)

    const productId = target.getAttribute('product')
    const selectedVariation = trigger?.querySelector('button[aria-checked="true"]')?.textContent
    const selectedVariationAlt = target.getAttribute('variation')
    const selectedItem = String(selectedVariation ?? selectedVariationAlt).trim()

    const scriptElement = trigger?.querySelector('script[type="application/ld+json"]')
    const productData = scriptElement ? JSON.parse(scriptElement?.textContent.trim()) : { productId }

    if (selectedItem) handleCartItems([{ ...productData, selectedItem, selectedQuantity }])
    if (id === 'product-quickview') $('#close-quickview').trigger('customtrigger')
  }

  const handleCartItems = (items) => {
    let loop = 0

    document.dispatchEvent(new Event('OPEN_MINICART', { bubbles: true, cancelable: true }))

    items?.forEach((item) => {
      cartState(item)

      loop++
      if (loop === items.length) {
        console.info('MOUNTING MINICART!')
        mountCart()
        if (!item.selectedQuantity) removeItemFromCart(item)
      }
    })
  }

  const cartState = (item) => {
    let state = JSON.parse(localStorage.getItem('puket-minicartState')) ?? {}

    if (!state.hasOwnProperty('items')) state = { ...state, items: [] }
    if (!state.hasOwnProperty('totalizers')) state = { ...state, totalizers: 0 }

    if (item) {
      const isIdentical = state.items.findIndex((storedItem) => {
        return storedItem.productId === item.productId && storedItem.selectedItem === item.selectedItem
      })

      const itemExists = isIdentical !== -1
      const itemIncrement = item.selectedQuantity > 0

      if (itemExists && !itemIncrement) {
        console.info('REMOVED ITEM >', item)
        state.items.splice(isIdentical, 1)
        // Removes DOM element
        removeItemFromCart(item)
      } else if (!itemExists && itemIncrement) {
        console.info('ADDED NEW ITEM >', item)
        state.items.push(item)
      } else if (itemIncrement) {
        console.info('UPDATED ITEM >', item)
        let prev = state.items[isIdentical]
        state.items[isIdentical] = { ...prev, ...item, selectedQuantity: item.selectedQuantity }
      }

      state.totalizers = state.items.reduce(
        (acc, item) => acc + (item.selectedQuantity ?? 1) * parseFloat(item.price ?? 0),
        0
      )
    }

    localStorage.setItem('puket-minicartState', JSON.stringify(state))

    return state
  }

  const mountCart = () => {
    const state = cartState()
    const cartContainer = document.querySelector('#cart-drawer .cart-drawer--items')
    const cartBadge = document.querySelector('#cart-button .cart--badge > .cart--counter')

    const itemsCount = state.items.length

    const totalizers = document.querySelector('#cart-drawer .cart-drawer--totalizers')
    const totalizersCount = totalizers.querySelector('.totalizers--itemCount')
    const totalizersValue = totalizers.querySelector('.totalizers--totalValue')

    const noItemsMessage = cartContainer.querySelector('.cart-drawer--noItems')

    cartBadge.textContent = itemsCount
    totalizersCount.textContent = `${itemsCount} ${itemsCount === 1 ? 'item' : 'itens'}`
    totalizersValue.textContent = formatPrice(state.totalizers)

    if (!itemsCount) noItemsMessage.style.display = 'block'
    else noItemsMessage.style.display = 'none'

    state.items.forEach((item) => {
      const selectedId = String(item?.productId).trim()
      const selectedVariation = String(item?.selectedItem).trim()
      const selectedQuantity = item?.selectedQuantity ?? 1
      const itemPrice = item?.price ?? 0
      const itemPriceTotal = itemPrice * selectedQuantity

      // Check for existing items
      const existingItem = cartContainer.querySelector(
        `.cart-summary--item[id="${item.productId}"][variation="${selectedVariation}"]`
      )

      if (existingItem) {
        existingItem.querySelector('.cart-summary--sellingPrice').textContent = formatPrice(itemPriceTotal)
        existingItem.querySelector('.cart-summary--input').setAttribute('value', item?.selectedQuantity)

        return
      }

      // Create basic structure
      const _cartItem = document.createElement('div')
      _cartItem.classList.add('cart-summary--item')

      const _image = document.createElement('div')
      _image.classList.add('cart-summary--image')
      _cartItem.appendChild(_image)

      const _info = document.createElement('div')
      _info.classList.add('cart-summary--info')
      _cartItem.appendChild(_info)

      const _line1 = document.createElement('div')
      _line1.classList.add('cart-summary--line')
      _info.appendChild(_line1)

      const _name = document.createElement('div')
      _name.classList.add('cart-summary--name')
      _line1.appendChild(_name)

      const _removeBttn = document.createElement('div')
      _removeBttn.classList.add('cart-summary--remove')
      _line1.appendChild(_removeBttn)

      const _line2 = document.createElement('div')
      _line2.classList.add('cart-summary--line')
      _info.appendChild(_line2)

      const _sku = document.createElement('div')
      _sku.classList.add('cart-summary--sku')
      _line2.appendChild(_sku)

      const _line3 = document.createElement('div')
      _line3.classList.add('cart-summary--line')
      _info.appendChild(_line3)

      const _qty = document.createElement('div')
      _qty.classList.add('cart-summary--qty')
      _line3.appendChild(_qty)

      const _price = document.createElement('div')
      _price.classList.add('cart-summary--price')
      _line3.appendChild(_price)

      // Feed with product data
      // Product Item ID
      _cartItem.setAttribute('id', selectedId)
      _cartItem.setAttribute('variation', selectedVariation)

      // Product Image
      const prodImage = new Image()
      prodImage.src = item.productImages?.[0]
      prodImage.alt = item.productName
      prodImage.ariaHidden = 'true'
      _image.appendChild(prodImage)

      // Product Name
      const prodText = document.createElement('h3')
      prodText.classList.add('cart-summary--nameText')
      prodText.textContent = item.productName
      _name.appendChild(prodText)

      // Button to remove product
      const prodRemove = document.createElement('button')
      prodRemove.classList.add('cart-summary--removeButton')
      prodRemove.setAttribute('product', selectedId)
      prodRemove.setAttribute('variation', selectedVariation)
      _removeBttn.appendChild(prodRemove)

      const prodRemoveText = document.createElement('span')
      prodRemoveText.classList.add('only-sr')
      prodRemoveText.textContent = `Remover ${selectedId} da Sacola`
      prodRemove.appendChild(prodRemoveText)

      const prodRemoveSymbol = document.createElement('span')
      prodRemoveSymbol.setAttribute('aria-hidden', true)
      prodRemoveSymbol.innerHTML = '&times;'
      prodRemove.appendChild(prodRemoveSymbol)

      // Selected SKU
      const prodSKU = document.createElement('span')
      prodSKU.classList.add('cart-summary--skuText')
      prodSKU.textContent = `Tamanho: ${selectedVariation}`
      _sku.appendChild(prodSKU)

      // Quantity selector
      const prodQty = document.createElement('div')
      prodQty.classList.add('cart-summary--qtyGroup')
      _qty.appendChild(prodQty)

      const prodQtyMinus = document.createElement('button')
      prodQtyMinus.classList.add('cart-summary--buttonMinus')
      prodQtyMinus.classList.add('cart-summary--quantitySelector')
      prodQtyMinus.setAttribute('aria-label', 'Diminuir Quantidade')
      prodQtyMinus.textContent = '-'
      prodQty.appendChild(prodQtyMinus)

      const prodInput = document.createElement('input')
      prodInput.classList.add('cart-summary--input')
      prodInput.setAttribute('type', 'number')
      prodInput.setAttribute('value', item.selectedQuantity)
      prodInput.setAttribute('readonly', 'true')
      prodQty.appendChild(prodInput)

      const prodQtyMore = document.createElement('button')
      prodQtyMore.classList.add('cart-summary--buttonPlus')
      prodQtyMore.classList.add('cart-summary--quantitySelector')
      prodQtyMore.setAttribute('aria-label', 'Aumentar Quantidade')
      prodQtyMore.textContent = '+'
      prodQty.appendChild(prodQtyMore)

      // Product Price
      const prodPrice = document.createElement('div')
      prodPrice.classList.add('cart-summary--sellingPrice')
      prodPrice.textContent = formatPrice(itemPriceTotal)
      _price.appendChild(prodPrice)

      // Create an entry on the minicart
      cartContainer.appendChild(_cartItem)
    })
  }

  // Calls initial cart mount
  setTimeout(() => {
    if (document.querySelector('#cart-drawer .cart-drawer--items')) mountCart()
  }, 500)

  const removeItemFromCart = (item) => {
    const { productId, selectedItem } = item
    const selectedVariation = String(selectedItem).trim()
    const target = document.querySelector(`.cart-summary--item[id="${productId}"][variation="${selectedVariation}"]`)

    if (target) target.remove()
  }

  $(document).on('mousedown', '.addToCart--button', (e) => handleCartState(e))
  $(document).on('keydown', '.addToCart--button', (e) => handleCartState(e))

  $(document).on('mousedown', '.cart-summary--removeButton', (e) => handleCartState(e))
  $(document).on('keydown', '.cart-summary--removeButton', (e) => handleCartState(e))

  // Handle Whatsapp interaction
  const sendToWhatsapp = (e) => {
    if (e.button !== 0 && e.button !== 1 && e.key !== 'Enter' && e.key !== ' ') return

    const number = e.currentTarget.getAttribute('data-whatsapp')
    const products = cartState()

    let message = ''

    products.items.forEach((item) => {
      message += `${item.selectedQuantity}x%20`
      message += `(${item.productId})%20`
      message += `${item.productName}%20-%20`
      message += `${item.selectedItem}%20`
      message += `${item.price}%0a`
    })

    message += `%0aTotal: ${formatPrice(products.totalizers)}`

    window.open(`https://api.whatsapp.com/send/?phone=${number}&text=${message}`)
  }

  $('.sendToWhatsapp--button').on('mousedown', (e) => sendToWhatsapp(e))
  $('.sendToWhatsapp--button').on('keyup', (e) => sendToWhatsapp(e))

  // Handle Event to open minicart
  document.addEventListener('OPEN_MINICART', () => {
    const body = document.querySelector('body')
    const overlay = document.getElementById('cart-drawer')

    const overlayState = !overlay.classList.contains('isOpen')
    const openingBttn = document.getElementById(overlay.getAttribute('aria-controlledby'))

    if (!overlayState) return

    overlay.classList.toggle('isOpen', true)
    body.classList.toggle('noscroll', true)

    openingBttn.setAttribute('aria-expanded', true)
    overlay.setAttribute('aria-hidden', false)

    // Focus Overlay
    overlay.focus()
  })

  // Handle quantity selector on minicart
  const handleQuantity = (e) => {
    if (e.button !== 0 && e.button !== 1 && e.key !== 'Enter' && e.key !== ' ') return

    e.preventDefault()
    e.stopImmediatePropagation()

    const target = e.currentTarget
    const container = target.closest('.cart-summary--item')
    const input = container.querySelector('input.cart-summary--input')

    const productId = container.getAttribute('id')
    const selectedItem = container.getAttribute('variation')
    const mode = $(target).hasClass('cart-summary--buttonMinus') ? 'MINUS' : 'PLUS'
    const value = Number(input.value)

    const selectedQuantity = mode == 'MINUS' ? value - 1 : value + 1

    handleCartItems([{ productId, selectedItem, selectedQuantity }])
  }

  $(document).on('mousedown', '.cart-summary--quantitySelector', (e) => handleQuantity(e))
  $(document).on('keydown', '.cart-summary--quantitySelector', (e) => handleQuantity(e))
}

document.addEventListener('includeHTMLLoaded', init, false)
