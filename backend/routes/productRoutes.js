import express from "express";
import { 
  createProduct, 
  getProducts, 
  updateProduct, 
  increaseStockByBarcodeViaParams,
  decreaseStockByBarcodeViaParams
} from "../controllers/productController.js";

const router = express.Router();

router.post("/create", createProduct);
router.get("/getAllProducts", getProducts);
router.put("/:id", updateProduct);
router.patch("/stockin/barcode/:barcode", increaseStockByBarcodeViaParams);
router.patch("/stockout/barcode/:barcode", decreaseStockByBarcodeViaParams);

export default router;