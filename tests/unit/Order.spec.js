import { expect } from "chai"
import { createLocalVue, shallowMount } from "@vue/test-utils"
import fetch from "node-fetch"
import Vuex from "vuex"
import Order from "@/components/Order.vue"

const localVue = createLocalVue()
localVue.use(Vuex)

describe("Order.vue", () => {
  describe("Getters", () => {
    describe("subtotal", () => {
      it("should correctly calculate the subtotal of the table items", () => {
        const store = new Vuex.Store({ state: {} })
        const wrapper = shallowMount(Order, { localVue, store })
        wrapper.setData({
          tableItems: [
            { id: "wf", name: "Workflow", price: 199.99, quantity: 2 },
            { id: "form", name: "Form", price: 99.99, quantity: 1 }
          ]
        })
        expect(wrapper.vm.subtotal).to.equal("$499.97")
      })
    })
  })

  describe("Methods", () => {
    describe("getDiscount", () => {
      it("should set the correct promo error if the promo code is an empty string", () => {
        const store = new Vuex.Store({ state: {} })
        const wrapper = shallowMount(Order, { localVue, store })
        wrapper.setData({ promoCode: "" })
        wrapper.vm.getDiscount()

        expect(wrapper.vm.promoError).to.be.true
        expect(wrapper.vm.promoRules).to.include("Please enter a promo code.")
      })
    })

    describe("discardDiscount", () => {
      it("should reset certain properties to their initial values", () => {
        const store = new Vuex.Store({
          state: {
            orderItems: [
              { id: "wf", name: "Workflow", price: 199.99, quantity: 2 },
              { id: "form", name: "Form", price: 99.99, quantity: 2 }
            ]
          }
        })

        const wrapper = shallowMount(Order, { localVue, store })
        wrapper.setData({
          tableItems: [
            { id: "wf", name: "Workflow", price: 199.99, quantity: 2 },
            { id: "form", name: "Form", price: 99.99, quantity: 2 }
          ]
        })
        wrapper.vm.discardDiscount()

        expect(wrapper.vm.isItemDiscountApplied).to.be.false
        expect(wrapper.vm.isPercentageDiscountApplied).to.be.false
        expect(wrapper.vm.tableItems).to.eql(wrapper.vm.orderItems)
        expect(wrapper.vm.discountMessage).to.be.null
        expect(wrapper.vm.savings).to.be.null
        expect(wrapper.vm.discountedTotal).to.be.null
        expect(wrapper.vm.promoCode).to.be.null
        expect(wrapper.vm.promoError).to.be.false
        expect(wrapper.vm.promoRules).to.eql([])
      })
    })
  })

  describe("API: /promo", () => {
    const API_URL = "http://localhost:8080/promo"

    it("should return success === false & correct message if the promo code is invalid", async () => {
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          promoCode: "abcdef",
          orderItems: []
        })
      }

      await fetch(API_URL, options)
        .then(res => res.json())
        .then(data => {
          expect(data.success).to.be.false
          expect(data.message).to.equal("Invalid promo code.")
        })
    })

    describe("Test each promo code", () => {
      describe("RRD4D32", () => {
        it("should return success === false & correct message if order amount <= $1,000.00", async () => {
          const options = {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              promoCode: "RRD4D32",
              orderItems: [
                {
                  id: "docgen",
                  name: "Document Generation",
                  price: 9.99,
                  quantity: 2
                }
              ]
            })
          }

          await fetch(API_URL, options)
            .then(res => res.json())
            .then(res => {
              expect(res.success).to.be.false
              expect(res.message).to.equal(
                "Order amount must be above $1,000.00 to be eligible for 10% discount."
              )
            })
        })

        it("should return success === true & correct data if order amount > $1,000.00", async () => {
          const store = new Vuex.Store({ state: {} })
          const wrapper = shallowMount(Order, { localVue, store })

          const options = {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              promoCode: "RRD4D32",
              orderItems: [
                { id: "wf", name: "Workflow", price: 199.99, quantity: 6 }
              ]
            })
          }

          await fetch(API_URL, options)
            .then(res => res.json())
            .then(res => {
              expect(res.success).to.be.true
              expect(res.data.total).to.equal(1199.94)
              expect(res.data.rule).to.equal("PERCENTAGE")
              expect(res.data.savings).to.equal(119.99)

              wrapper.vm.applyPercentageDiscount(res.data)
              expect(wrapper.vm.isPercentageDiscountApplied).to.be.true
              expect(wrapper.vm.discountMessage).to.equal(
                "Discount from promo code (10%)"
              )
              expect(wrapper.vm.discountedTotal).to.equal("$1,079.95")
            })
        })
      })

      describe("44F4T11", () => {
        it("should return success === false & correct message if order amount <= $1,500.00", async () => {
          const options = {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              promoCode: "44F4T11",
              orderItems: [
                {
                  id: "docgen",
                  name: "Document Generation",
                  price: 9.99,
                  quantity: 2
                }
              ]
            })
          }

          await fetch(API_URL, options)
            .then(res => res.json())
            .then(res => {
              expect(res.success).to.be.false
              expect(res.message).to.equal(
                "Order amount must be above $1,500.00 to be eligible for 15% discount."
              )
            })
        })

        it("should return success === true & correct data if order amount > $1,500.00", async () => {
          const store = new Vuex.Store({ state: {} })
          const wrapper = shallowMount(Order, { localVue, store })

          const options = {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              promoCode: "44F4T11",
              orderItems: [
                { id: "wf", name: "Workflow", price: 199.99, quantity: 8 }
              ]
            })
          }

          await fetch(API_URL, options)
            .then(res => res.json())
            .then(res => {
              expect(res.success).to.be.true
              expect(res.data.total).to.equal(1599.92)
              expect(res.data.rule).to.equal("PERCENTAGE")
              expect(res.data.savings).to.equal(239.99)

              wrapper.vm.applyPercentageDiscount(res.data)
              expect(wrapper.vm.isPercentageDiscountApplied).to.be.true
              expect(wrapper.vm.discountMessage).to.equal(
                "Discount from promo code (15%)"
              )
              expect(wrapper.vm.discountedTotal).to.equal("$1,359.93")
            })
        })
      })

      describe("FF9543D1", () => {
        it("should return success === false & correct message if discounted product is not in the order", async () => {
          const options = {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              promoCode: "FF9543D1",
              orderItems: [
                {
                  id: "form",
                  name: "Form",
                  price: 99.99,
                  quantity: 2
                }
              ]
            })
          }

          await fetch(API_URL, options)
            .then(res => res.json())
            .then(res => {
              expect(res.success).to.be.false
              expect(res.message).to.equal(
                "Discounted product (Document Generation) is not in the order."
              )
            })
        })

        it("should return success === false & correct message if the units of the mandatory product is less than required", async () => {
          const options = {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              promoCode: "FF9543D1",
              orderItems: [
                {
                  id: "docgen",
                  name: "Document Generation",
                  price: 9.99,
                  quantity: 2
                }
              ]
            })
          }

          await fetch(API_URL, options)
            .then(res => res.json())
            .then(res => {
              expect(res.success).to.be.false
              expect(res.message).to.equal(
                "10 unit(s) of Document Generation must be purchased to be eligible for discount."
              )
            })
        })

        it("should return success === true & correct data if all conditions are satisfied", async () => {
          const store = new Vuex.Store({
            state: {
              products: [
                { id: "docgen", name: "Document Generation", price: 9.99 }
              ]
            }
          })
          const wrapper = shallowMount(Order, { localVue, store })

          const options = {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              promoCode: "FF9543D1",
              orderItems: [
                {
                  id: "docgen",
                  name: "Document Generation",
                  price: 9.99,
                  quantity: 10
                }
              ]
            })
          }

          await fetch(API_URL, options)
            .then(res => res.json())
            .then(res => {
              expect(res.success).to.be.true
              expect(res.data.rule).to.equal("ITEM")
              expect(res.data.savings).to.equal(10)

              wrapper.vm.applyItemDiscount(res.data)
              expect(wrapper.vm.isItemDiscountApplied).to.be.true
              expect(wrapper.vm.discountMessage).to.equal(
                "Savings from promo code: Document Generation price reduced from $9.99 to $8.99"
              )
            })
        })
      })

      describe("YYGWKJD", () => {
        it("should return success === false & correct message if discounted product is not in the order", async () => {
          const options = {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              promoCode: "YYGWKJD",
              orderItems: [
                { id: "wf", name: "Workflow", price: 199.99, quantity: 2 }
              ]
            })
          }

          await fetch(API_URL, options)
            .then(res => res.json())
            .then(res => {
              expect(res.success).to.be.false
              expect(res.message).to.equal(
                "Discounted product (Form) is not in the order."
              )
            })
        })

        it("should return success === true & correct data if all conditions are satisfied", async () => {
          const store = new Vuex.Store({
            state: {
              products: [{ id: "form", name: "Form", price: 99.99 }]
            }
          })
          const wrapper = shallowMount(Order, { localVue, store })

          const options = {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              promoCode: "YYGWKJD",
              orderItems: [
                { id: "wf", name: "Workflow", price: 199.99, quantity: 2 },
                { id: "form", name: "Form", price: 99.99, quantity: 2 }
              ]
            })
          }

          await fetch(API_URL, options)
            .then(res => res.json())
            .then(res => {
              expect(res.success).to.be.true
              expect(res.data.rule).to.equal("ITEM")
              expect(res.data.savings).to.equal(20)

              wrapper.vm.applyItemDiscount(res.data)
              expect(wrapper.vm.isItemDiscountApplied).to.be.true
              expect(wrapper.vm.discountMessage).to.equal(
                "Savings from promo code: Form price reduced from $99.99 to $89.99"
              )
            })
        })
      })
    })
  })
})
