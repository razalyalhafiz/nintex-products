<template>
  <v-form ref="form" v-model="valid">
    <v-container grid-list-md fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <v-card>
            <v-data-table
              :headers="tableHeaders"
              :items="tableItems"
              class="px-3 elevation-1"
              hide-actions
            >
              <template slot="items" slot-scope="props">
                <td>{{ props.item.name }}</td>
                <td class="text-xs-right">{{ getFormattedPrice(props.item.price) }}</td>
                <td class="text-xs-right">{{ props.item.quantity }}</td>
                <td class="text-xs-right">{{ getItemSubtotal(tableItems, props.item) }}</td>
              </template>
              <template slot="footer">
                <v-slide-y-transition>
                  <tr v-if="isPercentageDiscountApplied === true">
                    <td>
                      <strong>Subtotal</strong>
                    </td>
                    <td></td>
                    <td></td>
                    <td class="text-xs-right">
                      <strong>{{ subtotal }}</strong>
                    </td>
                  </tr>
                </v-slide-y-transition>
                <v-slide-y-transition>
                  <tr v-if="isPercentageDiscountApplied === true">
                    <td>{{ discountMessage }}</td>
                    <td></td>
                    <td></td>
                    <td class="text-xs-right">{{ savings }}</td>
                  </tr>
                </v-slide-y-transition>
                <tr>
                  <td>
                    <strong>Total</strong>
                  </td>
                  <td></td>
                  <td></td>
                  <td class="text-xs-right">
                    <strong>{{ getTotal }}</strong>
                  </td>
                </tr>
                <v-slide-y-transition>
                  <tr v-if="isItemDiscountApplied === true">
                    <td>{{ discountMessage }}</td>
                    <td></td>
                    <td></td>
                    <td class="text-xs-right">{{ savings }}</td>
                  </tr>
                </v-slide-y-transition>
              </template>
              <template slot="no-data">
                <v-alert :value="true" color="error" icon="warning">No items in order.</v-alert>
              </template>
            </v-data-table>
          </v-card>
        </v-flex>
        <v-flex xs12>
          <v-card>
            <v-layout row wrap class="pb-2">
              <v-flex lg3 md3 sm3 xs6 class="pl-3 pt-3">
                <v-btn block @click="getDiscount">Apply</v-btn>
              </v-flex>
              <v-flex lg6 md6 sm6 xs6 class="pr-3">
                <v-text-field
                  label="Promo code"
                  v-model="promoCode"
                  :error="promoError"
                  :rules="promoRules"
                ></v-text-field>
              </v-flex>
            </v-layout>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </v-form>
</template>

<script>
import { mapState, mapGetters } from "vuex"
import currency from "currency.js"
import mixin from "@/mixin"

export default {
  mixins: [mixin],
  computed: {
    ...mapState(["products", "orderItems"]),
    ...mapGetters(["total"]),
    getTotal: function() {
      return this.discountedTotal ? this.discountedTotal : this.subtotal
    },
    subtotal: function() {
      let total = 0
      if (this.tableItems && this.tableItems.length > 0) {
        this.tableItems.forEach(item => {
          total = currency(item.price)
            .multiply(item.quantity)
            .add(total)
        })
      }
      return currency(total, { formatWithSymbol: true }).format()
    }
  },
  data() {
    return {
      valid: true,
      isItemDiscountApplied: false,
      isPercentageDiscountApplied: false,
      discountMessage: null,
      discountedTotal: null,
      savings: null,
      promoCode: "",
      promoError: false,
      promoRules: [],
      tableItems: [],
      tableData: [],
      tableHeaders: [
        { text: "Product Name", value: "name" },
        { text: "Price", align: "right", value: "price" },
        { text: "Quantity", align: "right", value: "quantity" },
        { text: "Amount", align: "right", value: "subtotal" }
      ]
    }
  },
  methods: {
    getDiscount() {
      if (this.promoCode === "") {
        this.updatePromoRules(true, ["Please enter a promo code."])
        return
      }

      const endpoint = `${location.origin}/promo`
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          promoCode: this.promoCode,
          orderItems: this.orderItems
        })
      }

      this.fetchDiscountedItems(endpoint, options)
        .then(res => {
          console.log("Response: ", res)
          this.updatePromoRules(false)
          this.updateTable(res.data)
        })
        .catch(error => {
          this.updatePromoRules(true, [error.message])
        })
    },

    async fetchDiscountedItems(endpoint, options) {
      try {
        let res = await fetch(endpoint, options)
        let data = await res.json()
        if (!data.success) throw new Error(data.message)
        return data
      } catch (error) {
        throw new Error(error.message)
      }
    },

    updatePromoRules(hasError, rule = []) {
      this.promoError = hasError
      this.promoRules = rule
    },

    updateTable(discount) {
      this.tableItems = discount.items
      this.savings = this.getFormattedPrice(discount.savings)

      switch (discount.rule) {
        case "PERCENTAGE":
          this.applyPercentageDiscount(discount)
          break

        case "ITEM":
          this.applyItemDiscount(discount)
          break

        default:
          break
      }
    },

    applyItemDiscount(discount) {
      let discountedProduct = this.products.find(
        product => product.id === discount.discountedProductId
      )
      if (discountedProduct) {
        this.isItemDiscountApplied = true
        this.discountMessage = `Savings from promo code: ${
          discountedProduct.name
        } price reduced from ${this.getFormattedPrice(
          discountedProduct.price
        )} to ${this.getFormattedPrice(discount.discountedPrice)}`
      }
    },

    applyPercentageDiscount(discount) {
      this.isPercentageDiscountApplied = true
      this.discountMessage = `Discount from promo code (${
        discount.percentage
      }%)`
      let total = currency(discount.total).subtract(discount.savings)
      this.discountedTotal = this.getFormattedPrice(total)
    },

    discardDiscount() {
      this.isItemDiscountApplied = false
      this.isPercentageDiscountApplied = false
      this.tableItems = this.orderItems
      this.discountMessage = null
      this.savings = null
      this.discountedTotal = null
      this.promoCode = null
      this.updatePromoRules(false)
    }
  },
  created: function() {
    this.tableItems = this.orderItems
  }
}
</script>
