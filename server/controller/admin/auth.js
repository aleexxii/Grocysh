const Admin = require("../../model/adminLoginModel");
const Product = require("../../model/productmodel");
const User = require("../../model/userModel");
const Orders = require("../../model/orderModel");
const Reviews = require("../../model/reviewModel");
const Customers = require("../../model/userModel");
const { default: mongoose } = require("mongoose");
const { adminJWT } = require('../../helper/setJwtToken')

const getAdminLogin = (req, res) => {
  try {
    res.render("adminLogin");
  } catch (error) {
    console.log(error);
  }
};

const home = async (req, res) => {
  try {
    const admin = req.cookies.email

    const criteria = {
      $or: [
        { paymentMethod: "cashonDelivery", "products.status": "Delivered" },
        { paymentMethod: "Online", "products.status": "Delivered" },
      ],
    };
    const totalEarnings = await Orders.aggregate([
      { $match: criteria },
      { $unwind: "$products" },
      { $match: { "products.status": "Delivered" } },
      { $group: { _id: null, total: { $sum: "$products.totalPrice" } } },
    ]);
    const total_orders = await Orders.countDocuments();

    const total_user = await Customers.countDocuments();

    const topSellingCategories = await Orders.aggregate([
      { $unwind: "$products" },
      { $match: { "products.status": "Delivered" } },
      {
        $group: {
          _id: "$products.product.selectedCategory",
          totalQuantity: { $sum: "$products.quantity" },
          totalPrice: { $sum: "$products.price" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {$project : {_id : 1 , totalQuantity : 1 , totalPrice : 1 }}
    ]);
    

    const bestSellingProducts = await Orders.aggregate([
      { $unwind: "$products" },
      { $match: { "products.status": "Delivered" } },
      {
        $group: {
          _id: "$products.productId",
          totalQuantity: { $sum: "$products.quantity" },
          totalPrice: { $sum: "$products.price" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);
    res.render("adminHome", {
      topSellingCategories,
      bestSellingProducts,
      totalEarnings,
      total_orders,
      total_user,
      admin
    });
  } catch (error) {
    console.log(error);
  }
};

const chart = async (req, res) => {
  try {
    if (Object.keys(req.body).length === 0) {
      const orders = await Orders.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$orderDate" },
            },
            totalSales: { $sum: "$transaction_Amt" },
          },
        },
        {
          $sort: { "_id.year": 1 },
        },
      ]);

      let labels = orders.map((order) => `${order._id.year}`);
      let data = orders.map((order) => order.totalSales);

      res.json({ labels, data });
    } else if (req.body.month == "months" && req.body.year) {
      const year = req.body.year;
      console.log("inside the if :", year);
      const yearOfOrder = await Orders.aggregate([
        {
          $match: {
            orderDate: {
              $gte: new Date(year, 0, 1),
              $lte: new Date(year, 11, 31, 23, 59, 59),
            },
          },
        },
        {
          $group: {
            _id: {
              month: { $month: "$orderDate" },
              year: { $year: "$orderDate" },
            },
            totalSales: { $sum: "$transaction_Amt" },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 },
        },
      ]);
      labels = yearOfOrder.map((order) => `${order._id.month}`);
      data = yearOfOrder.map((order) => order.totalSales);

      res.json({ labels, data });
    } else {
      const month = req.body.month;
      const year = req.body.year;
      console.log("Fetching data for month:", month, "year:", year);

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      console.log(startDate, endDate);

      const monthData = await Orders.aggregate([
        { $match: { orderDate: { $gte: startDate, $lte: endDate } } },
        {
          $group: {
            _id: {
              day: { $dayOfMonth: "$orderDate" },
              month: { $month: "$orderDate" },
              year: { $year: "$orderDate" },
            },
            totalSales: { $sum: "$transaction_Amt" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ]);

      labels = monthData.map((order) => `${order._id.day}`);
      data = monthData.map((order) => order.totalSales);
      console.log("Daily data for month:", data);

      res.json({ labels, data });
    }
  } catch (error) {
    console.log("error", error);
  }
};

const postAdminLogin = async (req, res) => {
  try {
    const findingAdmin = await Admin.findOne({ email: req.body.email });
    if (findingAdmin && findingAdmin.password == req.body.password) {
      adminJWT(findingAdmin,res)
      res.redirect("./adminHome");
    } else {
      console.log("somthing missing");
    }
  } catch (error) {
    console.log(error);
  }
};

const getReviews = async (req, res) => {
  try {
    const limit = 10;
    let page = req.query.page ? parseInt(req.query.page) : 1;
    const reviewsCount = await Reviews.countDocuments({});

    const reviews = await Reviews.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      { $unwind: "$user" },
      {
        $project: {
          createdAt: 1,
          rating: 1,
          headline: 1,
          "user.fname": 1,
          "product.productName": 1,
        },
      },
    ]);
    res.render("reviews", {
      reviews,
      limit,
      reviewsCount,
      currentPage: page,
      totalPage: Math.ceil(reviewsCount / limit),
      previous: page > 1 ? page - 1 : null,
      next: Math.ceil(reviewsCount / limit) ? page + 1 : null,
    });
  } catch (error) {
    console.log(error);
  }
};

const logout = async (req,res)=>{
  try {
    res.clearCookie('adminToken')
    res.json({message : 'logout successfull' , redirect : './login'})
  } catch (error) {
    return res.status(500)
  }
}

module.exports = {
  getAdminLogin,
  postAdminLogin,
  home,
  getReviews,
  chart,
  logout
};
