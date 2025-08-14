from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from pathlib import Path
import os
import logging
import jwt
import bcrypt
import uuid
import smtplib
# Email imports commented out as they're not used in current implementation
# from email.mime.text import MimeText
# from email.mime.multipart import MimeMultipart
import stripe
from dotenv import load_dotenv
import json
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.pdfgen import canvas
import io

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT and security
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-super-secret-jwt-key-change-this-in-production')
JWT_ALGORITHM = 'HS256'
security = HTTPBearer()

# Stripe configuration
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY', 'sk_test_...')

# Create the main app
app = FastAPI(title="Jobber Pro API", description="Field Service Management SaaS Platform", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create router with /api prefix
api_router = APIRouter(prefix="/api")

# Pydantic Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    company_name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    company_id: str
    role: str = "admin"  # admin, manager, technician
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Company(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    subscription_status: str = "trial"  # trial, active, suspended
    subscription_plan: str = "basic"  # basic, professional, enterprise
    trial_ends_at: datetime = Field(default_factory=lambda: datetime.utcnow() + timedelta(days=14))
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ClientCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    address: str
    contact_person: Optional[str] = None

class Client(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: str
    address: str
    contact_person: Optional[str] = None
    company_id: str
    total_jobs: int = 0
    total_revenue: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class JobCreate(BaseModel):
    title: str
    description: Optional[str] = None
    client_id: str
    service_type: str
    priority: str = "medium"  # low, medium, high, urgent
    scheduled_date: datetime
    estimated_duration: int  # in minutes
    estimated_cost: float
    assigned_technician_id: Optional[str] = None

class Job(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    client_id: str
    service_type: str
    status: str = "scheduled"  # scheduled, in_progress, completed, cancelled
    priority: str = "medium"
    scheduled_date: datetime
    completed_date: Optional[datetime] = None
    estimated_duration: int
    actual_duration: Optional[int] = None
    estimated_cost: float
    actual_cost: Optional[float] = None
    assigned_technician_id: Optional[str] = None
    company_id: str
    photos: List[str] = []
    notes: List[Dict[str, Any]] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class InvoiceCreate(BaseModel):
    client_id: str
    job_ids: List[str]
    due_date: datetime
    tax_rate: float = 0.0
    discount_amount: float = 0.0
    notes: Optional[str] = None

class Invoice(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    invoice_number: str
    client_id: str
    job_ids: List[str]
    subtotal: float
    tax_amount: float
    discount_amount: float = 0.0
    total_amount: float
    status: str = "pending"  # pending, sent, paid, overdue
    due_date: datetime
    paid_date: Optional[datetime] = None
    notes: Optional[str] = None
    company_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Utility Functions
def hash_password(password: str) -> str:
    """Hash a password for storing."""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against its hash."""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from JWT token."""
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await db.users.find_one({"email": email})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def get_current_company(current_user: dict = Depends(get_current_user)):
    """Get current user's company."""
    company = await db.companies.find_one({"id": current_user["company_id"]})
    if company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return company

def generate_invoice_number() -> str:
    """Generate unique invoice number."""
    return f"INV-{datetime.utcnow().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"

# Authentication Routes
@api_router.post("/auth/register", response_model=dict)
async def register(user_data: UserCreate):
    """Register a new user and company."""
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create company
    company = Company(
        name=user_data.company_name,
        email=user_data.email,
        phone=user_data.phone
    )
    await db.companies.insert_one(company.dict())
    
    # Create user
    hashed_password = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        company_id=company.id,
        role="admin"
    )
    user_dict = user.dict()
    user_dict["password"] = hashed_password
    await db.users.insert_one(user_dict)
    
    # Create access token
    access_token = create_access_token(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "company_name": company.name
        }
    }

@api_router.post("/auth/login", response_model=dict)
async def login(user_data: UserLogin):
    """Login user."""
    user = await db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=401, detail="Account is disabled")
    
    # Get company info
    company = await db.companies.find_one({"id": user["company_id"]})
    
    access_token = create_access_token(data={"sub": user["email"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"],
            "company_name": company["name"] if company else "Unknown"
        }
    }

# Client Routes
@api_router.post("/clients", response_model=Client)
async def create_client(client_data: ClientCreate, current_user: dict = Depends(get_current_user)):
    """Create a new client."""
    client = Client(**client_data.dict(), company_id=current_user["company_id"])
    await db.clients.insert_one(client.dict())
    return client

@api_router.get("/clients", response_model=List[Client])
async def get_clients(current_user: dict = Depends(get_current_user)):
    """Get all clients for current company."""
    clients = await db.clients.find({"company_id": current_user["company_id"]}).to_list(1000)
    return clients

@api_router.get("/clients/{client_id}", response_model=Client)
async def get_client(client_id: str, current_user: dict = Depends(get_current_user)):
    """Get specific client."""
    client = await db.clients.find_one({"id": client_id, "company_id": current_user["company_id"]})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@api_router.put("/clients/{client_id}", response_model=Client)
async def update_client(client_id: str, client_data: ClientCreate, current_user: dict = Depends(get_current_user)):
    """Update client."""
    update_data = client_data.dict()
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.clients.update_one(
        {"id": client_id, "company_id": current_user["company_id"]},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
    
    updated_client = await db.clients.find_one({"id": client_id, "company_id": current_user["company_id"]})
    return updated_client

# Job Routes
@api_router.post("/jobs", response_model=Job)
async def create_job(job_data: JobCreate, current_user: dict = Depends(get_current_user)):
    """Create a new job."""
    job = Job(**job_data.dict(), company_id=current_user["company_id"])
    await db.jobs.insert_one(job.dict())
    return job

@api_router.get("/jobs", response_model=List[Job])
async def get_jobs(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all jobs for current company with optional filtering."""
    filter_dict = {"company_id": current_user["company_id"]}
    if status:
        filter_dict["status"] = status
    if priority:
        filter_dict["priority"] = priority
    
    jobs = await db.jobs.find(filter_dict).sort("scheduled_date", 1).to_list(1000)
    return jobs

@api_router.get("/jobs/{job_id}", response_model=Job)
async def get_job(job_id: str, current_user: dict = Depends(get_current_user)):
    """Get specific job."""
    job = await db.jobs.find_one({"id": job_id, "company_id": current_user["company_id"]})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@api_router.put("/jobs/{job_id}/status")
async def update_job_status(
    job_id: str, 
    status: str, 
    notes: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Update job status."""
    valid_statuses = ["scheduled", "in_progress", "completed", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    update_data = {
        "status": status,
        "updated_at": datetime.utcnow()
    }
    
    if status == "completed":
        update_data["completed_date"] = datetime.utcnow()
    
    if notes:
        update_data["$push"] = {
            "notes": {
                "text": notes,
                "created_by": current_user["full_name"],
                "created_at": datetime.utcnow()
            }
        }
    
    result = await db.jobs.update_one(
        {"id": job_id, "company_id": current_user["company_id"]},
        {"$set": update_data} if not notes else {"$set": {k: v for k, v in update_data.items() if k != "$push"}, **update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return {"message": "Job status updated successfully"}

# Invoice Routes
@api_router.post("/invoices", response_model=Invoice)
async def create_invoice(invoice_data: InvoiceCreate, current_user: dict = Depends(get_current_user)):
    """Create a new invoice."""
    # Calculate totals from jobs
    jobs = await db.jobs.find({
        "id": {"$in": invoice_data.job_ids},
        "company_id": current_user["company_id"]
    }).to_list(100)
    
    if len(jobs) != len(invoice_data.job_ids):
        raise HTTPException(status_code=400, detail="One or more jobs not found")
    
    subtotal = sum(job.get("actual_cost") or job.get("estimated_cost") or 0 for job in jobs)
    tax_amount = subtotal * invoice_data.tax_rate
    total_amount = subtotal + tax_amount - invoice_data.discount_amount
    
    invoice = Invoice(
        invoice_number=generate_invoice_number(),
        client_id=invoice_data.client_id,
        job_ids=invoice_data.job_ids,
        subtotal=subtotal,
        tax_amount=tax_amount,
        discount_amount=invoice_data.discount_amount,
        total_amount=total_amount,
        due_date=invoice_data.due_date,
        notes=invoice_data.notes,
        company_id=current_user["company_id"]
    )
    
    await db.invoices.insert_one(invoice.dict())
    return invoice

@api_router.get("/invoices", response_model=List[Invoice])
async def get_invoices(current_user: dict = Depends(get_current_user)):
    """Get all invoices for current company."""
    invoices = await db.invoices.find({"company_id": current_user["company_id"]}).to_list(1000)
    return invoices

def generate_invoice_pdf(invoice: dict, company: dict, client: dict, jobs: List[dict]) -> io.BytesIO:
    """Generate PDF for an invoice."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72, 
                           topMargin=72, bottomMargin=18)
    
    # Get styles
    styles = getSampleStyleSheet()
    story = []
    
    # Company Header
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        textColor=colors.HexColor('#1e40af')
    )
    
    story.append(Paragraph(f"{company['name']}", title_style))
    
    # Company info
    company_info = [
        f"Email: {company.get('email', 'Not provided')}",
        f"Phone: {company.get('phone', 'Not provided')}",
        f"Address: {company.get('address', 'Not provided')}"
    ]
    
    for info in company_info:
        story.append(Paragraph(info, styles['Normal']))
    
    story.append(Spacer(1, 20))
    
    # Invoice title
    invoice_title = ParagraphStyle(
        'InvoiceTitle',
        parent=styles['Heading2'],
        fontSize=18,
        spaceAfter=20
    )
    story.append(Paragraph(f"INVOICE #{invoice['invoice_number']}", invoice_title))
    
    # Invoice and client details
    details_data = [
        ['Invoice Date:', datetime.utcnow().strftime('%Y-%m-%d'), 'Bill To:', ''],
        ['Due Date:', datetime.fromisoformat(invoice['due_date'].replace('Z', '+00:00')).strftime('%Y-%m-%d'), client['name'], ''],
        ['Status:', invoice['status'].upper(), client.get('email', ''), ''],
        ['', '', client.get('phone', ''), ''],
        ['', '', client.get('address', ''), '']
    ]
    
    details_table = Table(details_data, colWidths=[1.5*inch, 1.5*inch, 1.5*inch, 1.5*inch])
    details_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    
    story.append(details_table)
    story.append(Spacer(1, 30))
    
    # Job items table
    items_data = [['Job Description', 'Service Type', 'Date', 'Amount']]
    
    for job in jobs:
        items_data.append([
            job['title'],
            job['service_type'],
            datetime.fromisoformat(job['scheduled_date'].replace('Z', '+00:00')).strftime('%Y-%m-%d'),
            f"${job.get('actual_cost', job.get('estimated_cost', 0)):.2f}"
        ])
    
    items_table = Table(items_data, colWidths=[2.5*inch, 1.5*inch, 1*inch, 1*inch])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f3f4f6')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (-1, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    
    story.append(items_table)
    story.append(Spacer(1, 20))
    
    # Totals table
    totals_data = [
        ['Subtotal:', f"${invoice['subtotal']:.2f}"],
        ['Tax:', f"${invoice['tax_amount']:.2f}"],
    ]
    
    if invoice['discount_amount'] > 0:
        totals_data.append(['Discount:', f"-${invoice['discount_amount']:.2f}"])
    
    totals_data.append(['TOTAL:', f"${invoice['total_amount']:.2f}"])
    
    totals_table = Table(totals_data, colWidths=[4*inch, 2*inch])
    totals_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, -2), 'Helvetica'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('FONTSIZE', (0, -1), (-1, -1), 12),
        ('LINEBELOW', (0, -1), (-1, -1), 2, colors.black),
        ('TOPPADDING', (0, -1), (-1, -1), 10),
        ('BOTTOMPADDING', (0, -1), (-1, -1), 10),
    ]))
    
    story.append(totals_table)
    
    # Notes
    if invoice.get('notes'):
        story.append(Spacer(1, 20))
        story.append(Paragraph("Notes:", styles['Heading3']))
        story.append(Paragraph(invoice['notes'], styles['Normal']))
    
    # Footer
    story.append(Spacer(1, 30))
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.grey
    )
    story.append(Paragraph("Thank you for your business!", footer_style))
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer

@api_router.get("/invoices/{invoice_id}/pdf")
async def download_invoice_pdf(invoice_id: str, current_user: dict = Depends(get_current_user)):
    """Download invoice as PDF."""
    # Get invoice
    invoice = await db.invoices.find_one({
        "id": invoice_id,
        "company_id": current_user["company_id"]
    })
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Get company info
    company = await db.companies.find_one({"id": current_user["company_id"]})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Get client info
    client = await db.clients.find_one({
        "id": invoice["client_id"],
        "company_id": current_user["company_id"]
    })
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Get jobs
    jobs = await db.jobs.find({
        "id": {"$in": invoice["job_ids"]},
        "company_id": current_user["company_id"]
    }).to_list(100)
    
    # Generate PDF
    pdf_buffer = generate_invoice_pdf(invoice, company, client, jobs)
    
    # Return as streaming response
    return StreamingResponse(
        io.BytesIO(pdf_buffer.read()),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=invoice_{invoice['invoice_number']}.pdf"}
    )

@api_router.put("/invoices/{invoice_id}/status")
async def update_invoice_status(
    invoice_id: str, 
    status: str, 
    current_user: dict = Depends(get_current_user)
):
    """Update invoice status."""
    valid_statuses = ["pending", "sent", "paid", "overdue"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    result = await db.invoices.update_one(
        {"id": invoice_id, "company_id": current_user["company_id"]},
        {"$set": {"status": status, "paid_date": datetime.utcnow() if status == "paid" else None}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    return {"message": "Invoice status updated successfully"}

# Dashboard Routes
@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Get dashboard statistics."""
    company_id = current_user["company_id"]
    
    # Get counts and metrics
    total_jobs = await db.jobs.count_documents({"company_id": company_id})
    total_clients = await db.clients.count_documents({"company_id": company_id})
    jobs_today = await db.jobs.count_documents({
        "company_id": company_id,
        "scheduled_date": {
            "$gte": datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0),
            "$lt": datetime.utcnow().replace(hour=23, minute=59, second=59, microsecond=999999)
        }
    })
    
    # Calculate revenue from completed jobs this month
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    completed_jobs = await db.jobs.find({
        "company_id": company_id,
        "status": "completed",
        "completed_date": {"$gte": month_start}
    }).to_list(1000)
    
    monthly_revenue = sum(job.get("actual_cost", job.get("estimated_cost", 0)) for job in completed_jobs)
    
    return {
        "total_jobs": total_jobs,
        "total_clients": total_clients,
        "jobs_today": jobs_today,
        "monthly_revenue": monthly_revenue,
        "completion_rate": 85  # This could be calculated from actual data
    }

@api_router.get("/dashboard/recent-jobs")
async def get_recent_jobs(current_user: dict = Depends(get_current_user)):
    """Get recent jobs for dashboard."""
    jobs = await db.jobs.find({"company_id": current_user["company_id"]}).sort("created_at", -1).limit(10).to_list(10)
    
    # Enrich with client data
    for job in jobs:
        client = await db.clients.find_one({"id": job["client_id"]})
        job["client_name"] = client["name"] if client else "Unknown Client"
    
    return jobs

# File upload route
@api_router.post("/jobs/{job_id}/photos")
async def upload_job_photo(
    job_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload photo for a job."""
    # Verify job exists and belongs to user's company
    job = await db.jobs.find_one({"id": job_id, "company_id": current_user["company_id"]})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Create uploads directory if it doesn't exist
    upload_dir = Path("uploads/jobs")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Save file
    file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    filename = f"{job_id}_{uuid.uuid4()}.{file_extension}"
    file_path = upload_dir / filename
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Update job with photo reference
    await db.jobs.update_one(
        {"id": job_id, "company_id": current_user["company_id"]},
        {"$push": {"photos": str(file_path)}, "$set": {"updated_at": datetime.utcnow()}}
    )
    
    return {"message": "Photo uploaded successfully", "filename": filename}

# Delete routes
@api_router.delete("/clients/{client_id}")
async def delete_client(client_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a client."""
    result = await db.clients.delete_one({"id": client_id, "company_id": current_user["company_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
    return {"message": "Client deleted successfully"}

@api_router.delete("/jobs/{job_id}")
async def delete_job(job_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a job."""
    result = await db.jobs.delete_one({"id": job_id, "company_id": current_user["company_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"message": "Job deleted successfully"}

# Include the router in the main app
app.include_router(api_router)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_db_client():
    """Initialize database indexes on startup."""
    # Create indexes for better performance
    await db.users.create_index("email", unique=True)
    await db.companies.create_index("id", unique=True)
    await db.clients.create_index([("company_id", 1), ("email", 1)])
    await db.jobs.create_index([("company_id", 1), ("status", 1), ("scheduled_date", 1)])
    await db.invoices.create_index([("company_id", 1), ("status", 1)])

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()