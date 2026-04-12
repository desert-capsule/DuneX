import { Router, type IRouter } from "express";
import healthRouter from "./health";
import studentsRouter from "./students";
import booksRouter from "./books";
import accountsRouter from "./accounts";
import reservationsRouter from "./reservations";
import settingsRouter from "./settings";
import maintenanceRouter from "./maintenance";
import reviewsRouter from "./reviews";

const router: IRouter = Router();

router.use(healthRouter);
router.use(studentsRouter);
router.use(booksRouter);
router.use(accountsRouter);
router.use(reservationsRouter);
router.use(settingsRouter);
router.use("/maintenance", maintenanceRouter);
router.use(reviewsRouter);

export default router;
