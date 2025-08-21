# Inventory Management Routes for Jobber Pro
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from inventory_models import (
    InventoryItem, InventoryItemCreate, InventoryItemUpdate,
    StockMovement, StockMovementCreate,
    JobPartUsage, JobPartUsageCreate,
    PurchaseOrder, PurchaseOrderCreate,
    LowStockAlert, InventoryAnalytics
)

# This will be integrated into the main server.py
inventory_router = APIRouter()

# Helper function to convert MongoDB documents to JSON-serializable format
def convert_objectid_to_str(doc):
    """Convert MongoDB ObjectId fields to strings"""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [convert_objectid_to_str(item) for item in doc]
    if isinstance(doc, dict):
        result = {}
        for key, value in doc.items():
            if isinstance(value, ObjectId):
                result[key] = str(value)
            elif isinstance(value, dict):
                result[key] = convert_objectid_to_str(value)
            elif isinstance(value, list):
                result[key] = convert_objectid_to_str(value)
            else:
                result[key] = value
        return result
    return doc

# Dependency to get database and user info would be imported from main server.py

# Inventory Items Endpoints
async def create_inventory_item(
    item_data: InventoryItemCreate,
    db: AsyncIOMotorDatabase,
    user: dict
):
    """Create a new inventory item"""
    try:
        # Generate SKU if not provided
        if not item_data.sku:
            # Generate SKU based on category and name
            sku_prefix = item_data.category[:3].upper()
            sku_number = await _get_next_sku_number(db, user['company_id'], sku_prefix)
            item_data.sku = f"{sku_prefix}-{sku_number:04d}"
        
        # Check if SKU already exists
        existing_item = await db.inventory_items.find_one({
            "company_id": user['company_id'],
            "sku": item_data.sku
        })
        if existing_item:
            raise HTTPException(
                status_code=400, 
                detail="SKU already exists"
            )
        
        # Create inventory item
        inventory_item = InventoryItem(
            **item_data.dict(),
            company_id=user['company_id']
        )
        
        await db.inventory_items.insert_one(inventory_item.dict())
        
        # Create initial stock movement if stock_quantity > 0
        if item_data.stock_quantity > 0:
            stock_movement = StockMovement(
                company_id=user['company_id'],
                inventory_item_id=inventory_item.id,
                movement_type="in",
                quantity=item_data.stock_quantity,
                previous_quantity=0,
                new_quantity=item_data.stock_quantity,
                reference_type="initial_stock",
                unit_cost=item_data.unit_cost,
                notes="Initial stock entry",
                created_by=user['id']
            )
            await db.stock_movements.insert_one(stock_movement.dict())
        
        return inventory_item
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def get_inventory_items(
    db: AsyncIOMotorDatabase,
    user: dict,
    category: Optional[str] = None,
    search: Optional[str] = None,
    low_stock: bool = False,
    skip: int = 0,
    limit: int = 100
):
    """Get inventory items with filtering"""
    try:
        query = {"company_id": user['company_id'], "is_active": True}
        
        if category:
            query["category"] = category
        
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"sku": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}}
            ]
        
        if low_stock:
            query["$expr"] = {"$lte": ["$stock_quantity", "$min_stock_level"]}
        
        cursor = db.inventory_items.find(query).skip(skip).limit(limit)
        items = await cursor.to_list(length=limit)
        
        # Convert ObjectIds to strings
        items = convert_objectid_to_str(items)
        
        # Get total count
        total = await db.inventory_items.count_documents(query)
        
        return {
            "items": items,
            "total": total,
            "skip": skip,
            "limit": limit
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def get_inventory_item(
    item_id: str,
    db: AsyncIOMotorDatabase,
    user: dict
):
    """Get a specific inventory item"""
    try:
        item = await db.inventory_items.find_one({
            "id": item_id,
            "company_id": user['company_id']
        })
        
        if not item:
            raise HTTPException(status_code=404, detail="Inventory item not found")
        
        # Get recent movements for this item
        movements = await db.stock_movements.find({
            "inventory_item_id": item_id,
            "company_id": user['company_id']
        }).sort("created_at", -1).limit(10).to_list(length=10)
        
        # Convert ObjectIds to strings
        item = convert_objectid_to_str(item)
        movements = convert_objectid_to_str(movements)
        
        item["recent_movements"] = movements
        return item
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def update_inventory_item(
    item_id: str,
    item_data: InventoryItemUpdate,
    db: AsyncIOMotorDatabase,
    user: dict
):
    """Update an inventory item"""
    try:
        # Check if item exists
        existing_item = await db.inventory_items.find_one({
            "id": item_id,
            "company_id": user['company_id']
        })
        if not existing_item:
            raise HTTPException(status_code=404, detail="Inventory item not found")
        
        # Update data
        update_data = {k: v for k, v in item_data.dict().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        await db.inventory_items.update_one(
            {"id": item_id, "company_id": user['company_id']},
            {"$set": update_data}
        )
        
        # Get updated item
        updated_item = await db.inventory_items.find_one({
            "id": item_id,
            "company_id": user['company_id']
        })
        
        # Convert ObjectIds to strings
        updated_item = convert_objectid_to_str(updated_item)
        
        return updated_item
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Stock Movement Endpoints
async def create_stock_movement(
    movement_data: StockMovementCreate,
    db: AsyncIOMotorDatabase,
    user: dict
):
    """Create a stock movement (adjust inventory)"""
    try:
        # Get current inventory item
        item = await db.inventory_items.find_one({
            "id": movement_data.inventory_item_id,
            "company_id": user['company_id']
        })
        if not item:
            raise HTTPException(status_code=404, detail="Inventory item not found")
        
        current_quantity = item.get("stock_quantity", 0)
        
        # Calculate new quantity based on movement type
        if movement_data.movement_type == "in":
            new_quantity = current_quantity + movement_data.quantity
        elif movement_data.movement_type == "out":
            new_quantity = current_quantity - movement_data.quantity
            if new_quantity < 0:
                raise HTTPException(
                    status_code=400, 
                    detail="Insufficient stock quantity"
                )
        elif movement_data.movement_type == "adjustment":
            new_quantity = movement_data.quantity
        else:
            raise HTTPException(status_code=400, detail="Invalid movement type")
        
        # Create stock movement record
        stock_movement = StockMovement(
            **movement_data.dict(),
            company_id=user['company_id'],
            previous_quantity=current_quantity,
            new_quantity=new_quantity,
            created_by=user['id']
        )
        
        await db.stock_movements.insert_one(stock_movement.dict())
        
        # Update inventory item quantity
        await db.inventory_items.update_one(
            {"id": movement_data.inventory_item_id, "company_id": user['company_id']},
            {
                "$set": {
                    "stock_quantity": new_quantity,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # Check for low stock and create alert if needed
        if new_quantity <= item.get("min_stock_level", 0):
            await _create_low_stock_alert(db, user['company_id'], movement_data.inventory_item_id, new_quantity, item.get("min_stock_level", 0))
        
        return stock_movement
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def get_stock_movements(
    db: AsyncIOMotorDatabase,
    user: dict,
    item_id: Optional[str] = None,
    movement_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    """Get stock movements with filtering"""
    try:
        query = {"company_id": user['company_id']}
        
        if item_id:
            query["inventory_item_id"] = item_id
        
        if movement_type:
            query["movement_type"] = movement_type
        
        cursor = db.stock_movements.find(query).sort("created_at", -1).skip(skip).limit(limit)
        movements = await cursor.to_list(length=limit)
        
        # Convert ObjectIds to strings
        movements = convert_objectid_to_str(movements)
        
        # Enrich with item details
        for movement in movements:
            item = await db.inventory_items.find_one({
                "id": movement["inventory_item_id"],
                "company_id": user['company_id']
            })
            movement["item_name"] = item.get("name", "Unknown") if item else "Unknown"
            movement["item_sku"] = item.get("sku", "") if item else ""
        
        total = await db.stock_movements.count_documents(query)
        
        return {
            "movements": movements,
            "total": total,
            "skip": skip,
            "limit": limit
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Job Parts Usage Endpoints
async def create_job_part_usage(
    usage_data: JobPartUsageCreate,
    db: AsyncIOMotorDatabase,
    user: dict
):
    """Record parts usage for a job"""
    try:
        # Verify job exists and belongs to company
        job = await db.jobs.find_one({
            "id": usage_data.job_id,
            "company_id": user['company_id']
        })
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Get inventory item
        item = await db.inventory_items.find_one({
            "id": usage_data.inventory_item_id,
            "company_id": user['company_id']
        })
        if not item:
            raise HTTPException(status_code=404, detail="Inventory item not found")
        
        # Check stock availability
        if item.get("stock_quantity", 0) < usage_data.quantity_used:
            raise HTTPException(status_code=400, detail="Insufficient stock")
        
        # Use selling price if unit_price not provided
        unit_price = usage_data.unit_price or item.get("selling_price", 0)
        
        # Create job part usage record
        usage_dict = usage_data.dict()
        usage_dict.pop('unit_price', None)  # Remove unit_price from dict to avoid conflict
        job_usage = JobPartUsage(
            **usage_dict,
            company_id=user['company_id'],
            unit_price=unit_price,
            total_cost=unit_price * usage_data.quantity_used
        )
        
        await db.job_parts_usage.insert_one(job_usage.dict())
        
        # Create stock movement for parts used
        stock_movement = StockMovement(
            company_id=user['company_id'],
            inventory_item_id=usage_data.inventory_item_id,
            movement_type="out",
            quantity=usage_data.quantity_used,
            previous_quantity=item.get("stock_quantity", 0),
            new_quantity=item.get("stock_quantity", 0) - usage_data.quantity_used,
            reference_id=usage_data.job_id,
            reference_type="job",
            unit_cost=item.get("unit_cost"),
            notes=f"Parts used for job {job.get('title', '')}",
            created_by=user['id']
        )
        
        await db.stock_movements.insert_one(stock_movement.dict())
        
        # Update inventory stock
        await db.inventory_items.update_one(
            {"id": usage_data.inventory_item_id, "company_id": user['company_id']},
            {
                "$inc": {"stock_quantity": -usage_data.quantity_used},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        return job_usage
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def get_job_parts_usage(
    job_id: str,
    db: AsyncIOMotorDatabase,
    user: dict
):
    """Get parts usage for a specific job"""
    try:
        usage_records = await db.job_parts_usage.find({
            "job_id": job_id,
            "company_id": user['company_id']
        }).to_list(length=None)
        
        # Convert ObjectIds to strings
        usage_records = convert_objectid_to_str(usage_records)
        
        # Enrich with item details
        for usage in usage_records:
            item = await db.inventory_items.find_one({
                "id": usage["inventory_item_id"],
                "company_id": user['company_id']
            })
            if item:
                usage["item_name"] = item.get("name")
                usage["item_sku"] = item.get("sku")
        
        return usage_records
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Low Stock Alerts
async def get_low_stock_alerts(
    db: AsyncIOMotorDatabase,
    user: dict,
    acknowledged: Optional[bool] = None
):
    """Get low stock alerts"""
    try:
        query = {"company_id": user['company_id']}
        if acknowledged is not None:
            query["is_acknowledged"] = acknowledged
        
        alerts = await db.low_stock_alerts.find(query).sort("alert_date", -1).to_list(length=None)
        
        # Convert ObjectIds to strings
        alerts = convert_objectid_to_str(alerts)
        
        # Enrich with item details
        for alert in alerts:
            item = await db.inventory_items.find_one({
                "id": alert["inventory_item_id"],
                "company_id": user['company_id']
            })
            if item:
                alert["item_name"] = item.get("name")
                alert["item_sku"] = item.get("sku")
                alert["current_stock"] = item.get("stock_quantity", 0)
        
        return alerts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def acknowledge_low_stock_alert(
    alert_id: str,
    db: AsyncIOMotorDatabase,
    user: dict
):
    """Acknowledge a low stock alert"""
    try:
        result = await db.low_stock_alerts.update_one(
            {"id": alert_id, "company_id": user['company_id']},
            {
                "$set": {
                    "is_acknowledged": True,
                    "acknowledged_by": user['id'],
                    "acknowledged_at": datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        return {"message": "Alert acknowledged"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Inventory Analytics
async def get_inventory_analytics(
    db: AsyncIOMotorDatabase,
    user: dict
):
    """Get inventory analytics and insights"""
    try:
        # Get all active inventory items
        items = await db.inventory_items.find({
            "company_id": user['company_id'],
            "is_active": True
        }).to_list(length=None)
        
        # Convert ObjectIds to strings
        items = convert_objectid_to_str(items)
        
        total_items = len(items)
        total_value = sum(item.get("stock_quantity", 0) * item.get("unit_cost", 0) for item in items)
        low_stock_items = sum(1 for item in items if item.get("stock_quantity", 0) <= item.get("min_stock_level", 0))
        out_of_stock_items = sum(1 for item in items if item.get("stock_quantity", 0) == 0)
        
        # Category breakdown
        category_breakdown = {}
        for item in items:
            category = item.get("category", "Other")
            category_breakdown[category] = category_breakdown.get(category, 0) + 1
        
        # Get recent movements summary (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        movements = await db.stock_movements.find({
            "company_id": user['company_id'],
            "created_at": {"$gte": thirty_days_ago}
        }).to_list(length=None)
        
        movement_summary = {}
        for movement in movements:
            movement_type = movement.get("movement_type", "other")
            movement_summary[movement_type] = movement_summary.get(movement_type, 0) + 1
        
        # Get top used items (based on job usage)
        pipeline = [
            {"$match": {"company_id": user['company_id']}},
            {"$group": {
                "_id": "$inventory_item_id",
                "total_used": {"$sum": "$quantity_used"},
                "total_cost": {"$sum": "$total_cost"}
            }},
            {"$sort": {"total_used": -1}},
            {"$limit": 10}
        ]
        
        top_used_cursor = db.job_parts_usage.aggregate(pipeline)
        top_used_raw = await top_used_cursor.to_list(length=10)
        
        top_used_items = []
        for usage in top_used_raw:
            item = await db.inventory_items.find_one({
                "id": usage["_id"],
                "company_id": user['company_id']
            })
            if item:
                top_used_items.append({
                    "item_id": usage["_id"],
                    "item_name": item.get("name"),
                    "item_sku": item.get("sku"),
                    "total_used": usage["total_used"],
                    "total_cost": usage["total_cost"]
                })
        
        # Get recent movements for display
        recent_movements = await db.stock_movements.find({
            "company_id": user['company_id']
        }).sort("created_at", -1).limit(5).to_list(length=5)
        
        for movement in recent_movements:
            item = await db.inventory_items.find_one({
                "id": movement["inventory_item_id"],
                "company_id": user['company_id']
            })
            movement["item_name"] = item.get("name", "Unknown") if item else "Unknown"
        
        return InventoryAnalytics(
            total_items=total_items,
            total_value=total_value,
            low_stock_items=low_stock_items,
            out_of_stock_items=out_of_stock_items,
            top_used_items=top_used_items,
            category_breakdown=category_breakdown,
            movement_summary=movement_summary,
            recent_movements=recent_movements
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Helper Functions
async def _get_next_sku_number(db: AsyncIOMotorDatabase, company_id: str, prefix: str):
    """Get the next SKU number for a given prefix"""
    last_item = await db.inventory_items.find_one(
        {
            "company_id": company_id,
            "sku": {"$regex": f"^{prefix}-"}
        },
        sort=[("sku", -1)]
    )
    
    if last_item and last_item.get("sku"):
        try:
            last_number = int(last_item["sku"].split("-")[-1])
            return last_number + 1
        except (ValueError, IndexError):
            pass
    
    return 1

async def _create_low_stock_alert(db: AsyncIOMotorDatabase, company_id: str, item_id: str, current_quantity: int, min_level: int):
    """Create a low stock alert if one doesn't already exist"""
    existing_alert = await db.low_stock_alerts.find_one({
        "company_id": company_id,
        "inventory_item_id": item_id,
        "is_acknowledged": False
    })
    
    if not existing_alert:
        alert = LowStockAlert(
            company_id=company_id,
            inventory_item_id=item_id,
            current_quantity=current_quantity,
            min_stock_level=min_level
        )
        await db.low_stock_alerts.insert_one(alert.dict())