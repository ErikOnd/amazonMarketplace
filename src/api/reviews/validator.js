import { checkSchema, validationResult } from "express-validator";
import createHttpError from "http-errors";

const reviewsSchema = {
  comment: {
    in: ["body"],
    isString: {
      errorMessage: "Comment is a mandatory field and needs to be a string!",
    },
  },
  rate: {
    in: ["body"],
    isNumeric: {
      errorMessage: "Rating is a mandatory field and needs to be a number!",
    },
  },
};

export const checkReviewsSchema = checkSchema(reviewsSchema);

export const triggerBadRequest = (req, res, next) => {
  const errors = validationResult(req);

  console.log(errors.array());

  if (errors.isEmpty()) {
    next();
  } else {
    next(
      createHttpError(400, "Errors during review validation", {
        errorsList: errors.array(),
      })
    );
  }
};
