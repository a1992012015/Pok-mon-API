import express from 'express';
const router = express.Router();

/* GET home page. */
const indexRouter = router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express Hello', name: '赵春梅' });
});

export default indexRouter;
