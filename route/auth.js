import express from 'express';
import { register, login, forgotPassword, resetPassword, validateResetToken} from '../controller/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/reset-password/:resetIdentifier', validateResetToken);
router.post('/reset-password/:resetIdentifier', resetPassword);

export default router;