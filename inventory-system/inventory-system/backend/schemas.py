from pydantic import BaseModel, EmailStr, field_validator
from typing import List, Optional
from datetime import datetime

# ─── Product Schemas ────────────────────────────────────────────────────────

class ProductBase(BaseModel):
    name: str
    sku: str
    price: float
    quantity: int
    description: Optional[str] = None

    @field_validator("price")
    @classmethod
    def price_positive(cls, v):
        if v < 0:
            raise ValueError("Price cannot be negative")
        return v

    @field_validator("quantity")
    @classmethod
    def quantity_non_negative(cls, v):
        if v < 0:
            raise ValueError("Quantity cannot be negative")
        return v

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
    description: Optional[str] = None

    @field_validator("price")
    @classmethod
    def price_positive(cls, v):
        if v is not None and v < 0:
            raise ValueError("Price cannot be negative")
        return v

    @field_validator("quantity")
    @classmethod
    def quantity_non_negative(cls, v):
        if v is not None and v < 0:
            raise ValueError("Quantity cannot be negative")
        return v

class Product(ProductBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ─── Customer Schemas ───────────────────────────────────────────────────────

class CustomerBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ─── Order Schemas ──────────────────────────────────────────────────────────

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

    @field_validator("quantity")
    @classmethod
    def quantity_positive(cls, v):
        if v <= 0:
            raise ValueError("Quantity must be at least 1")
        return v

class OrderItemDetail(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    product: Optional[Product] = None

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate]

class Order(BaseModel):
    id: int
    customer_id: int
    total_amount: float
    status: str
    created_at: Optional[datetime] = None
    customer: Optional[Customer] = None
    items: List[OrderItemDetail] = []

    class Config:
        from_attributes = True
