import Invoice from "../models/Invoice";
import Product from "../models/Product";
import fs from "fs";
import PDFDocument from "pdfkit";

export const createInvoice = async (req, res) => {
  try {
// barcode given then make product struct -> [{productId, quantity, price}]
// not given barcode product id given -> [{productId, quantity, price}]
// req.body = {ids: [{productId, quantity}], customerName, due}

    const {ids, customerName, paid, storeName} = req.body;

    if(!ids || ids.length===0){
      return res.status(400).json({message: "No products selected"});
    }
    if(!customerName){
        return res.status(400).json({message: "Customer name is required"});
    }
    if(paid===undefined || paid===null){
        return res.status(400).json({message: "Due amount is required"});
    }
    
    let totalAmount=0;
    let items=[];
    ids.forEach(async (item)=>{
      const product = await Product.findById(item.productId);
      if(!product){
        return res.status(404).json({message: `Product with id ${item.productId} not found`});
      }
        if(item.quantity>product.stock){
            return res.status(400).json({message: `Insufficient stock for product ${product.title}`});
        }
        const price = product.price * item.quantity;
        totalAmount += price;
        items.push({
            productId: item.productId,
            name: product.title,
            quantity: item.quantity,
            price: product.price
        });
        // Deduct stock
        product.stock -= item.quantity;
        await product.save();
    }
    );
    const invoiceNumber = `INV-${Date.now()}`;
    const newInvoice = new Invoice({
        invoiceNumber,
        customerName,
        items,
        totalAmount,
        paid
    });
    await newInvoice.save();

    const doc = new PDFDocument();
    const filePath = `invoices/${invoiceNumber}.pdf`;
    doc.pipe(fs.createWriteStream(filePath));

  // Header
  doc.fontSize(20).text("Invoice", { align: "center" });
  doc.moveDown();
  doc.fontSize(15).text(`${storeName}`);
  doc.fontSize(12).text(`Invoice No: ${invoiceNumber}`);
  doc.text(`Date: ${new Date().toLocaleDateString()}`);
  doc.moveDown();
  
  // Customer
  doc.text(`Customer: ${customer.name}`);
  doc.moveDown();

    // Table Header
    doc.fontSize(12).text("Item", { underline: true, continued: true });
    doc.fontSize(12).text("Qty", { underline: true, continued: true });
    doc.fontSize(12).text("Price", { underline: true });
    doc.moveDown();


    items.forEach((item) => {
        const line = `${item.name} - ${item.quantity}  ${item.price}`;
        doc.text(line);
    });
    doc.moveDown();

    doc.text(`Total Amount: ${totalAmount}`);
    doc.moveDown();
    doc.text(`Paid: ${paid}`);
    doc.moveDown();

    let balance = 0;
    if(paid>totalAmount){
        totalAmount=0;
        balance = paid - totalAmount;
    }
    else{
        totalAmount -= paid;
        balance = totalAmount - paid;
    }
    doc.text(`Balance: ${balance}`);
    doc.moveDown();

    doc.text(`Amount to be Paid: ${totalAmount}`);
    doc.moveDown();
    
    doc.end();

    res.status(201).json({message: "Invoice created successfully", file: filePath});

  } catch (error) { 
    console.error(error);
    res.status(500).json({ message: "Server error during invoice creation." });
  }
};
