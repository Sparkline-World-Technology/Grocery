import Product from "../models/Product.js";

export const createProduct = async (req, res) => {
  try {
    const { barcode, title, description, category, price, stock, unit, expiryDate } = req.body;
    if (!title || !price || stock === undefined || stock === null) {
      return res.status(400).json({ message: "Title, price, and stock are required fields." });
    }

    const newProduct = new Product({
      barcode,
      title,
      description,
      category,
      price,
      stock,
      unit,
      expiryDate,
    });

    const savedProduct = await newProduct.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during product creation." });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching products." });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during product update." });
  }
};

export const increaseStockByBarcodeViaParams = async (req, res) => {
  try {
    const { barcode } = req.params;

    const updatedProduct = await Product.findOneAndUpdate(
      { barcode },
      { $inc: { stock: 1 } },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product with this barcode not found." });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during stock update." });
  }
};
