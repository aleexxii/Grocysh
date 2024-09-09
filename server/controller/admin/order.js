const { default: mongoose } = require('mongoose');
const Orders = require('../../model/orderModel')
const Product = require('../../model/productmodel')
const Wallet = require('../../model/walletModel')


const getOrderList = async (req, res) => {
    try {
      const orderTotal = await Orders.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$transaction_Amt" },
            count: { $sum: 1 },
          },
        },
      ]);
      const total = orderTotal[0]?.total || 0;
      const count = orderTotal[0]?.count || 0;
      const orders = await Orders.aggregate([
        {
          $addFields: {
            userObjectId: { $toObjectId: "$userId" }, //user id getting an string so, we need to change string to objectId
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userObjectId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $addFields: {
            total: total,
            count: count,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ]);
      res.render("order-list", { orders });
    } catch (error) {
      console.log(error);
    }
  };
  
  const getSingleOrder = async (req, res) => {
    const orderId = new mongoose.Types.ObjectId(req.params.orderId);
  
    try {
      const orderDetails = await Orders.aggregate([
        {
          $match: { _id: orderId },
        },
        {
          $addFields: {
            userObjectId: { $toObjectId: "$userId" }, //user id getting an string so, we need to change string to objectId
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userObjectId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $addFields: { addressId: { $toObjectId: "$address" } },
        },
        {
          $lookup: {
            from: "addresses",
            localField: "addressId",
            foreignField: "_id",
            as: "userAddress",
          },
        },
        {
          $unwind: "$userAddress",
        },
      ]);
      res.render("single-order", { orderDetails });
    } catch (error) {
      console.log(error);
    }
  };
  
  const postSingleOrder = async (req, res) => {
    try {
      const { productStatus, productId, userId, paymentMethod, totalPrice , mainProductId , quantity } = req.body;
  
      const productObjid = new mongoose.Types.ObjectId(productId);
      // Update the status of the specific product in the order
      const updatedOrder = await Orders.updateOne(
        { "products._id": productObjid },
        { $set: { "products.$.status": productStatus } }
      );

      const productQuantity = await Orders.findOne({"products._id": productObjid})
      console.log(productQuantity);
  
      if (productStatus == "Cancelled" || productStatus == "Returned") {
        const product = await Product.findById(mainProductId);
        product.stockKeepingUnit += Number(quantity);
        await product.save()
      }
  
      if (updatedOrder.nModified === 0) {
        return res.status(404).json({ error: "Product not found in order" });
      }
  
      // Check if the status is "Requested to Cancel" and the payment method is "cashonDelivery"
      if (
        (paymentMethod === "cashonDelivery" && productStatus === "Returned") ||
        (paymentMethod === "Online" && productStatus === "Cancelled") ||
        (paymentMethod === "Online" && productStatus === "Returned")
      ) {
        const userObjid = new mongoose.Types.ObjectId(userId);
        let wallet = await Wallet.findOne({ user: userObjid });
  
        if (!wallet) {
          // Create a new wallet if it doesn't exist
          wallet = new Wallet({
            user: userObjid,
            walletBalance: 0,
            transactions: [],
          });
        }
  
        // Add transaction for the product to the wallet
        wallet.transactions.push({
          amount: parseFloat(totalPrice),
          description: `Refund for ${productStatus} product ${productId}`,
          type: "credit",
          transactionDate: new Date(),
        });
  
        // Update the wallet balance
        wallet.walletBalance += parseFloat(totalPrice); // Assuming totalPrice is included in the request body
  
        await wallet.save();
      }
  
      res.status(200).json({ message: "Order updated successfully" });
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };


module.exports = {
    getOrderList,
    getSingleOrder,
    postSingleOrder
}