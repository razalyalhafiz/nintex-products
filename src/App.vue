<template>
  <v-app dark>
    <v-toolbar app>
      <v-img :src="require('./assets/logo.svg')" contain position="left" height="34"></v-img>
      <v-spacer></v-spacer>
      <v-toolbar-title class="headline">
        <span>Products</span>
      </v-toolbar-title>
    </v-toolbar>

    <v-content>
      <v-stepper v-model="step">
        <v-stepper-header>
          <v-stepper-step :complete="step > 1" step="1">Select products</v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step :complete="step > 2" step="2">Review / Apply promo code</v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step step="3">Proceed to checkout</v-stepper-step>
        </v-stepper-header>

        <v-stepper-items>
          <v-stepper-content step="1">
            <Products></Products>
            <v-btn
              :class="{'ml-3': $vuetify.breakpoint.smAndDown, 'ml-4': $vuetify.breakpoint.mdAndUp}"
              color="primary"
              @click="step = 2"
              :disabled="orderItems.length === 0"
            >Continue</v-btn>
            <v-btn flat @click="restart">Clear items</v-btn>
          </v-stepper-content>

          <v-stepper-content step="2">
            <Order ref="order"></Order>
            <v-btn
              :class="{'ml-3': $vuetify.breakpoint.smAndDown, 'ml-4': $vuetify.breakpoint.mdAndUp}"
              color="primary"
              @click="step = 3"
            >Continue</v-btn>
            <v-btn flat @click="selectProducts">Back</v-btn>
          </v-stepper-content>

          <v-stepper-content step="3">
            <v-card class="mb-3" height="200px">
              <v-card-title>
                <div class="title mt-3">Hurray! You made it to the end.</div>
              </v-card-title>
              <v-card-text>
                <p>It was a short journey, but I hope you enjoyed it anyway!</p>
              </v-card-text>
            </v-card>
            <v-btn class="ml-0" color="primary" @click="restart">Start again</v-btn>
            <v-btn flat @click="review">Back</v-btn>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </v-content>
  </v-app>
</template>

<script>
import Order from "@/components/Order"
import Products from "@/components/Products"
import { mapState, mapMutations } from "vuex"

export default {
  components: { Order, Products },
  computed: {
    ...mapState(["orderItems"])
  },
  data() {
    return {
      step: 1
    }
  },
  methods: {
    ...mapMutations(["REMOVE_ALL_ITEMS"]),
    restart() {
      this.REMOVE_ALL_ITEMS()
      this.selectProducts()
    },
    selectProducts() {
      this.step = 1
      this.$refs.order.discardDiscount()
    },
    review() {
      this.step = 2
      this.$refs.order.updatePromoRules(false)
    }
  }
}
</script>
