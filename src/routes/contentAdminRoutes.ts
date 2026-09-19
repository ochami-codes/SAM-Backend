import { Router } from "express";

import { authenticate } from "../middleware/authenticate.ts";
import { authorize } from "../middleware/authorize.ts";

import {
  getContentController,
  updateContentController,
  deleteContentController,
  listContentController,
} from "../controllers/contentAdminController.ts";

const router = Router();

router.use(authenticate);
router.use(authorize("super_admin"));

router.get("/", listContentController);
router.get(
  "/:section/:slug",
  getContentController
);

router.get(
  "/:section/:category/:slug",
  getContentController
);

router.put(
  "/:section/:slug",
  updateContentController
);

router.put(
  "/:section/:category/:slug",
  updateContentController
);

router.delete(
  "/:section/:slug",
  deleteContentController
);

router.delete(
  "/:section/:category/:slug",
  deleteContentController
);

export default router;
