import Express from "express";
import { nanoid } from "nanoid";
import createHttpError from "http-errors";
import { checkReviewsSchema, triggerBadRequest } from "./validator.js";
import { getReviews, writeReviews } from "../../lib/fs-tools.js";

const reviewsRouter = Express.Router();

reviewsRouter.post(
  "/:productId/reviews",
  checkReviewsSchema,
  triggerBadRequest,
  async (req, res, next) => {
    try {
      console.log("test");
      const newReview = {
        ...req.body,
        id: nanoid(),
        productId: req.params.productId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log(newReview);
      const reviewList = await getReviews();
      reviewList.push(newReview);
      await writeReviews(reviewList);
      res.status(201).send({ id: newReview.id });
    } catch (error) {
      next(error);
    }
  }
);

reviewsRouter.get("/:productId/reviews", async (req, res, next) => {
  try {
    const reviewsList = await getReviews();
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
      const reviewsList = await getReviews();
      const review = reviewsList.find(
        (review) => review.id === req.params.reviewId
      );
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
      const reviewList = await getReviews();
      const index = reviewList.findIndex(
        (review) => review.id === req.params.reviewId
      );
      if (index !== -1) {
        const oldReview = reviewList[index];
        const updatedReview = {
          ...oldReview,
          ...req.body,
          updatedAt: new Date(),
        };

        reviewList[index] = updatedReview;
        await writeReviews(reviewList);
        res.status(200).send(updatedReview);
      } else {
        createHttpError(
          404,
          `Review with the id ${req.params.reviewId} not found!`
        );
      }
    } catch (error) {}
  }
);

reviewsRouter.delete(
  "/:productId/reviews/:reviewId",
  async (req, res, next) => {
    try {
      const reviewList = await getReviews();
      const updatedReviewList = reviewList.filter(
        (review) => review.id !== req.params.reviewId
      );
      if (reviewList.length !== updatedReviewList.length) {
        writeReviews(updatedReviewList);
        res.status(204).send();
      } else {
        next(
          createHttpError(
            404,
            `Review with id ${req.params.reviewId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default reviewsRouter;
