import { Router } from 'express';
import authRoutes from './auth.routes';
import bookRoutes from './book.routes';
import authorRoutes from './author.routes';
import categoryRoutes from './category.routes';
import userRoutes from './user.routes'
const router = Router();

router.use('/auth', authRoutes);
router.use('/books', bookRoutes);
router.use('/authors', authorRoutes);
router.use('/categories', categoryRoutes);
router.use('/users', userRoutes);

export default router