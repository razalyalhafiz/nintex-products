import currency from "currency.js"
import PRODUCTS from "./products.js"
import { ItemDiscount, PercentageDiscount } from "./discount.js"

function applyItemDiscount(
  response,
  items,
  discountedProductId,
  discountedPrice,
  mandatoryProductId,
  minQuantity
) {
  let discountedProduct = items.find(item => item.id === discountedProductId)
  let mandatoryProduct = items.find(item => item.id === mandatoryProductId)

  if (!discountedProduct) {
    let product = PRODUCTS.find(item => item.id === discountedProductId)
    response.success = false
    response.message = `Discounted product (${
      product.name
    }) is not in the order.`
  } else if (
    !mandatoryProduct ||
    (mandatoryProduct && mandatoryProduct.quantity < minQuantity)
  ) {
    let product = PRODUCTS.find(item => item.id === mandatoryProductId)
    response.success = false
    response.message = `${minQuantity} unit(s) of ${
      product.name
    } must be purchased to be eligible for discount.`
  } else if (mandatoryProduct && mandatoryProduct.quantity >= minQuantity) {
    response.success = true
    response.data = new ItemDiscount(
      items,
      discountedProductId,
      discountedPrice
    )
  }

  return response
}

function applyPercentageDiscount(response, items, percentage, minAmount) {
  let min = currency(minAmount).value
  let total = getTotal(items)

  if (total > min) {
    response.success = true
    response.data = new PercentageDiscount(items, percentage, total)
  } else {
    response.success = false
    response.message = `Order amount must be above ${getFormattedPrice(
      min
    )} to be eligible for ${percentage}% discount.`
  }

  return response
}

function getFormattedPrice(price) {
  return currency(price, { formatWithSymbol: true }).format()
}

function getTotal(items = []) {
  let total = 0
  if (items.length > 0) {
    items.forEach(item => {
      total = currency(item.price)
        .multiply(item.quantity)
        .add(total)
    })
  }

  return currency(total).value
}

export function getDiscount(promoCode, orderItems) {
  let response = {}

  switch (promoCode) {
    case "RRD4D32":
      response = applyPercentageDiscount(response, orderItems, 10, 1000.0)
      break

    case "44F4T11":
      response = applyPercentageDiscount(response, orderItems, 15, 1500.0)
      break

    case "FF9543D1":
      response = applyItemDiscount(
        response,
        orderItems,
        "docgen",
        8.99,
        "docgen",
        10
      )
      break

    case "YYGWKJD":
      response = applyItemDiscount(response, orderItems, "form", 89.99, "wf", 1)
      break

    default:
      response.success = false
      response.message = "Invalid promo code."
      break
  }

  return response
}
