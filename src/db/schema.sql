
DROP TABLE IF EXISTS book_categories CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS authors CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username   TEXT NOT NULL UNIQUE,
  password   TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'MANAGER', 'ADMIN', 'SUPER_ADMIN')),
  created_at DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE authors (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL
);

CREATE TABLE categories (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL
);

CREATE TABLE books (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  content        TEXT NOT NULL,
  published_date DATE NOT NULL,
  created_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  author_id      UUID NOT NULL REFERENCES authors(id),
  created_by     UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT
);

-- Bảng nối nhiều-nhiều: 1 book có nhiều category, 1 category có nhiều book.
CREATE TABLE book_categories (
  book_id     UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, category_id)
);
