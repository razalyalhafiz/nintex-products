<template>
  <v-container grid-list-md fluid>
    <v-layout row wrap>
      <v-flex v-for="product in products" :key="product.id" md4 sm6 xs12>
        <v-card>
          <v-card-title class="headline">{{ product.name }}</v-card-title>
          <v-card-text>{{ getFormattedPrice(product.price) }}</v-card-text>
          <v-toolbar>
            <v-toolbar-title>{{ getItemSubtotal(orderItems, product) }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn fab small @click="REMOVE_ITEM(product)">
              <v-icon>remove</v-icon>
            </v-btn>
            <span class="title">{{ getItemQuantity(product) }}</span>
            <v-btn fab small @click="ADD_ITEM(product)">
              <v-icon>add</v-icon>
            </v-btn>
          </v-toolbar>
        </v-card>
      </v-flex>
      <v-flex xs12>
        <v-card>
          <v-card-title class="headline">Subtotal: {{ subtotal }}</v-card-title>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState, mapMutations, mapActions, mapGetters } from "vuex"
import mixin from "@/mixin"

export default {
  mixins: [mixin],
  computed: {
    ...mapState(["products", "orderItems"]),
    ...mapGetters(["subtotal"])
  },
  methods: {
    ...mapMutations(["ADD_ITEM", "REMOVE_ITEM"]),
    ...mapActions(["GET_PRODUCTS"]),
    getItemQuantity(product) {
      let item = this.orderItems.find(item => item.id === product.id)
      return item ? item.quantity : 0
    }
  },
  created() {
    this.GET_PRODUCTS()
  }
}
</script>