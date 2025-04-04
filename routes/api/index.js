const router = require("express").Router();

const productRouter = require("./product");
const userRouter = require("./user");
const entryRouter = require("./entry");
const servicingRouter = require("./servicing");
const expenseRouter = require("./expense");
const customerRouter = require("./customer");
const saleRouter = require("./sale");
const returnRouter = require("./return");
const web3Router = require("./web3");

router.use("/products", productRouter);
router.use("/users", userRouter);
router.use("/entries", entryRouter);
router.use("/servicing", servicingRouter);
router.use("/expenses", expenseRouter);
router.use("/customers", customerRouter);
router.use("/sales", saleRouter);
router.use("/returns", returnRouter);
router.use("/web3", web3Router);

module.exports = router;
