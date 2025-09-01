import express from "express";
import { 
  createProduct, 
  getProducts, 
  updateProduct, 
  increaseStockByBarcodeViaParams 
} from "../controllers/productController.js";

const router = express.Router();

router.post("/create", createProduct);
router.get("/getAllProducts", getProducts);
router.put("/:id", updateProduct);
router.patch("/barcode/:barcode", increaseStockByBarcodeViaParams);

export default router;
