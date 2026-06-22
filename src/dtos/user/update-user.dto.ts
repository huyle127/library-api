// Cập nhật hồ sơ: KHÔNG còn role ở đây. Đổi role đi qua endpoint riêng PUT /:id/role.
export interface UpdateUserDTO {
  username?: string;
  password?: string;
}
