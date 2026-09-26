import { Router } from "express"; import { getCategories } from "./categories.controller.js"; export const categoriesRouter=Router(); categoriesRouter.get("/", getCategories);
