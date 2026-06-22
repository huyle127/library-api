import { UserView } from '../user/user-view.dto';

export interface AuthResponse {
  token: string;
  user: UserView;
}
