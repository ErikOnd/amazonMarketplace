import Express from "express";
import { nanoid } from "nanoid";
import createHttpError from "http-errors";
import { checkProductsSchema, triggerBadRequest } from "./validator.js";
import { getProducts, writeProducts } from "../../lib/fs-tools.js";

const productsRouter = Express.Router();

productsRouter.post(
  "/",
  checkProductsSchema,
  triggerBadRequest,
  async (req, res, next) => {
    try {
      const newProduct = {
        ...req.body,
        id: nanoid(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const productList = await getProducts();
      productList.push(newProduct);
      await writeProducts(productList);
      res.status(201).send({ id: newProduct.id });
    } catch (error) {
      next(error);
    }
  }
);

productsRouter.get("/", async (req, res, next) => {
  try {
    const productList = await getProducts();
    if (req.query && req.query.category) {
      const fillteredProducts = productList.filter(
        (product) => product.category === req.query.category
      );
      res.status(200).send(fillteredProducts);
    } else if (
      Object.keys(req.query).length === 0 &&
      req.query.constructor === Object
    ) {
      res.status(200).send(productList);
    } else {
      next(createHttpError(404, `Invalid route!`));
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/:id", triggerBadRequest, async (req, res, next) => {
  try {
    const productList = await getProducts();
    const product = productList.find((product) => product.id === req.params.id);
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
    const productList = await getProducts();
    const index = productList.findIndex(
      (product) => product.id === req.params.id
    );
    if (index !== -1) {
      const oldProduct = productList[index];
      const updatedProduct = {
        ...oldProduct,
        ...req.body,
        updatedAt: new Date(),
      };

      productList[index] = updatedProduct;
      await writeProducts(productList);
      res.status(200).send(updatedProduct);
    } else {
      createHttpError(404, `Product with the id ${req.params.id} not found!`);
    }
  } catch (error) {}
});

productsRouter.delete("/:id", async (req, res, next) => {
  try {
    const productList = await getProducts();
    const updatedProductList = productList.filter(
      (product) => product.id !== req.params.id
    );
    if (productList.length !== updatedProductList.length) {
      writeProducts(updatedProductList);
      res.status(204).send();
    } else {
      next(createHttpError(404, `Product with id ${req.params.id} not found!`)); //
    }
  } catch (error) {
    next(error);
  }
});

export default productsRouter;
