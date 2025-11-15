import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";

import fs from "fs";
import slugify from "slugify";
import dotenv from "dotenv";

dotenv.config();

// CREATE PRODUCT CONTROLLER
export const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, bulkDiscounts } = req.fields;
    const { photo } = req.files;
    switch (true) {
      case !name:
        return res.status(500).send({ error: "Name is Required" });
      case !description:
        return res.status(500).send({ error: "Description is Required" });
      case !price:
        return res.status(500).send({ error: "Price is Required" });
      case !category:
        return res.status(500).send({ error: "Category is Required" });
      case !quantity:
        return res.status(500).send({ error: "Quantity is Required" });
      case photo && photo.size > 1000000:
        return res
          .status(500)
          .send({ error: "photo is Required and should be less then 1mb" });
    }

    const productFields = { ...req.fields, slug: slugify(name) };
    if (bulkDiscounts) {
      try {
        productFields.bulkDiscounts = JSON.parse(bulkDiscounts);
      } catch (e) {
        productFields.bulkDiscounts = [];
      }
    }
    // Handle specifications
    if (req.fields.specifications) {
      try {
        productFields.specifications = typeof req.fields.specifications === 'string'
          ? JSON.parse(req.fields.specifications)
          : req.fields.specifications;
        console.log("Parsed specifications:", productFields.specifications);
      } catch (e) {
        console.log("Error parsing specifications:", e);
        productFields.specifications = {};
      }
    } else {
      productFields.specifications = {};
    }
    // Handle showSpecificationsTable
    // FormData converts booleans to strings, so handle both cases
    console.log("showSpecificationsTable from request:", req.fields.showSpecificationsTable, typeof req.fields.showSpecificationsTable);
    if (req.fields.showSpecificationsTable !== undefined && req.fields.showSpecificationsTable !== null) {
      const showTable = req.fields.showSpecificationsTable;
      // Convert to boolean: true if 'true', true, or '1'; false otherwise
      productFields.showSpecificationsTable = (showTable === 'true' || showTable === true || showTable === '1' || showTable === 1);
      console.log("Parsed showSpecificationsTable:", productFields.showSpecificationsTable);
    } else {
      productFields.showSpecificationsTable = false;
      console.log("showSpecificationsTable not provided, defaulting to false");
    }
    const products = new productModel(productFields);
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    console.log("Saved product with showSpecificationsTable:", products.showSpecificationsTable);
    console.log("Saved product specifications:", products.specifications);
    res.status(201).send({
      success: true,
      message: "Product Created Successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in crearing product",
    });
  }
};

export const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .limit(12)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      counTotal: products.length,
      message: "ALL Products ",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr in getting products",
      error: error.message,
    });
  }
};
// get single product
// get single product controller
export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .populate("category");
    console.log(
      "Product fetched - showSpecificationsTable:",
      product?.showSpecificationsTable
    );
    console.log("Product fetched - specifications:", product?.specifications);
    // Normalize missing fields for older documents
    let normalized = product ? product.toObject() : null;
    if (normalized) {
      if (
        typeof normalized.showSpecificationsTable === "undefined" ||
        normalized.showSpecificationsTable === null
      ) {
        normalized.showSpecificationsTable = false;
      }
      if (
        typeof normalized.specifications === "undefined" ||
        normalized.specifications === null
      ) {
        normalized.specifications = {};
      }
    }
    res.status(200).send({
      success: true,
      message: "Single Product Fetched",
      product: normalized,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Eror while getitng single product",
      error,
    });
  }
};

//get photo
export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");
    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr while getting photo",
      error,
    });
  }
};

export const deleteProductController = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid).select("-photo");
    res.status(200).send({
      success: true,
      message: "Product Deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting product",
      error,
    });
  }
};
//updateproduct controller
export const updateProductController = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      photo,
      category,
      quantity,
      bulkDiscounts,
    } = req.fields;
    //Validation
    switch (true) {
      case !name:
        return res.status(500).send({ error: "Name is Required" });
      case !description:
        return res.status(500).send({ error: "Description is Required" });
      case !price:
        return res.status(500).send({ error: "Price is Required" });
      case !category:
        return res.status(500).send({ error: "Category is Required" });
      case !quantity:
        return res.status(500).send({ error: "Quantity is Required" });
      // case !PushSubscriptionOptions:
      //   return res
      //     .status(500)
      //     .send({ error: "PushSubscriptionOptions is Required" });
    }

    const updateFields = { ...req.fields, slug: slugify(name) };
    if (bulkDiscounts) {
      try {
        updateFields.bulkDiscounts = JSON.parse(bulkDiscounts);
      } catch (e) {
        updateFields.bulkDiscounts = [];
      }
    }
    // Handle specifications
    if (req.fields.specifications) {
      try {
        updateFields.specifications =
          typeof req.fields.specifications === "string"
            ? JSON.parse(req.fields.specifications)
            : req.fields.specifications;
      } catch (e) {
        updateFields.specifications = {};
      }
    }
    // Handle showSpecificationsTable
    // FormData converts booleans to strings, so handle both cases
    if (req.fields.showSpecificationsTable !== undefined) {
      const showTable = req.fields.showSpecificationsTable;
      // Convert to boolean: true if 'true', true, or '1'; false otherwise
      updateFields.showSpecificationsTable =
        showTable === "true" || showTable === true || showTable === "1";
    }
    // If not provided, don't update it (keep existing value)
    const products = await productModel.findByIdAndUpdate(
      req.params.pid,
      updateFields,
      { new: true }
    );

    await products.save();
    res.status(201).send({
      success: true,
      message: "Product Updated Successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Update product",
    });
  }
};
export const searchController = async (req, res) => {
  try {
    let { keyword } = req.params;

    if (typeof keyword !== "string") {
      throw new Error("Keyword must be a string");
    }

    // Handle empty keyword
    if (!keyword.trim()) {
      throw new Error("Keyword cannot be empty");
    }

    const results = await productModel.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    });

    res.json(results);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error In Search Product API",
      error,
    });
  }
};

export const relatedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })

      .limit(3)
      .populate("category");

    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error In related Product API",
      error,
    });
  }
};

export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });

    // Get all subcategories recursively
    const getAllSubcategories = async (parentId) => {
      const subcategories = await categoryModel.find({ parent: parentId });
      let allSubcategories = [...subcategories];

      for (const sub of subcategories) {
        const nestedSubs = await getAllSubcategories(sub._id);
        allSubcategories = [...allSubcategories, ...nestedSubs];
      }

      return allSubcategories;
    };

    // Get all subcategories for the current category
    const subcategories = await getAllSubcategories(category._id);

    // Create an array of all category IDs (current category + all subcategories)
    const categoryIds = [category._id, ...subcategories.map(sub => sub._id)];

    // Find products that belong to any of these categories
    const products = await productModel
      .find({
        category: { $in: categoryIds }
      })
      .populate("category");

    res.status(200).send({
      success: true,
      products,
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error In Product category API",
      error,
    });
  }
};
