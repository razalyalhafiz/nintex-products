import { expect } from "chai"
import { createLocalVue } from "@vue/test-utils"
import Vuex from "vuex"
import fetch from "node-fetch"
import store from "@/store"

const localVue = createLocalVue()
localVue.use(Vuex)

describe("store.js", () => {
  beforeEach(
    "Set the default order items",
    () =>
      (store.state.orderItems = [
        { id: "wf", name: "Workflow", price: 199.99, quantity: 2 },
        { id: "form", name: "Form", price: 99.99, quantity: 1 }
      ])
  )

  describe("getters", () => {
    describe("subtotal", () => {
      it("should correctly calculate the subtotal of the order items", () => {
        expect(store.getters.subtotal).to.equal("$499.97")
      })
    })
  })

  describe("mutations", () => {
    describe("ADD_ITEM", () => {
      it("should add the item if it is not in the order", () => {
        let item = { id: "docgen", name: "Document Generation", price: 9.99 }
        expect(store.state.orderItems.length).to.equal(2)
        store.commit("ADD_ITEM", item)
        expect(store.state.orderItems.length).to.equal(3)
        expect(store.state.orderItems[2]).to.have.property("quantity")
      })

      it("should increment the item's quantity if it is in the order", () => {
        let item = { id: "form", name: "Form", price: 99.99 }
        expect(store.state.orderItems.length).to.equal(2)
        expect(store.state.orderItems[1]).to.have.property("quantity", 1)
        store.commit("ADD_ITEM", item)
        expect(store.state.orderItems.length).to.equal(2)
        expect(store.state.orderItems[1]).to.have.property("quantity", 2)
      })
    })

    describe("REMOVE_ITEM", () => {
      it("should remove the item if quantity === 1 unit", () => {
        let item = { id: "form", name: "Form", price: 99.99 }
        expect(store.state.orderItems.length).to.equal(2)
        store.commit("REMOVE_ITEM", item)
        expect(store.state.orderItems.length).to.equal(1)
      })

      it("should decrement the item if quantity > 1 unit", () => {
        let item = { id: "wf", name: "Workflow", price: 199.99 }
        expect(store.state.orderItems[0]).to.have.property("quantity", 2)
        store.commit("REMOVE_ITEM", item)
        expect(store.state.orderItems[0]).to.have.property("quantity", 1)
      })
    })

    describe("GET_PRODUCTS", () => {
      it("should fetch the products", async () => {
        const API_URL = "http://localhost:8080/products"
        const products = [
          { id: "docgen", name: "Document Generation", price: 9.99 },
          { id: "form", name: "Form", price: 99.99 },
          { id: "wf", name: "Workflow", price: 199.99 }
        ]

        await fetch(API_URL)
          .then(res => res.json())
          .then(res => {
            expect(res).to.eql(products)
          })
      })
    })
  })
})
