import currency from "currency.js"

export default {
  methods: {
    getFormattedPrice(price) {
      return currency(price, { formatWithSymbol: true }).format()
    },
    getItemSubtotal(items = [], product) {
      let item = items.find(item => item.id === product.id)
      let itemSubtotal = item
        ? currency(item.price).multiply(item.quantity)
        : currency(0)
      return this.getFormattedPrice(itemSubtotal)
    }
  }
}
