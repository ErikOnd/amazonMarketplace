import Express from "express";
import createHttpError from "http-errors";
import { checkProductsSchema, triggerBadRequest } from "./validator.js";
import ProductModel from "./model.js";
import q2m from "query-to-mongo";

const productsRouter = Express.Router();

productsRouter.post(
  "/",
  checkProductsSchema,
  triggerBadRequest,
  async (req, res, next) => {
    try {
      const newProduct = await ProductModel(req.body);
      const { _id } = await newProduct.save();
      res.status(201).send({ id: _id });
    } catch (error) {
      next(error);
    }
  }
);

productsRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const { products, total } = await ProductModel.enableProductFilter(
      mongoQuery
    );
    res.send({
      links: mongoQuery.links(`${process.env.FE_PROD_URL}/blogPosts`, total),
      total,
      numberOfPages: Math.ceil(total / mongoQuery.options.limit),
      products,
    });
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/:id", triggerBadRequest, async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (product) {
      res.status(200).send(product);
    } else {
      next(
        createHttpError(404, `Product with the id ${req.params.id} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.put("/:id", triggerBadRequest, async (req, res, next) => {
  try {
    const productToEdit = await ProductModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (productToEdit) {
      res.status(200).send(productToEdit);
    } else {
      createHttpError(404, `Product with the id ${req.params.id} not found!`);
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.delete("/:id", async (req, res, next) => {
  try {
    const productToDelete = await ProductModel.findByIdAndDelete(req.params.id);
    if (productToDelete) {
      res.status(204).send();
    } else {
      next(createHttpError(404, `Product with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

export default productsRouter;
