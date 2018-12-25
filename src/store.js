import Vue from "vue"
import Vuex from "vuex"
import currency from "currency.js"

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    products: [],
    orderItems: []
  },
  getters: {
    subtotal: state => {
      let total = 0
      if (state.orderItems.length > 0) {
        state.orderItems.forEach(item => {
          total = currency(item.price)
            .multiply(item.quantity)
            .add(total)
        })
      }
      return currency(total, { formatWithSymbol: true }).format()
    }
  },
  mutations: {
    ADD_ITEM(state, product) {
      let item = state.orderItems.find(item => item.id === product.id)
      if (!item) {
        item = Object.assign({}, product)
        item.quantity = 1
        state.orderItems.push(item)
      } else {
        item.quantity++
      }
    },
    REMOVE_ITEM(state, product) {
      let item = state.orderItems.find(item => item.id === product.id)
      if (item) {
        if (item.quantity === 1) {
          let index = state.orderItems.findIndex(item => {
            return item.id === item.id
          })
          state.orderItems.splice(index, 1)
        } else {
          item.quantity--
        }
      }
    },
    REMOVE_ALL_ITEMS(state) {
      state.orderItems = []
    }
  },
  actions: {
    GET_PRODUCTS(context) {
      const endpoint = `${location.origin}/products`
      fetch(endpoint)
        .then(res => res.json())
        .then(res => (context.state.products = res))
        .catch(error => console.log(error.message))
    }
  }
})
