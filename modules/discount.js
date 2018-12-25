import currency from "currency.js"

class Discount {
  constructor(rule, items) {
    this.rule = rule
    this.items = items
  }
}

class ItemDiscount extends Discount {
  constructor(items, discountedProductId, discountedPrice) {
    super("ITEM", items)
    this.discountedProductId = discountedProductId
    this.discountedPrice = discountedPrice

    this.calculateSavings()
    this.updateProductPrice()
  }

  calculateSavings() {
    let item = this.items.find(item => item.id === this.discountedProductId)
    if (item) {
      let diff = currency(item.price).subtract(this.discountedPrice)
      this.savings = currency(diff).multiply(item.quantity)
    }
  }

  updateProductPrice() {
    this.items.forEach(item => {
      if (item.id === this.discountedProductId)
        item.price = this.discountedPrice
    })
  }
}

class PercentageDiscount extends Discount {
  constructor(items, percentage, total) {
    super("PERCENTAGE", items)
    this.percentage = percentage
    this.total = total

    this.calculateSavings()
  }

  calculateSavings() {
    this.savings = currency(this.total)
      .multiply(this.percentage)
      .divide(100)
  }
}

export { ItemDiscount, PercentageDiscount }
