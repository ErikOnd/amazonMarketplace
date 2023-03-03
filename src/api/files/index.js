import Express from "express";
import multer from "multer";
import { extname } from "path";
import { saveProductsImg } from "../../lib/fs-tools.js";
import createHttpError from "http-errors";

const filesRouter = Express.Router();

filesRouter.post(
  "/:productID/upload",
  multer().single("productImg"),
  async (req, res, next) => {
    try {
      console.log(req.file);
      if (req.file !== undefined) {
        const originalFileExtension = extname(req.file.originalname);
        console.log(originalFileExtension);
        const fileName = req.params.productID + originalFileExtension;
        await saveProductsImg(fileName, req.file.buffer);
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
