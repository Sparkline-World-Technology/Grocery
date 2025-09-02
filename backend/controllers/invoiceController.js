import Invoice from "../models/Invoice.js";
import Product from "../models/Product.js";
import PDFDocument from "pdfkit";

export const createInvoice = async (req, res) => {
  try {

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

    const items = await Promise.all(
        ids.map(async (item) => {
            let product;
            if (item.barcode) {
            product = await Product.findOne({ barcode: item.barcode });
            } else {
            product = await Product.findById(item.productId);
            }

            if (!product) throw new Error(`Product not found`);

            if (item.quantity > product.stock) throw new Error(`Insufficient stock for ${product.title}`);

            const price = product.price * item.quantity;
            totalAmount += price;

            product.stock -= item.quantity;
            await product.save();

            return {
            productId: product._id,
            name: product.title,
            quantity: item.quantity,
            price: product.price,
            };
        })
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
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${invoiceNumber}.pdf`);

    doc.pipe(res);


  // Header
  doc.fontSize(20).text("Invoice", { align: "center" });
  doc.moveDown();
  doc.fontSize(15).text(`${storeName}`);
  doc.fontSize(12).text(`Invoice No: ${invoiceNumber}`);
  doc.text(`Date: ${new Date().toLocaleDateString()}`);
  doc.moveDown();
  
  // Customer
  doc.text(`Customer: ${customerName}`);
  doc.moveDown();

    // Table Header
    doc.fontSize(12).text("Item", { underline: true, continued: true });
    doc.fontSize(12).text("Qty", { underline: true, continued: true });
    doc.fontSize(12).text("Price", { underline: true });
    doc.moveDown();


    items.forEach((item) => {
        const line = `${item.name} - ${item.quantity}  ${item.price}`;
        // console.log(line);
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
        balance = 0;
    }
    doc.text(`Balance: ${balance}`);
    doc.moveDown();

    doc.text(`Amount to be Paid: ${totalAmount}`);
    doc.moveDown();
    
    doc.end();

    // res.status(201).json({message: "Invoice created successfully" });

  } catch (error) { 
    console.error(error);
    res.status(500).json({ message: "Server error during invoice creation." });
  }
};
