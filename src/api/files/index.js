import Express from "express";
import multer from "multer";
import { extname } from "path";
import {
  getProducts,
  saveProductsImg,
  writeProducts,
} from "../../lib/fs-tools.js";
import createHttpError from "http-errors";

const filesRouter = Express.Router();

filesRouter.put(
  "/:productID/upload",
  multer().single("productImg"),
  async (req, res, next) => {
    try {
      if (req.file !== undefined) {
        const originalFileExtension = extname(req.file.originalname);
        const fileName = req.params.productID + originalFileExtension;
        await saveProductsImg(fileName, req.file.buffer);
        const productList = await getProducts();
        const index = productList.findIndex(
          (product) => product.id === req.params.productID
        );
        if (index !== -1) {
          const oldProduct = productList[index];
          const updatedProduct = {
            ...oldProduct,
            imageUrl: "http://localhost:3001/img/products/" + fileName,
            updatedAt: new Date(),
          };
          productList[index] = updatedProduct;
          await writeProducts(productList);
        }
        res.send({ message: "file uploaded" });
      } else {
        next(createHttpError(404, `The uploaded image is undefined`));
      }
    } catch (error) {
      next(error);
    }
  }
);

export default filesRouter;
