const Products = require("../../model/productmodel");

const categoryProducts = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await Products.find({ selectedCategory: category , deletedAt : 'Not-Deleted'});
    res.json(products);
  } catch (error) {
    console.log("error : ", error);
  }
};

const search = async (req, res) => {
  try {
    const { search_text } = req.body;
    const searchedProducts = await Products.find({
      deletedAt: "Not-Deleted",
      $or: [
        { productName: { $regex: search_text, $options: "i" } },
        { selectedCategory: { $regex: search_text, $options: "i" } },
      ],
    });
    res.status(200).json({ searchedProducts });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  categoryProducts,
  search,
};
