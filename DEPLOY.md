# Frontend Docker

```bash
# Up BE trước (tạo network badminton)
docker compose up -d --build
```

- Port host: `8080` → container `80`
- Proxy host: `spt.pnmn.click` → `http://127.0.0.1:8080`

Xem thêm: repo BE `DEPLOY.md`.
