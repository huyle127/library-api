# Library API (Express + TypeScript)

In-memory library API. Books, authors, categories seeded from JSON into RAM.

## Run
```
npm install
npm run dev      # dev (hot reload)
npm run build    # compile to dist/
npm start        # run compiled build
```
Server: http://localhost:3000

## Endpoints
- GET    /books?categoryId=&authorId=&page=&limit=&sortCreatedDate=asc&sortPublishedDate=desc
- GET    /books/:id
- POST   /books
- PUT    /books/:id
- DELETE /books/:id
- GET    /authors        GET /authors/:id
- GET    /categories     GET /categories/:id
