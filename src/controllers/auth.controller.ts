import { asyncHandler } from '../middlewares/async-handler';
import { AuthService } from '../services/auth.service';
import { ok } from '../responses/api-response';
import { HttpStatus } from '../constants/http-status';
import { MESSAGES } from '../constants/messages';
import { RegisterDTO } from '../dtos/auth/register.dto';
import { LoginDTO } from '../dtos/auth/login.dto';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = asyncHandler(async (req, res) => {
    const user = await this.authService.register(req.body as RegisterDTO);
    res.status(HttpStatus.CREATED).json(ok(user, MESSAGES.USER_REGISTERED));
  });

  login = asyncHandler(async (req, res) => {
    const result = await this.authService.login(req.body as LoginDTO);
    res.status(HttpStatus.OK).json(ok(result, MESSAGES.LOGIN_SUCCESS));
  });
}
