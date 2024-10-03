const Router = require('express').Router;
const { body } = require('express-validator');
const UsersController = require('../controllers/user-controller');
const authMiddleware = require('../middlewares/auth-middleware');

const router = new Router();

router.post(
  '/registration',
  body('email').isEmail(),
  body('password').isLength({ min: 3, max: 32 }),
  UsersController.registration.bind(UsersController)
);
router.post('/login', UsersController.login.bind(UsersController));
router.post('/logout', UsersController.logout.bind(UsersController));
router.get('/activate/:link', UsersController.activate.bind(UsersController));
router.get('/refresh', UsersController.refresh.bind(UsersController));
router.get('/users', authMiddleware, UsersController.getUsers.bind(UsersController));

module.exports = router;
