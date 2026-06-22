import 'dotenv/config';
import * as jwt from 'jsonwebtoken';

const BASE = 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me';

type ApiResult = {
  status: number;
  body: any;
};

const api = async (
  method: string,
  path: string,
  opts: { token?: string; body?: unknown } = {},
): Promise<ApiResult> => {
  const headers: Record<string, string> = {};
  if (opts.body) {
    headers['Content-Type'] = 'application/json';
  }
  if (opts.token) {
    headers['Authorization'] = `Bearer ${opts.token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  let body = null;
  try {
    body = await res.json();
  } catch {}

  return { status: res.status, body };
};

const check = (name: string, condition: boolean, details?: unknown) => {
  if (condition) {
    console.log(`✅ PASS: ${name}`);
  } else {
    console.log(`❌ FAIL: ${name}`);
    if (details !== undefined) {
      console.log('   ', JSON.stringify(details, null, 2));
    }
  }
};

const login = async (username: string, password: string): Promise<string | undefined> => {
  const res = await api('POST', '/auth/login', {
    body: { username, password },
  });
  return res.body?.data?.token;
};

const run = async () => {
  console.log(`\nTesting Authorization ${BASE}\n`);

  const adminToken = await login('admin', 'admin123');
  const ownerToken = await login('huy', 'huy123');
  const normalUsername = `user_${Date.now()}`;

  const registerResult = await api('POST', '/auth/register', {
    body: { username: normalUsername, password: 'user123' },
  });
  const normalToken = await login(normalUsername, 'user123');

  const duplicateRegister = await api('POST', '/auth/register', {
    body: { username: normalUsername, password: 'user123' },
  });

  const wrongPasswordLogin = await api('POST', '/auth/login', {
    body: { username: normalUsername, password: 'wrongpass' },
  });

  const unknownUserLogin = await api('POST', '/auth/login', {
    body: { username: 'unknown_user_12345', password: 'user123' },
  });

  const noTokenResponse = await api('POST', '/books', {
    body: {
      name: 'No Token Book',
      authorId: '00000000-0000-0000-0000-000000000000',
      categoryIds: ['00000000-0000-0000-0000-000000000000'],
      content: 'test',
      publishedDate: '2025-01-01',
    },
  });

  const invalidTokenResponse = await api('POST', '/books', {
    token: 'invalid.token.signature',
    body: {
      name: 'Invalid Token Book',
      authorId: '00000000-0000-0000-0000-000000000000',
      categoryIds: ['00000000-0000-0000-0000-000000000000'],
      content: 'test',
      publishedDate: '2025-01-01',
    },
  });

  const expiredToken = jwt.sign(
    { userId: '1', role: 'ADMIN' },
    JWT_SECRET,
    { expiresIn: '-1s' },
  );

  const expiredResponse = await api('POST', '/books', {
    token: expiredToken,
    body: {
      name: 'Expired Token Book',
      authorId: '00000000-0000-0000-0000-000000000000',
      categoryIds: ['00000000-0000-0000-0000-000000000000'],
      content: 'test',
      publishedDate: '2025-01-01',
    },
  });

  check('ADMIN login có token', !!adminToken, { token: !!adminToken });
  check('OWNER login có token', !!ownerToken, { token: !!ownerToken });
  check(
    'USER thường đăng ký và login thành công',
    registerResult.status === 201 && !!normalToken,
    { registerResult: registerResult.body, token: !!normalToken },
  );
  check('Đăng ký trùng username trả 409', duplicateRegister.status === 409, { body: duplicateRegister.body });
  check('Login sai password trả 401', wrongPasswordLogin.status === 401, { body: wrongPasswordLogin.body });
  check('Login user không tồn tại trả 401', unknownUserLogin.status === 401, { body: unknownUserLogin.body });
  check('Endpoint protected không có token trả 401', noTokenResponse.status === 401 && noTokenResponse.body?.message === 'Authorization token is missing', { body: noTokenResponse.body });
  check('Invalid token trả 401', invalidTokenResponse.status === 401 && invalidTokenResponse.body?.message === 'Invalid or expired token', { body: invalidTokenResponse.body });
  check('Expired token trả 401', expiredResponse.status === 401 && expiredResponse.body?.message === 'Invalid or expired token', { body: expiredResponse.body });

  const authors = await api('GET', '/authors');
  const categories = await api('GET', '/categories');
  const firstAuthorId = authors.body?.data?.[0]?.id;
  const firstCategoryId = categories.body?.data?.[0]?.id;

  check(
    'lấy authors thành công',
    authors.status === 200 && typeof firstAuthorId === 'string',
    { authors: authors.body },
  );
  check(
    'lấy categories thành công',
    categories.status === 200 && typeof firstCategoryId === 'string',
    { categories: categories.body },
  );

  const ownerCreateBook = await api('POST', '/books', {
    token: ownerToken,
    body: {
      name: 'Owner Book',
      authorId: firstAuthorId,
      categoryIds: [firstCategoryId],
      content: 'Owner book content',
      publishedDate: '2025-01-01',
    },
  });

  const ownerCreateBookToDelete = await api('POST', '/books', {
    token: ownerToken,
    body: {
      name: 'Owner Book To Delete',
      authorId: firstAuthorId,
      categoryIds: [firstCategoryId],
      content: 'Owner book delete content',
      publishedDate: '2025-01-02',
    },
  });

  const normalCreateBook = await api('POST', '/books', {
    token: normalToken,
    body: {
      name: 'User Book',
      authorId: firstAuthorId,
      categoryIds: [firstCategoryId],
      content: 'User book content',
      publishedDate: '2025-01-01',
    },
  });

  check('OWNER tạo book', ownerCreateBook.status === 201, { body: ownerCreateBook.body });
  check('OWNER tạo book để xóa', ownerCreateBookToDelete.status === 201, { body: ownerCreateBookToDelete.body });
  check('USER thường tạo book', normalCreateBook.status === 201, { body: normalCreateBook.body });

  const ownerBookId = ownerCreateBook.body?.data?.id;
  const ownerDeleteBookId = ownerCreateBookToDelete.body?.data?.id;
  const normalBookId = normalCreateBook.body?.data?.id;

  const publicGetBooks = await api('GET', '/books');
  check('Bất kỳ người dùng có thể get sách', publicGetBooks.status === 200, { body: publicGetBooks.body });

  const ownerUpdateOwn = await api('PUT', `/books/${ownerBookId}`, {
    token: ownerToken,
    body: { name: 'Owner Book Updated' },
  });
  check('OWNER cập nhật sách của mình', ownerUpdateOwn.status === 200, { body: ownerUpdateOwn.body });

  const normalUpdateOwnerBook = await api('PUT', `/books/${ownerBookId}`, {
    token: normalToken,
    body: { name: 'USER cập nhật sách của owner' },
  });
  check(
    'USER thường không được cập nhật sách của owner',
    normalUpdateOwnerBook.status === 403,
    { body: normalUpdateOwnerBook.body },
  );

  const normalDeleteOwnerBook = await api('DELETE', `/books/${ownerBookId}`, {
    token: normalToken,
  });
  check(
    'USER thường không được xóa sách của owner',
    normalDeleteOwnerBook.status === 403,
    { body: normalDeleteOwnerBook.body },
  );

  const ownerDeleteOwn = await api('DELETE', `/books/${ownerBookId}`, {
    token: ownerToken,
  });
  check('OWNER tự xóa sách của mình', ownerDeleteOwn.status === 204, { body: ownerDeleteOwn.body });

  const ownerDeleteOwnAgain = await api('DELETE', `/books/${ownerBookId}`, {
    token: ownerToken,
  });
  check('OWNER xóa sách đã bị xóa trả 404', ownerDeleteOwnAgain.status === 404, { body: ownerDeleteOwnAgain.body });

  const normalUpdateOwn = await api('PUT', `/books/${normalBookId}`, {
    token: normalToken,
    body: { name: 'User Book Updated' },
  });
  check('USER cập nhật sách của mình', normalUpdateOwn.status === 200, { body: normalUpdateOwn.body });

  const noTokenPutBook = await api('PUT', `/books/${normalBookId}`, {
    body: { name: 'No Token Update' },
  });
  check('PUT /books/:id không có token trả 401', noTokenPutBook.status === 401 && noTokenPutBook.body?.message === 'Authorization token is missing', { body: noTokenPutBook.body });

  const adminUpdateOwnerBook = await api('PUT', `/books/${ownerBookId}`, {
    token: adminToken,
    body: { name: 'Admin Updated Owner Book' },
  });
  check('ADMIN cập nhật sách của owner', adminUpdateOwnerBook.status === 200, { body: adminUpdateOwnerBook.body });

  const adminDeleteOwnerBook = await api('DELETE', `/books/${ownerBookId}`, {
    token: adminToken,
  });
  check('ADMIN xóa sách của owner', adminDeleteOwnerBook.status === 204, { body: adminDeleteOwnerBook.body });

  const normalDeleteOwn = await api('DELETE', `/books/${normalBookId}`, {
    token: normalToken,
  });
  check('USER xóa sách của mình', normalDeleteOwn.status === 204, { body: normalDeleteOwn.body });

  const adminCreateCategory = await api('POST', '/categories', {
    token: adminToken,
    body: { name: `Admin Category ${Date.now()}` },
  });
  const categoryId = adminCreateCategory.body?.data?.id;

  check('ADMIN tạo category', adminCreateCategory.status === 201, { body: adminCreateCategory.body });

  const adminUpdateCategory = await api('PUT', `/categories/${categoryId}`, {
    token: adminToken,
    body: { name: `Admin Category Updated ${Date.now()}` },
  });
  check('ADMIN cập nhật category', adminUpdateCategory.status === 200, { body: adminUpdateCategory.body });

  const adminDeleteCategory = await api('DELETE', `/categories/${categoryId}`, {
    token: adminToken,
  });
  check('ADMIN xóa category', adminDeleteCategory.status === 204, { body: adminDeleteCategory.body });

  const userCreateCategory = await api('POST', '/categories', {
    token: normalToken,
    body: { name: 'User Category' },
  });
  check('USER thường không được tạo category', userCreateCategory.status === 403, { body: userCreateCategory.body });

  const userUpdateCategory = await api('PUT', `/categories/${firstCategoryId}`, {
    token: normalToken,
    body: { name: 'User Update Category' },
  });
  check('USER thường không được cập nhật category', userUpdateCategory.status === 403, { body: userUpdateCategory.body });

  const userDeleteCategory = await api('DELETE', `/categories/${firstCategoryId}`, {
    token: normalToken,
  });
  check('USER thường không được xóa category', userDeleteCategory.status === 403, { body: userDeleteCategory.body });

  const ownerCreateCategory = await api('POST', '/categories', {
    token: ownerToken,
    body: { name: 'Owner Category' },
  });
  check('OWNER (USER role) không được tạo category', ownerCreateCategory.status === 403, { body: ownerCreateCategory.body });

  console.log('\nAuthorization test run completed');
};

run();
