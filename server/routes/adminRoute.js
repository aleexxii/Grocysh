const express = require('express');
const route = express();


const adminController = require('../controller/admin/auth');
const adminCategory = require('../controller/admin/Category')
const adminProduct = require('../controller/admin/Product')
const couponManagement = require('../controller/admin/couponMangement')
const adminCustomerdetails = require('../controller/admin/Customer')
const productImageMulter = require('../../middleware/productImageMulter')
const categoryImageMulter = require('../../middleware/categoryImages')
const BannerController = require('../controller/admin/banner')
const bannerImg_Multer = require('../../middleware/bannerImage')
const promotionImg_Multer = require('../../middleware/promotionMulter')
const couponImg_Multer = require('../../middleware/couponMulter')
const orderController = require('../controller/admin/order')
const {verifyAdminJWT} = require('../../middleware/authentication')

// Set views directory
route.set('views', './views/admin');


route.get('/login',adminController.getAdminLogin)
route.post('/login',adminController.postAdminLogin)
route.get('/adminHome',verifyAdminJWT,adminController.home)
route.post('/adminHome',verifyAdminJWT,adminController.chart)
route.post('/adminLogout',verifyAdminJWT,adminController.logout)

//CATEGORIES

route.get('/categories',verifyAdminJWT,adminCategory.getCategories)
route.get('/add-category',verifyAdminJWT,adminCategory.getAddCategories)
route.post('/add-category',verifyAdminJWT,categoryImageMulter.single('file'),adminCategory.postAddCategory)
route.get('/edit-category',verifyAdminJWT, adminCategory.editCategoryPage);
route.post('/edit-category',verifyAdminJWT,categoryImageMulter.single('file'),adminCategory.editedCategory)
route.get('/category-deleted',verifyAdminJWT,adminCategory.categoryDeleting)
route.get('/deleted-category',verifyAdminJWT,adminCategory.deletedCategory)


//CUSTOMERS

route.get('/customers',verifyAdminJWT,adminCustomerdetails.getCustomers)
route.post('/block-user',verifyAdminJWT,adminCustomerdetails.userBlock)
route.post('/unblock-user',verifyAdminJWT,adminCustomerdetails.userUnblock)


// Orders
route.get('/order-list',verifyAdminJWT,orderController.getOrderList)
route.get('/single-order/:orderId',verifyAdminJWT,orderController.getSingleOrder)
route.post('/single-order/:orderId',verifyAdminJWT,orderController.postSingleOrder)

//PRODUCTS

route.get('/products',verifyAdminJWT,adminProduct.getProducts)
route.get('/add-product',verifyAdminJWT,adminProduct.getAddProduct)
route.post('/addNewProduct',verifyAdminJWT,productImageMulter.array('files',5),adminProduct.postCreateProduct)
route.get('/edit-product',verifyAdminJWT,adminProduct.editProduct)
route.post('/update-product',verifyAdminJWT,productImageMulter.any(),adminProduct.updatedproductPage)
route.get('/deleted-product',verifyAdminJWT,adminProduct.deletedproductPage)
route.get('/product-deleted',verifyAdminJWT,adminProduct.deletingProduct)


route.get('/vendor',verifyAdminJWT,couponManagement.getVendor)
route.post('/coupon',verifyAdminJWT,couponImg_Multer.single('imageFile'),couponManagement.postCoupon)
route.delete('/delete-coupon/:id',verifyAdminJWT,couponManagement.deleteCoupon)
route.post('/search-coupon',verifyAdminJWT,couponManagement.search)

route.get('/reviews',verifyAdminJWT,adminController.getReviews)


// BANNER
route.get('/banners',verifyAdminJWT,BannerController.bannerPage)
route.get('/add-banner',verifyAdminJWT,BannerController.addBanner)
route.post('/submit-banner',bannerImg_Multer.single('file'),BannerController.banner)

route.get('/promotion',verifyAdminJWT,BannerController.promotionPage)
route.get('/add-promotion',verifyAdminJWT,BannerController.addPromotionPage)
route.post('/position-form',verifyAdminJWT,promotionImg_Multer.single('file'),BannerController.uploadPromotion)
route.delete('/delete-promotion/:id',verifyAdminJWT,BannerController.deletePromotion)


module.exports = route