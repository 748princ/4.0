# Inventory Management Models for Jobber Pro
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

# Inventory Item Models
class InventoryItemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: str  # parts, supplies, tools, equipment
    sku: Optional[str] = None
    supplier_name: Optional[str] = None
    supplier_contact: Optional[str] = None
    unit_cost: float = 0.0
    selling_price: float = 0.0
    stock_quantity: int = 0
    min_stock_level: int = 0
    max_stock_level: Optional[int] = None
    location: Optional[str] = None
    barcode: Optional[str] = None
    is_active: bool = True
    notes: Optional[str] = None

class InventoryItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    sku: Optional[str] = None
    supplier_name: Optional[str] = None
    supplier_contact: Optional[str] = None
    unit_cost: Optional[float] = None
    selling_price: Optional[float] = None
    stock_quantity: Optional[int] = None
    min_stock_level: Optional[int] = None
    max_stock_level: Optional[int] = None
    location: Optional[str] = None
    barcode: Optional[str] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None

class InventoryItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    name: str
    description: Optional[str] = None
    category: str
    sku: Optional[str] = None
    supplier_name: Optional[str] = None
    supplier_contact: Optional[str] = None
    unit_cost: float = 0.0
    selling_price: float = 0.0
    stock_quantity: int = 0
    min_stock_level: int = 0
    max_stock_level: Optional[int] = None
    location: Optional[str] = None
    barcode: Optional[str] = None
    is_active: bool = True
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Stock Movement Models
class StockMovementCreate(BaseModel):
    inventory_item_id: str
    movement_type: str  # in, out, adjustment, transfer
    quantity: int
    reference_id: Optional[str] = None  # job_id, purchase_order_id, etc.
    reference_type: Optional[str] = None  # job, purchase_order, adjustment
    unit_cost: Optional[float] = None
    notes: Optional[str] = None

class StockMovement(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    inventory_item_id: str
    movement_type: str
    quantity: int
    previous_quantity: int
    new_quantity: int
    reference_id: Optional[str] = None
    reference_type: Optional[str] = None
    unit_cost: Optional[float] = None
    notes: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Job Parts Usage Models
class JobPartUsageCreate(BaseModel):
    job_id: str
    inventory_item_id: str
    quantity_used: int
    unit_price: Optional[float] = None
    notes: Optional[str] = None

class JobPartUsage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    job_id: str
    inventory_item_id: str
    quantity_used: int
    unit_price: float
    total_cost: float
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Purchase Order Models
class PurchaseOrderItemCreate(BaseModel):
    inventory_item_id: str
    quantity: int
    unit_cost: float
    notes: Optional[str] = None

class PurchaseOrderCreate(BaseModel):
    supplier_name: str
    supplier_contact: Optional[str] = None
    expected_delivery_date: Optional[datetime] = None
    items: List[PurchaseOrderItemCreate]
    notes: Optional[str] = None

class PurchaseOrderItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    purchase_order_id: str
    inventory_item_id: str
    quantity: int
    unit_cost: float
    total_cost: float
    received_quantity: int = 0
    notes: Optional[str] = None

class PurchaseOrder(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    po_number: str
    supplier_name: str
    supplier_contact: Optional[str] = None
    status: str = "pending"  # pending, ordered, received, cancelled
    order_date: datetime = Field(default_factory=datetime.utcnow)
    expected_delivery_date: Optional[datetime] = None
    received_date: Optional[datetime] = None
    total_amount: float = 0.0
    items: List[PurchaseOrderItem] = []
    notes: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Low Stock Alert Model
class LowStockAlert(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    inventory_item_id: str
    current_quantity: int
    min_stock_level: int
    alert_date: datetime = Field(default_factory=datetime.utcnow)
    is_acknowledged: bool = False
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None

# Inventory Analytics Models
class InventoryAnalytics(BaseModel):
    total_items: int
    total_value: float
    low_stock_items: int
    out_of_stock_items: int
    top_used_items: List[Dict[str, Any]]
    category_breakdown: Dict[str, int]
    movement_summary: Dict[str, int]
    recent_movements: List[Dict[str, Any]]