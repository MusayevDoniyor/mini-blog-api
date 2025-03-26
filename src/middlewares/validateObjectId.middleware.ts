import { NextFunction, Request, Response } from "express";
import { response } from "../utils/helper.js";
import { isValidObjectId } from "mongoose";

export default function validateObjectId(paramNames = ["id"]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!Array.isArray(paramNames)) paramNames = [paramNames];

    for (const paramname of paramNames) {
      const id =
        req.query[paramname] || req.body[paramname] || req.params[paramname];

      if (!id)
        return response({
          res,
          status: 400,
          error: `${paramname} is required`,
        });

      if (!isValidObjectId(id))
        return response({
          res,
          status: 400,
          error: `Invalid ${paramname} format`,
        });
    }

    next();
  };
}
