import Express from "express";
import createHttpError from "http-errors";
import { checkReviewsSchema, triggerBadRequest } from "./validator.js";
import { getReviews, writeReviews } from "../../lib/fs-tools.js";
import ReviewModel from "./model.js";
import ProductModel from "../products/model.js";

const reviewsRouter = Express.Router();

reviewsRouter.post(
  "/:productId/reviews",
  checkReviewsSchema,
  triggerBadRequest,
  async (req, res, next) => {
    try {
      const newReview = await ReviewModel(req.body);
      const { _id } = await newReview.save();
      await ProductModel.findByIdAndUpdate(
        req.params.productId,
        { $push: { reviews: _id } },
        { new: true, runValidators: true }
      );
      res.status(201).send({ id: _id });
    } catch (error) {
      next(error);
    }
  }
);

reviewsRouter.get("/:productId/reviews", async (req, res, next) => {
  try {
    const reviewsList = await ReviewModel.find();
    res.status(200).send(reviewsList);
  } catch (error) {
    next(error);
  }
});

reviewsRouter.get(
  "/:productId/reviews/:reviewId",
  triggerBadRequest,
  async (req, res, next) => {
    try {
      const review = await ReviewModel.findById(req.params.reviewId);
      if (review) {
        res.status(200).send(review);
      } else {
        next(
          createHttpError(
            404,
            `Review with the id ${req.params.reviewId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

reviewsRouter.put(
  "/:productId/reviews/:reviewId",
  triggerBadRequest,
  async (req, res, next) => {
    try {
      const reviewToEdit = await ReviewModel.findByIdAndUpdate(
        req.params.reviewId,
        req.body,
        { new: true, runValidators: true }
      );
      if (reviewToEdit) {
        res.status(200).send(reviewToEdit);
      } else {
        createHttpError(404, `Review with the id ${req.params.id} not found!`);
      }
    } catch (error) {
      next(error);
    }
  }
);

reviewsRouter.delete(
  "/:productId/reviews/:reviewId",
  async (req, res, next) => {
    try {
      const reviewToDelete = await ReviewModel.findByIdAndDelete(
        req.params.reviewId
      );
      await ProductModel.findByIdAndUpdate(
        req.params.productId,
        { $pull: { reviews: req.params.reviewId } },
        { new: true, runValidators: true }
      );
      if (reviewToDelete) {
        res.status(204).send();
      } else {
        next(
          createHttpError(404, `Review with id ${req.params.id} not found!`)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default reviewsRouter;
