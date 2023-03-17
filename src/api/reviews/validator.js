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
    isInt: {
      options: { min: 1, max: 5 },
      errorMessage:
        "Rating is a mandatory field and needs to be a number between 1 and 5!",
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
