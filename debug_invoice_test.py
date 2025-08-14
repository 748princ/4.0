#!/usr/bin/env python3
import requests
import json
from datetime import datetime, timedelta

# Test the invoice status endpoint specifically
base_url = "https://build-continue-1.preview.emergentagent.com"
api_url = f"{base_url}/api"

# First register and get token
test_timestamp = datetime.now().strftime('%H%M%S')
test_user = {
    "email": f"debug_user_{test_timestamp}@example.com",
    "password": "TestPass123!",
    "full_name": f"Debug User {test_timestamp}",
    "company_name": f"Debug Company {test_timestamp}",
    "phone": "+1234567890"
}

print("1. Registering user...")
response = requests.post(f"{api_url}/auth/register", json=test_user)
print(f"Registration: {response.status_code}")
if response.status_code == 200:
    token = response.json()['access_token']
    print("✅ Got token")
else:
    print("❌ Registration failed")
    exit(1)

headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

# Create client
print("\n2. Creating client...")
client_data = {
    "name": f"Debug Client {test_timestamp}",
    "email": f"debug_client_{test_timestamp}@example.com",
    "phone": "+1987654321",
    "address": "123 Debug Street",
    "contact_person": "Debug Person"
}
response = requests.post(f"{api_url}/clients", json=client_data, headers=headers)
print(f"Client creation: {response.status_code}")
if response.status_code == 200:
    client_id = response.json()['id']
    print(f"✅ Client ID: {client_id}")
else:
    print("❌ Client creation failed")
    exit(1)

# Create job
print("\n3. Creating job...")
job_data = {
    "title": f"Debug Job {test_timestamp}",
    "description": "Debug job",
    "client_id": client_id,
    "service_type": "Debug",
    "priority": "medium",
    "scheduled_date": (datetime.utcnow() + timedelta(days=1)).isoformat(),
    "estimated_duration": 60,
    "estimated_cost": 100.00
}
response = requests.post(f"{api_url}/jobs", json=job_data, headers=headers)
print(f"Job creation: {response.status_code}")
if response.status_code == 200:
    job_id = response.json()['id']
    print(f"✅ Job ID: {job_id}")
else:
    print("❌ Job creation failed")
    exit(1)

# Update job to completed
print("\n4. Updating job to completed...")
response = requests.put(f"{api_url}/jobs/{job_id}/status?status=completed", headers=headers)
print(f"Job status update: {response.status_code}")

# Create invoice
print("\n5. Creating invoice...")
invoice_data = {
    "client_id": client_id,
    "job_ids": [job_id],
    "due_date": (datetime.utcnow() + timedelta(days=30)).isoformat(),
    "tax_rate": 0.08,
    "discount_amount": 5.0,
    "notes": "Debug invoice"
}
response = requests.post(f"{api_url}/invoices", json=invoice_data, headers=headers)
print(f"Invoice creation: {response.status_code}")
if response.status_code == 200:
    invoice_id = response.json()['id']
    print(f"✅ Invoice ID: {invoice_id}")
else:
    print("❌ Invoice creation failed")
    print(response.text)
    exit(1)

# Test valid status updates
print("\n6. Testing valid status updates...")
for status in ['sent', 'paid', 'overdue']:
    response = requests.put(f"{api_url}/invoices/{invoice_id}/status?status={status}", headers=headers)
    print(f"Status '{status}': {response.status_code} - {response.text}")

# Test invalid status
print("\n7. Testing invalid status...")
response = requests.put(f"{api_url}/invoices/{invoice_id}/status?status=invalid_status", headers=headers)
print(f"Invalid status: {response.status_code} - {response.text}")

# Test PDF generation
print("\n8. Testing PDF generation...")
response = requests.get(f"{api_url}/invoices/{invoice_id}/pdf", headers=headers)
print(f"PDF generation: {response.status_code}")
if response.status_code == 200:
    print(f"✅ PDF generated, size: {len(response.content)} bytes")
    print(f"Content-Type: {response.headers.get('content-type')}")
    print(f"Content-Disposition: {response.headers.get('content-disposition')}")
else:
    print(f"❌ PDF generation failed: {response.text}")

print("\nDebug test completed!")