import { Router } from 'express';
import { AuthorController } from '../controllers/author.controller';
import { AuthorService } from '../services/author.service';
import { AuthorRepository } from '../repositories/author.repository';
import { validateParams } from '../validation/validate.middleware';
import { idParamSchema } from '../validation/schemas/common.schema';

const router = Router();
const authorRepository = new AuthorRepository();
const authorService = new AuthorService(authorRepository);
const authorController = new AuthorController(authorService);

router.get('/', authorController.getAuthors);
router.get('/:id', validateParams(idParamSchema), authorController.getAuthorById);

export default router;
