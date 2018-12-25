import express from "express"
import bodyParser from "body-parser"
import { getDiscount } from "./modules/pricing-rules.js"
import PRODUCTS from "./modules/products.js"

const port = process.env.PORT || 8080

let app = express()
app.use(express.static(__dirname + "/dist"))
app.use(bodyParser.json())

app.get("/products", (req, res) => {
  let response = JSON.stringify(PRODUCTS)
  res.send(response)
})

app.post("/promo", (req, res) => {
  let response = getDiscount(req.body.promoCode, req.body.orderItems)
  res.send(response)
})

const d = new Date()
app.listen(port, () => {
  console.log(`[${d.toLocaleString()}] Listening on port ${port}`)
})
