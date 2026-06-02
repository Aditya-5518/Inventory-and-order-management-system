# StockFlow — Inventory & Order Management System

A full-stack inventory management system built with React, FastAPI, PostgreSQL, and Docker.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router, Axios |
| Backend | Python 3.12, FastAPI, SQLAlchemy |
| Database | PostgreSQL 16 |
| Containers | Docker, Docker Compose |
| Frontend Deploy | Vercel / Netlify |
| Backend Deploy | Render / Railway / Fly.io |

## Features

- **Products** — Create, read, update, delete with SKU uniqueness enforcement
- **Customers** — Register customers with unique email constraint
- **Orders** — Multi-item orders with automatic stock deduction and total calculation
- **Dashboard** — Live stats: total products, customers, orders, revenue, low-stock alerts
- **Business Rules** — Insufficient stock is rejected, cancelled orders restore stock

---

## Quick Start (Docker Compose)

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd inventory-system

# 2. Copy and configure env
cp .env.example .env
# Edit .env — change POSTGRES_PASSWORD at minimum

# 3. Start everything
docker compose up --build

# Frontend → http://localhost:3000
# Backend API → http://localhost:8000
# API Docs → http://localhost:8000/docs
```

---

## Local Development (Without Docker)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set database URL
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventory_db

# Run
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install

# Set API URL
echo "REACT_APP_API_URL=http://localhost:8000" > .env.local

npm start
```

---

## API Reference

### Products

| Method | Endpoint | Description |
|---|---|---|
| GET | `/products` | List all products |
| POST | `/products` | Create product |
| GET | `/products/{id}` | Get product |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |

### Customers

| Method | Endpoint | Description |
|---|---|---|
| GET | `/customers` | List all customers |
| POST | `/customers` | Create customer |
| GET | `/customers/{id}` | Get customer |
| DELETE | `/customers/{id}` | Delete customer |

### Orders

| Method | Endpoint | Description |
|---|---|---|
| GET | `/orders` | List all orders |
| POST | `/orders` | Create order |
| GET | `/orders/{id}` | Get order details |
| DELETE | `/orders/{id}` | Cancel order (restores stock) |

### Other

| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | Summary statistics |
| GET | `/health` | Health check |
| GET | `/docs` | Swagger UI |

---

## Deployment

### Backend → Render (free tier)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your repo, set root dir to `backend`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add a PostgreSQL database on Render and copy the connection string to `DATABASE_URL`

Or use the included `render.yaml` for Blueprint deployment.

### Frontend → Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project
3. Set root directory to `frontend`
4. Add environment variable: `REACT_APP_API_URL=https://your-render-backend.onrender.com`
5. Deploy

### Docker Hub (Backend Image)

```bash
docker build -t yourusername/stockflow-backend:latest ./backend
docker push yourusername/stockflow-backend:latest
```

---

## Business Logic

- **SKU** must be unique across all products
- **Customer email** must be unique
- **Stock** can never go negative; orders are rejected if insufficient
- **Creating an order** automatically deducts stock for each line item
- **Cancelling an order** automatically restores stock
- **Order total** is computed server-side from current product prices at time of order

---

## Project Structure

```
inventory-system/
├── backend/
│   ├── main.py          # FastAPI app & routes
│   ├── models.py        # SQLAlchemy ORM models
│   ├── schemas.py       # Pydantic validation schemas
│   ├── crud.py          # Database operations
│   ├── database.py      # DB connection & session
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── src/
│   │   ├── App.js       # Root with routing & sidebar
│   │   ├── App.css      # Design system & global styles
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── Products.js
│   │   │   ├── Customers.js
│   │   │   └── Orders.js
│   │   └── utils/api.js # Axios API helpers
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── render.yaml
├── .env.example
└── README.md
```
