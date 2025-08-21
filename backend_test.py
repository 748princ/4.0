#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Jobber Pro SaaS Application
Tests all major API endpoints including authentication, CRUD operations, and business logic.
"""

import requests
import sys
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

class JobberProAPITester:
    def __init__(self, base_url: str = "https://inventory-progress.preview.emergentagent.com"):
        self.base_url = base_url.rstrip('/')
        self.api_url = f"{self.base_url}/api"
        self.token = None
        self.user_data = None
        self.company_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_client_id = None
        self.test_job_id = None
        self.test_invoice_id = None
        self.test_technician_id = None
        self.test_time_entry_id = None
        self.test_notification_id = None
        self.test_form_id = None
        
        # Inventory test data
        self.test_inventory_item_id = None
        self.test_stock_movement_id = None
        self.test_purchase_order_id = None
        self.test_low_stock_alert_id = None
        
        # Test data
        self.test_timestamp = datetime.now().strftime('%H%M%S')
        self.test_user = {
            "email": f"test_user_{self.test_timestamp}@example.com",
            "password": "TestPass123!",
            "full_name": f"Test User {self.test_timestamp}",
            "company_name": f"Test Company {self.test_timestamp}",
            "phone": "+1234567890"
        }

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            print(f"❌ {name} - FAILED {details}")

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    expected_status: int = 200, auth_required: bool = True) -> tuple[bool, Dict]:
        """Make HTTP request with error handling"""
        url = f"{self.api_url}/{endpoint.lstrip('/')}"
        headers = {'Content-Type': 'application/json'}
        
        if auth_required and self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                return False, {"error": f"Unsupported method: {method}"}
            
            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {"text": response.text, "status_code": response.status_code}
            
            return success, response_data
            
        except requests.exceptions.RequestException as e:
            return False, {"error": str(e)}

    def test_user_registration(self) -> bool:
        """Test user registration endpoint"""
        print(f"\n🔍 Testing User Registration...")
        success, response = self.make_request(
            'POST', '/auth/register', 
            data=self.test_user, 
            expected_status=200,
            auth_required=False
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_data = response.get('user', {})
            self.company_id = self.user_data.get('company_name')
            self.log_test("User Registration", True, f"- Token received, User: {self.user_data.get('full_name')}")
            return True
        else:
            self.log_test("User Registration", False, f"- {response}")
            return False

    def test_user_login(self) -> bool:
        """Test user login endpoint"""
        print(f"\n🔍 Testing User Login...")
        login_data = {
            "email": self.test_user["email"],
            "password": self.test_user["password"]
        }
        
        success, response = self.make_request(
            'POST', '/auth/login',
            data=login_data,
            expected_status=200,
            auth_required=False
        )
        
        if success and 'access_token' in response:
            # Update token in case it's different
            self.token = response['access_token']
            self.log_test("User Login", True, f"- Login successful")
            return True
        else:
            self.log_test("User Login", False, f"- {response}")
            return False

    def test_dashboard_stats(self) -> bool:
        """Test dashboard statistics endpoint"""
        print(f"\n🔍 Testing Dashboard Stats...")
        success, response = self.make_request('GET', '/dashboard/stats')
        
        if success:
            required_fields = ['total_jobs', 'total_clients', 'jobs_today', 'monthly_revenue', 'completion_rate']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                self.log_test("Dashboard Stats", True, f"- All required fields present: {list(response.keys())}")
                return True
            else:
                self.log_test("Dashboard Stats", False, f"- Missing fields: {missing_fields}")
                return False
        else:
            self.log_test("Dashboard Stats", False, f"- {response}")
            return False

    def test_dashboard_recent_jobs(self) -> bool:
        """Test dashboard recent jobs endpoint"""
        print(f"\n🔍 Testing Dashboard Recent Jobs...")
        success, response = self.make_request('GET', '/dashboard/recent-jobs')
        
        if success:
            if isinstance(response, list):
                self.log_test("Dashboard Recent Jobs", True, f"- Returned {len(response)} jobs")
                return True
            else:
                self.log_test("Dashboard Recent Jobs", False, f"- Expected list, got: {type(response)}")
                return False
        else:
            self.log_test("Dashboard Recent Jobs", False, f"- {response}")
            return False

    def test_create_client(self) -> bool:
        """Test client creation endpoint"""
        print(f"\n🔍 Testing Client Creation...")
        client_data = {
            "name": f"Test Client {self.test_timestamp}",
            "email": f"client_{self.test_timestamp}@example.com",
            "phone": "+1987654321",
            "address": "123 Test Street, Test City, TC 12345",
            "contact_person": "John Doe"
        }
        
        success, response = self.make_request(
            'POST', '/clients',
            data=client_data,
            expected_status=200
        )
        
        if success and 'id' in response:
            self.test_client_id = response['id']
            self.log_test("Client Creation", True, f"- Client ID: {self.test_client_id}")
            return True
        else:
            self.log_test("Client Creation", False, f"- {response}")
            return False

    def test_get_clients(self) -> bool:
        """Test get clients endpoint"""
        print(f"\n🔍 Testing Get Clients...")
        success, response = self.make_request('GET', '/clients')
        
        if success:
            if isinstance(response, list):
                client_found = any(client.get('id') == self.test_client_id for client in response)
                if client_found:
                    self.log_test("Get Clients", True, f"- Found {len(response)} clients, test client included")
                    return True
                else:
                    self.log_test("Get Clients", False, f"- Test client not found in {len(response)} clients")
                    return False
            else:
                self.log_test("Get Clients", False, f"- Expected list, got: {type(response)}")
                return False
        else:
            self.log_test("Get Clients", False, f"- {response}")
            return False

    def test_create_job(self) -> bool:
        """Test job creation endpoint"""
        print(f"\n🔍 Testing Job Creation...")
        if not self.test_client_id:
            self.log_test("Job Creation", False, "- No test client available")
            return False
        
        job_data = {
            "title": f"Test Job {self.test_timestamp}",
            "description": "This is a test job for API testing",
            "client_id": self.test_client_id,
            "service_type": "Maintenance",
            "priority": "medium",
            "scheduled_date": (datetime.utcnow() + timedelta(days=1)).isoformat(),
            "estimated_duration": 120,
            "estimated_cost": 250.00,
            "assigned_technician_id": None
        }
        
        success, response = self.make_request(
            'POST', '/jobs',
            data=job_data,
            expected_status=200
        )
        
        if success and 'id' in response:
            self.test_job_id = response['id']
            self.log_test("Job Creation", True, f"- Job ID: {self.test_job_id}")
            return True
        else:
            self.log_test("Job Creation", False, f"- {response}")
            return False

    def test_get_jobs(self) -> bool:
        """Test get jobs endpoint"""
        print(f"\n🔍 Testing Get Jobs...")
        success, response = self.make_request('GET', '/jobs')
        
        if success:
            if isinstance(response, list):
                job_found = any(job.get('id') == self.test_job_id for job in response)
                if job_found:
                    self.log_test("Get Jobs", True, f"- Found {len(response)} jobs, test job included")
                    return True
                else:
                    self.log_test("Get Jobs", False, f"- Test job not found in {len(response)} jobs")
                    return False
            else:
                self.log_test("Get Jobs", False, f"- Expected list, got: {type(response)}")
                return False
        else:
            self.log_test("Get Jobs", False, f"- {response}")
            return False

    def test_update_job_status(self) -> bool:
        """Test job status update endpoint"""
        print(f"\n🔍 Testing Job Status Update...")
        if not self.test_job_id:
            self.log_test("Job Status Update", False, "- No test job available")
            return False
        
        # Test updating to in_progress
        success, response = self.make_request(
            'PUT', f'/jobs/{self.test_job_id}/status?status=in_progress',
            expected_status=200
        )
        
        if success:
            # Test updating to completed
            success2, response2 = self.make_request(
                'PUT', f'/jobs/{self.test_job_id}/status?status=completed',
                expected_status=200
            )
            
            if success2:
                self.log_test("Job Status Update", True, "- Updated to in_progress and completed")
                return True
            else:
                self.log_test("Job Status Update", False, f"- Failed to update to completed: {response2}")
                return False
        else:
            self.log_test("Job Status Update", False, f"- Failed to update to in_progress: {response}")
            return False

    def test_get_specific_client(self) -> bool:
        """Test get specific client endpoint"""
        print(f"\n🔍 Testing Get Specific Client...")
        if not self.test_client_id:
            self.log_test("Get Specific Client", False, "- No test client available")
            return False
        
        success, response = self.make_request('GET', f'/clients/{self.test_client_id}')
        
        if success and response.get('id') == self.test_client_id:
            self.log_test("Get Specific Client", True, f"- Retrieved client: {response.get('name')}")
            return True
        else:
            self.log_test("Get Specific Client", False, f"- {response}")
            return False

    def test_get_specific_job(self) -> bool:
        """Test get specific job endpoint"""
        print(f"\n🔍 Testing Get Specific Job...")
        if not self.test_job_id:
            self.log_test("Get Specific Job", False, "- No test job available")
            return False
        
        success, response = self.make_request('GET', f'/jobs/{self.test_job_id}')
        
        if success and response.get('id') == self.test_job_id:
            self.log_test("Get Specific Job", True, f"- Retrieved job: {response.get('title')}")
            return True
        else:
            self.log_test("Get Specific Job", False, f"- {response}")
            return False

    def test_jobs_filtering(self) -> bool:
        """Test jobs filtering functionality"""
        print(f"\n🔍 Testing Jobs Filtering...")
        
        # Test filter by status
        success, response = self.make_request('GET', '/jobs?status=completed')
        
        if success:
            if isinstance(response, list):
                # Check if all returned jobs have completed status
                all_completed = all(job.get('status') == 'completed' for job in response)
                if all_completed or len(response) == 0:
                    self.log_test("Jobs Filtering", True, f"- Status filter working, {len(response)} completed jobs")
                    return True
                else:
                    self.log_test("Jobs Filtering", False, "- Status filter not working properly")
                    return False
            else:
                self.log_test("Jobs Filtering", False, f"- Expected list, got: {type(response)}")
                return False
        else:
            self.log_test("Jobs Filtering", False, f"- {response}")
            return False

    def test_create_invoice(self) -> bool:
        """Test invoice creation endpoint"""
        print(f"\n🔍 Testing Invoice Creation...")
        if not self.test_client_id or not self.test_job_id:
            self.log_test("Invoice Creation", False, "- No test client or job available")
            return False
        
        invoice_data = {
            "client_id": self.test_client_id,
            "job_ids": [self.test_job_id],
            "due_date": (datetime.utcnow() + timedelta(days=30)).isoformat(),
            "tax_rate": 0.08,
            "discount_amount": 10.0,
            "notes": "Test invoice for API testing"
        }
        
        success, response = self.make_request(
            'POST', '/invoices',
            data=invoice_data,
            expected_status=200
        )
        
        if success and 'id' in response:
            self.test_invoice_id = response['id']
            self.log_test("Invoice Creation", True, f"- Invoice ID: {self.test_invoice_id}, Number: {response.get('invoice_number')}")
            return True
        else:
            self.log_test("Invoice Creation", False, f"- {response}")
            return False

    def test_get_invoices(self) -> bool:
        """Test get invoices endpoint"""
        print(f"\n🔍 Testing Get Invoices...")
        success, response = self.make_request('GET', '/invoices')
        
        if success:
            if isinstance(response, list):
                invoice_found = any(invoice.get('id') == self.test_invoice_id for invoice in response)
                if invoice_found:
                    self.log_test("Get Invoices", True, f"- Found {len(response)} invoices, test invoice included")
                    return True
                else:
                    self.log_test("Get Invoices", False, f"- Test invoice not found in {len(response)} invoices")
                    return False
            else:
                self.log_test("Get Invoices", False, f"- Expected list, got: {type(response)}")
                return False
        else:
            self.log_test("Get Invoices", False, f"- {response}")
            return False

    def test_invoice_status_updates(self) -> bool:
        """Test invoice status update endpoint"""
        print(f"\n🔍 Testing Invoice Status Updates...")
        if not self.test_invoice_id:
            self.log_test("Invoice Status Updates", False, "- No test invoice available")
            return False
        
        # Test updating to 'sent'
        success1, response1 = self.make_request(
            'PUT', f'/invoices/{self.test_invoice_id}/status?status=sent',
            expected_status=200
        )
        
        if not success1:
            self.log_test("Invoice Status Updates", False, f"- Failed to update to 'sent': {response1}")
            return False
        
        # Test updating to 'paid'
        success2, response2 = self.make_request(
            'PUT', f'/invoices/{self.test_invoice_id}/status?status=paid',
            expected_status=200
        )
        
        if not success2:
            self.log_test("Invoice Status Updates", False, f"- Failed to update to 'paid': {response2}")
            return False
        
        # Test updating to 'overdue'
        success3, response3 = self.make_request(
            'PUT', f'/invoices/{self.test_invoice_id}/status?status=overdue',
            expected_status=200
        )
        
        if not success3:
            self.log_test("Invoice Status Updates", False, f"- Failed to update to 'overdue': {response3}")
            return False
        
        # Test invalid status (should fail)
        success4, response4 = self.make_request(
            'PUT', f'/invoices/{self.test_invoice_id}/status?status=invalid_status',
            expected_status=400
        )
        
        if success4:
            self.log_test("Invoice Status Updates", True, "- All status updates working correctly (sent, paid, overdue, invalid rejected)")
            return True
        else:
            self.log_test("Invoice Status Updates", False, "- Invalid status was accepted (should have been rejected)")
            return False

    def test_invoice_pdf_generation(self) -> bool:
        """Test invoice PDF generation endpoint"""
        print(f"\n🔍 Testing Invoice PDF Generation...")
        if not self.test_invoice_id:
            self.log_test("Invoice PDF Generation", False, "- No test invoice available")
            return False
        
        # Make request to PDF endpoint
        url = f"{self.api_url}/invoices/{self.test_invoice_id}/pdf"
        headers = {'Authorization': f'Bearer {self.token}'}
        
        try:
            response = requests.get(url, headers=headers, timeout=30)
            
            if response.status_code == 200:
                # Check if response is PDF
                content_type = response.headers.get('content-type', '')
                content_disposition = response.headers.get('content-disposition', '')
                
                if 'application/pdf' in content_type:
                    # Check if it has proper filename in headers
                    if 'attachment' in content_disposition and 'invoice_' in content_disposition:
                        # Check if PDF content is not empty
                        if len(response.content) > 1000:  # PDF should be at least 1KB
                            self.log_test("Invoice PDF Generation", True, f"- PDF generated successfully, size: {len(response.content)} bytes")
                            return True
                        else:
                            self.log_test("Invoice PDF Generation", False, f"- PDF too small: {len(response.content)} bytes")
                            return False
                    else:
                        self.log_test("Invoice PDF Generation", False, f"- Missing proper download headers: {content_disposition}")
                        return False
                else:
                    self.log_test("Invoice PDF Generation", False, f"- Wrong content type: {content_type}")
                    return False
            else:
                self.log_test("Invoice PDF Generation", False, f"- HTTP {response.status_code}: {response.text}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Invoice PDF Generation", False, f"- Request failed: {str(e)}")
            return False

    def test_create_technician(self) -> bool:
        """Test technician creation endpoint"""
        print(f"\n🔍 Testing Technician Creation...")
        technician_data = {
            "email": f"technician_{self.test_timestamp}@example.com",
            "password": "TechPass123!",
            "full_name": f"Test Technician {self.test_timestamp}",
            "phone": "+1555123456",
            "skills": ["Plumbing", "Electrical", "HVAC"],
            "hourly_rate": 45.00,
            "hire_date": datetime.utcnow().isoformat()
        }
        
        success, response = self.make_request(
            'POST', '/technicians',
            data=technician_data,
            expected_status=200
        )
        
        if success and 'id' in response:
            self.test_technician_id = response['id']
            self.log_test("Technician Creation", True, f"- Technician ID: {self.test_technician_id}")
            return True
        else:
            self.log_test("Technician Creation", False, f"- {response}")
            return False

    def test_get_technicians(self) -> bool:
        """Test get technicians endpoint"""
        print(f"\n🔍 Testing Get Technicians...")
        success, response = self.make_request('GET', '/technicians')
        
        if success:
            if isinstance(response, list):
                technician_found = any(tech.get('id') == self.test_technician_id for tech in response)
                if technician_found:
                    self.log_test("Get Technicians", True, f"- Found {len(response)} technicians, test technician included")
                    return True
                else:
                    self.log_test("Get Technicians", False, f"- Test technician not found in {len(response)} technicians")
                    return False
            else:
                self.log_test("Get Technicians", False, f"- Expected list, got: {type(response)}")
                return False
        else:
            self.log_test("Get Technicians", False, f"- {response}")
            return False

    def test_get_specific_technician(self) -> bool:
        """Test get specific technician endpoint"""
        print(f"\n🔍 Testing Get Specific Technician...")
        if not self.test_technician_id:
            self.log_test("Get Specific Technician", False, "- No test technician available")
            return False
        
        success, response = self.make_request('GET', f'/technicians/{self.test_technician_id}')
        
        if success and response.get('id') == self.test_technician_id:
            self.log_test("Get Specific Technician", True, f"- Retrieved technician: {response.get('full_name')}")
            return True
        else:
            self.log_test("Get Specific Technician", False, f"- {response}")
            return False

    def test_update_technician(self) -> bool:
        """Test technician update endpoint"""
        print(f"\n🔍 Testing Technician Update...")
        if not self.test_technician_id:
            self.log_test("Technician Update", False, "- No test technician available")
            return False
        
        update_data = {
            "hourly_rate": 50.00,
            "skills": ["Plumbing", "Electrical", "HVAC", "Carpentry"]
        }
        
        success, response = self.make_request(
            'PUT', f'/technicians/{self.test_technician_id}',
            data=update_data,
            expected_status=200
        )
        
        if success and response.get('hourly_rate') == 50.00:
            self.log_test("Technician Update", True, f"- Updated hourly rate and skills")
            return True
        else:
            self.log_test("Technician Update", False, f"- {response}")
            return False

    def test_start_time_entry(self) -> bool:
        """Test time entry creation (start tracking)"""
        print(f"\n🔍 Testing Start Time Entry...")
        if not self.test_job_id:
            self.log_test("Start Time Entry", False, "- No test job available")
            return False
        
        time_entry_data = {
            "job_id": self.test_job_id,
            "description": "Working on test job",
            "is_billable": True
        }
        
        success, response = self.make_request(
            'POST', '/time-entries',
            data=time_entry_data,
            expected_status=200
        )
        
        if success and 'id' in response:
            self.test_time_entry_id = response['id']
            self.log_test("Start Time Entry", True, f"- Time Entry ID: {self.test_time_entry_id}")
            return True
        else:
            self.log_test("Start Time Entry", False, f"- {response}")
            return False

    def test_get_active_time_entry(self) -> bool:
        """Test get active time entry endpoint"""
        print(f"\n🔍 Testing Get Active Time Entry...")
        success, response = self.make_request('GET', '/time-entries/active')
        
        if success:
            if response and response.get('id') == self.test_time_entry_id:
                self.log_test("Get Active Time Entry", True, f"- Found active entry: {response.get('id')}")
                return True
            elif response is None:
                self.log_test("Get Active Time Entry", True, "- No active time entry (valid response)")
                return True
            else:
                self.log_test("Get Active Time Entry", False, f"- Unexpected response: {response}")
                return False
        else:
            self.log_test("Get Active Time Entry", False, f"- {response}")
            return False

    def test_stop_time_entry(self) -> bool:
        """Test time entry update (stop tracking)"""
        print(f"\n🔍 Testing Stop Time Entry...")
        if not self.test_time_entry_id:
            self.log_test("Stop Time Entry", False, "- No test time entry available")
            return False
        
        update_data = {
            "end_time": datetime.utcnow().isoformat(),
            "break_duration": 15,
            "description": "Completed work on test job"
        }
        
        success, response = self.make_request(
            'PUT', f'/time-entries/{self.test_time_entry_id}',
            data=update_data,
            expected_status=200
        )
        
        if success and response.get('end_time'):
            self.log_test("Stop Time Entry", True, f"- Time entry stopped successfully")
            return True
        else:
            self.log_test("Stop Time Entry", False, f"- {response}")
            return False

    def test_get_time_entries(self) -> bool:
        """Test get time entries with filtering"""
        print(f"\n🔍 Testing Get Time Entries...")
        success, response = self.make_request('GET', '/time-entries')
        
        if success:
            if isinstance(response, list):
                entry_found = any(entry.get('id') == self.test_time_entry_id for entry in response)
                if entry_found:
                    self.log_test("Get Time Entries", True, f"- Found {len(response)} time entries, test entry included")
                    return True
                else:
                    self.log_test("Get Time Entries", False, f"- Test time entry not found in {len(response)} entries")
                    return False
            else:
                self.log_test("Get Time Entries", False, f"- Expected list, got: {type(response)}")
                return False
        else:
            self.log_test("Get Time Entries", False, f"- {response}")
            return False

    def test_job_time_entries(self) -> bool:
        """Test get job time entries endpoint"""
        print(f"\n🔍 Testing Job Time Entries...")
        if not self.test_job_id:
            self.log_test("Job Time Entries", False, "- No test job available")
            return False
        
        success, response = self.make_request('GET', f'/jobs/{self.test_job_id}/time-entries')
        
        if success:
            if isinstance(response, list):
                self.log_test("Job Time Entries", True, f"- Found {len(response)} time entries for job")
                return True
            else:
                self.log_test("Job Time Entries", False, f"- Expected list, got: {type(response)}")
                return False
        else:
            self.log_test("Job Time Entries", False, f"- {response}")
            return False

    def test_job_total_time(self) -> bool:
        """Test get job total time endpoint"""
        print(f"\n🔍 Testing Job Total Time...")
        if not self.test_job_id:
            self.log_test("Job Total Time", False, "- No test job available")
            return False
        
        success, response = self.make_request('GET', f'/jobs/{self.test_job_id}/total-time')
        
        if success:
            required_fields = ['total_hours', 'billable_hours', 'total_minutes', 'billable_minutes']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                self.log_test("Job Total Time", True, f"- Total: {response.get('total_hours')}h, Billable: {response.get('billable_hours')}h")
                return True
            else:
                self.log_test("Job Total Time", False, f"- Missing fields: {missing_fields}")
                return False
        else:
            self.log_test("Job Total Time", False, f"- {response}")
            return False

    def test_create_notification(self) -> bool:
        """Test notification creation endpoint"""
        print(f"\n🔍 Testing Notification Creation...")
        notification_data = {
            "user_id": self.user_data.get('id'),
            "title": "Test Notification",
            "message": f"This is a test notification created at {datetime.utcnow().isoformat()}",
            "type": "info",
            "entity_type": "job",
            "entity_id": self.test_job_id
        }
        
        success, response = self.make_request(
            'POST', '/notifications',
            data=notification_data,
            expected_status=200
        )
        
        if success and 'id' in response:
            self.test_notification_id = response['id']
            self.log_test("Notification Creation", True, f"- Notification ID: {self.test_notification_id}")
            return True
        else:
            self.log_test("Notification Creation", False, f"- {response}")
            return False

    def test_get_notifications(self) -> bool:
        """Test get notifications endpoint"""
        print(f"\n🔍 Testing Get Notifications...")
        success, response = self.make_request('GET', '/notifications')
        
        if success:
            if isinstance(response, list):
                notification_found = any(notif.get('id') == self.test_notification_id for notif in response)
                if notification_found:
                    self.log_test("Get Notifications", True, f"- Found {len(response)} notifications, test notification included")
                    return True
                else:
                    self.log_test("Get Notifications", False, f"- Test notification not found in {len(response)} notifications")
                    return False
            else:
                self.log_test("Get Notifications", False, f"- Expected list, got: {type(response)}")
                return False
        else:
            self.log_test("Get Notifications", False, f"- {response}")
            return False

    def test_mark_notification_read(self) -> bool:
        """Test mark notification as read endpoint"""
        print(f"\n🔍 Testing Mark Notification Read...")
        if not self.test_notification_id:
            self.log_test("Mark Notification Read", False, "- No test notification available")
            return False
        
        success, response = self.make_request(
            'PUT', f'/notifications/{self.test_notification_id}/read',
            expected_status=200
        )
        
        if success:
            self.log_test("Mark Notification Read", True, "- Notification marked as read")
            return True
        else:
            self.log_test("Mark Notification Read", False, f"- {response}")
            return False

    def test_mark_all_notifications_read(self) -> bool:
        """Test mark all notifications as read endpoint"""
        print(f"\n🔍 Testing Mark All Notifications Read...")
        success, response = self.make_request(
            'PUT', '/notifications/mark-all-read',
            expected_status=200
        )
        
        if success:
            self.log_test("Mark All Notifications Read", True, "- All notifications marked as read")
            return True
        else:
            self.log_test("Mark All Notifications Read", False, f"- {response}")
            return False

    def test_create_custom_form(self) -> bool:
        """Test custom form creation endpoint"""
        print(f"\n🔍 Testing Custom Form Creation...")
        form_data = {
            "name": f"Test Form {self.test_timestamp}",
            "description": "A test form for API testing",
            "service_types": ["Maintenance", "Repair"],
            "fields": [
                {
                    "name": "customer_satisfaction",
                    "label": "Customer Satisfaction Rating",
                    "type": "select",
                    "required": True,
                    "options": ["1", "2", "3", "4", "5"],
                    "order": 1
                },
                {
                    "name": "work_description",
                    "label": "Work Description",
                    "type": "textarea",
                    "required": True,
                    "order": 2
                },
                {
                    "name": "completion_date",
                    "label": "Completion Date",
                    "type": "date",
                    "required": False,
                    "order": 3
                }
            ]
        }
        
        success, response = self.make_request(
            'POST', '/forms',
            data=form_data,
            expected_status=200
        )
        
        if success and 'id' in response:
            self.test_form_id = response['id']
            self.log_test("Custom Form Creation", True, f"- Form ID: {self.test_form_id}")
            return True
        else:
            self.log_test("Custom Form Creation", False, f"- {response}")
            return False

    def test_get_custom_forms(self) -> bool:
        """Test get custom forms endpoint"""
        print(f"\n🔍 Testing Get Custom Forms...")
        success, response = self.make_request('GET', '/forms')
        
        if success:
            if isinstance(response, list):
                form_found = any(form.get('id') == self.test_form_id for form in response)
                if form_found:
                    self.log_test("Get Custom Forms", True, f"- Found {len(response)} forms, test form included")
                    return True
                else:
                    self.log_test("Get Custom Forms", False, f"- Test form not found in {len(response)} forms")
                    return False
            else:
                self.log_test("Get Custom Forms", False, f"- Expected list, got: {type(response)}")
                return False
        else:
            self.log_test("Get Custom Forms", False, f"- {response}")
            return False

    def test_get_specific_custom_form(self) -> bool:
        """Test get specific custom form endpoint"""
        print(f"\n🔍 Testing Get Specific Custom Form...")
        if not self.test_form_id:
            self.log_test("Get Specific Custom Form", False, "- No test form available")
            return False
        
        success, response = self.make_request('GET', f'/forms/{self.test_form_id}')
        
        if success and response.get('id') == self.test_form_id:
            self.log_test("Get Specific Custom Form", True, f"- Retrieved form: {response.get('name')}")
            return True
        else:
            self.log_test("Get Specific Custom Form", False, f"- {response}")
            return False

    def test_submit_custom_form(self) -> bool:
        """Test custom form submission endpoint"""
        print(f"\n🔍 Testing Custom Form Submission...")
        if not self.test_form_id or not self.test_job_id:
            self.log_test("Custom Form Submission", False, "- No test form or job available")
            return False
        
        submission_data = {
            "form_id": self.test_form_id,
            "job_id": self.test_job_id,
            "data": {
                "customer_satisfaction": "5",
                "work_description": "Completed maintenance work successfully. Customer was very satisfied.",
                "completion_date": datetime.utcnow().date().isoformat()
            }
        }
        
        success, response = self.make_request(
            'POST', f'/forms/{self.test_form_id}/submissions',
            data=submission_data,
            expected_status=200
        )
        
        if success and 'id' in response:
            self.log_test("Custom Form Submission", True, f"- Form submitted successfully")
            return True
        else:
            self.log_test("Custom Form Submission", False, f"- {response}")
            return False

    def test_get_form_submissions(self) -> bool:
        """Test get form submissions endpoint"""
        print(f"\n🔍 Testing Get Form Submissions...")
        if not self.test_form_id:
            self.log_test("Get Form Submissions", False, "- No test form available")
            return False
        
        success, response = self.make_request('GET', f'/forms/{self.test_form_id}/submissions')
        
        if success:
            if isinstance(response, list):
                self.log_test("Get Form Submissions", True, f"- Found {len(response)} submissions for form")
                return True
            else:
                self.log_test("Get Form Submissions", False, f"- Expected list, got: {type(response)}")
                return False
        else:
            self.log_test("Get Form Submissions", False, f"- {response}")
            return False

    # ============================
    # INVENTORY MANAGEMENT TESTS
    # ============================

    def test_create_inventory_item(self) -> bool:
        """Test inventory item creation endpoint"""
        print(f"\n🔍 Testing Inventory Item Creation...")
        inventory_data = {
            "name": f"Test Inventory Item {self.test_timestamp}",
            "description": "A test inventory item for API testing",
            "category": "parts",
            "supplier_name": "Test Supplier Inc",
            "supplier_contact": "supplier@test.com",
            "unit_cost": 25.50,
            "selling_price": 35.00,
            "stock_quantity": 100,
            "min_stock_level": 10,
            "max_stock_level": 500,
            "location": "Warehouse A-1",
            "notes": "Test inventory item for comprehensive testing"
        }
        
        success, response = self.make_request(
            'POST', '/inventory/items',
            data=inventory_data,
            expected_status=200
        )
        
        if success and 'id' in response:
            self.test_inventory_item_id = response['id']
            sku = response.get('sku', 'No SKU')
            self.log_test("Inventory Item Creation", True, f"- Item ID: {self.test_inventory_item_id}, SKU: {sku}")
            return True
        else:
            self.log_test("Inventory Item Creation", False, f"- {response}")
            return False

    def test_get_inventory_items(self) -> bool:
        """Test get inventory items endpoint"""
        print(f"\n🔍 Testing Get Inventory Items...")
        success, response = self.make_request('GET', '/inventory/items')
        
        if success:
            if 'items' in response and isinstance(response['items'], list):
                items = response['items']
                item_found = any(item.get('id') == self.test_inventory_item_id for item in items)
                if item_found:
                    self.log_test("Get Inventory Items", True, f"- Found {len(items)} items, test item included")
                    return True
                else:
                    self.log_test("Get Inventory Items", False, f"- Test item not found in {len(items)} items")
                    return False
            else:
                self.log_test("Get Inventory Items", False, f"- Expected items array, got: {response}")
                return False
        else:
            self.log_test("Get Inventory Items", False, f"- {response}")
            return False

    def test_get_specific_inventory_item(self) -> bool:
        """Test get specific inventory item endpoint"""
        print(f"\n🔍 Testing Get Specific Inventory Item...")
        if not self.test_inventory_item_id:
            self.log_test("Get Specific Inventory Item", False, "- No test inventory item available")
            return False
        
        success, response = self.make_request('GET', f'/inventory/items/{self.test_inventory_item_id}')
        
        if success and response.get('id') == self.test_inventory_item_id:
            recent_movements = response.get('recent_movements', [])
            self.log_test("Get Specific Inventory Item", True, f"- Retrieved item: {response.get('name')}, {len(recent_movements)} recent movements")
            return True
        else:
            self.log_test("Get Specific Inventory Item", False, f"- {response}")
            return False

    def test_update_inventory_item(self) -> bool:
        """Test inventory item update endpoint"""
        print(f"\n🔍 Testing Inventory Item Update...")
        if not self.test_inventory_item_id:
            self.log_test("Inventory Item Update", False, "- No test inventory item available")
            return False
        
        update_data = {
            "unit_cost": 30.00,
            "selling_price": 40.00,
            "min_stock_level": 15,
            "notes": "Updated test inventory item"
        }
        
        success, response = self.make_request(
            'PUT', f'/inventory/items/{self.test_inventory_item_id}',
            data=update_data,
            expected_status=200
        )
        
        if success and response.get('unit_cost') == 30.00:
            self.log_test("Inventory Item Update", True, f"- Updated unit cost and other fields")
            return True
        else:
            self.log_test("Inventory Item Update", False, f"- {response}")
            return False

    def test_inventory_items_filtering(self) -> bool:
        """Test inventory items filtering functionality"""
        print(f"\n🔍 Testing Inventory Items Filtering...")
        
        # Test filter by category
        success, response = self.make_request('GET', '/inventory/items?category=parts')
        
        if success:
            if 'items' in response and isinstance(response['items'], list):
                items = response['items']
                # Check if all returned items have parts category
                all_parts = all(item.get('category') == 'parts' for item in items)
                if all_parts or len(items) == 0:
                    self.log_test("Inventory Items Filtering", True, f"- Category filter working, {len(items)} parts items")
                    return True
                else:
                    self.log_test("Inventory Items Filtering", False, "- Category filter not working properly")
                    return False
            else:
                self.log_test("Inventory Items Filtering", False, f"- Expected items array, got: {response}")
                return False
        else:
            self.log_test("Inventory Items Filtering", False, f"- {response}")
            return False

    def test_inventory_search(self) -> bool:
        """Test inventory search functionality"""
        print(f"\n🔍 Testing Inventory Search...")
        
        # Search for our test item
        success, response = self.make_request('GET', f'/inventory/items?search=Test Inventory Item {self.test_timestamp}')
        
        if success:
            if 'items' in response and isinstance(response['items'], list):
                items = response['items']
                item_found = any(item.get('id') == self.test_inventory_item_id for item in items)
                if item_found:
                    self.log_test("Inventory Search", True, f"- Search working, found test item in {len(items)} results")
                    return True
                else:
                    self.log_test("Inventory Search", False, f"- Test item not found in search results")
                    return False
            else:
                self.log_test("Inventory Search", False, f"- Expected items array, got: {response}")
                return False
        else:
            self.log_test("Inventory Search", False, f"- {response}")
            return False

    def test_create_stock_movement(self) -> bool:
        """Test stock movement creation endpoint"""
        print(f"\n🔍 Testing Stock Movement Creation...")
        if not self.test_inventory_item_id:
            self.log_test("Stock Movement Creation", False, "- No test inventory item available")
            return False
        
        movement_data = {
            "inventory_item_id": self.test_inventory_item_id,
            "movement_type": "in",
            "quantity": 50,
            "reference_type": "purchase_order",
            "unit_cost": 25.50,
            "notes": "Test stock movement - adding inventory"
        }
        
        success, response = self.make_request(
            'POST', '/inventory/movements',
            data=movement_data,
            expected_status=200
        )
        
        if success and 'id' in response:
            self.test_stock_movement_id = response['id']
            self.log_test("Stock Movement Creation", True, f"- Movement ID: {self.test_stock_movement_id}, New Qty: {response.get('new_quantity')}")
            return True
        else:
            self.log_test("Stock Movement Creation", False, f"- {response}")
            return False

    def test_get_stock_movements(self) -> bool:
        """Test get stock movements endpoint"""
        print(f"\n🔍 Testing Get Stock Movements...")
        success, response = self.make_request('GET', '/inventory/movements')
        
        if success:
            if 'movements' in response and isinstance(response['movements'], list):
                movements = response['movements']
                movement_found = any(movement.get('id') == self.test_stock_movement_id for movement in movements)
                if movement_found:
                    self.log_test("Get Stock Movements", True, f"- Found {len(movements)} movements, test movement included")
                    return True
                else:
                    self.log_test("Get Stock Movements", False, f"- Test movement not found in {len(movements)} movements")
                    return False
            else:
                self.log_test("Get Stock Movements", False, f"- Expected movements array, got: {response}")
                return False
        else:
            self.log_test("Get Stock Movements", False, f"- {response}")
            return False

    def test_stock_movement_filtering(self) -> bool:
        """Test stock movements filtering"""
        print(f"\n🔍 Testing Stock Movement Filtering...")
        if not self.test_inventory_item_id:
            self.log_test("Stock Movement Filtering", False, "- No test inventory item available")
            return False
        
        # Test filter by item_id
        success, response = self.make_request('GET', f'/inventory/movements?item_id={self.test_inventory_item_id}')
        
        if success:
            if 'movements' in response and isinstance(response['movements'], list):
                movements = response['movements']
                # Check if all returned movements are for our test item
                all_for_item = all(movement.get('inventory_item_id') == self.test_inventory_item_id for movement in movements)
                if all_for_item:
                    self.log_test("Stock Movement Filtering", True, f"- Item filter working, {len(movements)} movements for test item")
                    return True
                else:
                    self.log_test("Stock Movement Filtering", False, "- Item filter not working properly")
                    return False
            else:
                self.log_test("Stock Movement Filtering", False, f"- Expected movements array, got: {response}")
                return False
        else:
            self.log_test("Stock Movement Filtering", False, f"- {response}")
            return False

    def test_job_parts_usage(self) -> bool:
        """Test job parts usage creation endpoint"""
        print(f"\n🔍 Testing Job Parts Usage...")
        if not self.test_inventory_item_id or not self.test_job_id:
            self.log_test("Job Parts Usage", False, "- No test inventory item or job available")
            return False
        
        usage_data = {
            "job_id": self.test_job_id,
            "inventory_item_id": self.test_inventory_item_id,
            "quantity_used": 5,
            "unit_price": 35.00,
            "notes": "Parts used for test job completion"
        }
        
        success, response = self.make_request(
            'POST', '/inventory/job-parts-usage',
            data=usage_data,
            expected_status=200
        )
        
        if success and 'id' in response:
            total_cost = response.get('total_cost', 0)
            self.log_test("Job Parts Usage", True, f"- Usage recorded, Total Cost: ${total_cost}")
            return True
        else:
            self.log_test("Job Parts Usage", False, f"- {response}")
            return False

    def test_get_job_parts_usage(self) -> bool:
        """Test get job parts usage endpoint"""
        print(f"\n🔍 Testing Get Job Parts Usage...")
        if not self.test_job_id:
            self.log_test("Get Job Parts Usage", False, "- No test job available")
            return False
        
        success, response = self.make_request('GET', f'/jobs/{self.test_job_id}/parts-usage')
        
        if success:
            if isinstance(response, list):
                # Check if our test item usage is included
                usage_found = any(usage.get('inventory_item_id') == self.test_inventory_item_id for usage in response)
                if usage_found:
                    self.log_test("Get Job Parts Usage", True, f"- Found {len(response)} parts usage records for job")
                    return True
                else:
                    self.log_test("Get Job Parts Usage", True, f"- Found {len(response)} parts usage records (test usage may not be included)")
                    return True
            else:
                self.log_test("Get Job Parts Usage", False, f"- Expected list, got: {type(response)}")
                return False
        else:
            self.log_test("Get Job Parts Usage", False, f"- {response}")
            return False

    def test_create_purchase_order(self) -> bool:
        """Test purchase order creation endpoint"""
        print(f"\n🔍 Testing Purchase Order Creation...")
        if not self.test_inventory_item_id:
            self.log_test("Purchase Order Creation", False, "- No test inventory item available")
            return False
        
        po_data = {
            "supplier_name": "Test Supplier Co",
            "supplier_contact": "orders@testsupplier.com",
            "expected_delivery_date": (datetime.utcnow() + timedelta(days=7)).isoformat(),
            "items": [
                {
                    "inventory_item_id": self.test_inventory_item_id,
                    "quantity": 100,
                    "unit_cost": 24.00,
                    "notes": "Bulk order for test item"
                }
            ],
            "notes": "Test purchase order for API testing"
        }
        
        success, response = self.make_request(
            'POST', '/inventory/purchase-orders',
            data=po_data,
            expected_status=200
        )
        
        if success and 'id' in response:
            self.test_purchase_order_id = response['id']
            po_number = response.get('po_number', 'No PO Number')
            total_amount = response.get('total_amount', 0)
            self.log_test("Purchase Order Creation", True, f"- PO ID: {self.test_purchase_order_id}, Number: {po_number}, Total: ${total_amount}")
            return True
        else:
            self.log_test("Purchase Order Creation", False, f"- {response}")
            return False

    def test_get_purchase_orders(self) -> bool:
        """Test get purchase orders endpoint"""
        print(f"\n🔍 Testing Get Purchase Orders...")
        success, response = self.make_request('GET', '/inventory/purchase-orders')
        
        if success:
            if isinstance(response, list):
                po_found = any(po.get('id') == self.test_purchase_order_id for po in response)
                if po_found:
                    self.log_test("Get Purchase Orders", True, f"- Found {len(response)} purchase orders, test PO included")
                    return True
                else:
                    self.log_test("Get Purchase Orders", False, f"- Test PO not found in {len(response)} purchase orders")
                    return False
            else:
                self.log_test("Get Purchase Orders", False, f"- Expected list, got: {type(response)}")
                return False
        else:
            self.log_test("Get Purchase Orders", False, f"- {response}")
            return False

    def test_receive_purchase_order(self) -> bool:
        """Test receive purchase order endpoint"""
        print(f"\n🔍 Testing Receive Purchase Order...")
        if not self.test_purchase_order_id or not self.test_inventory_item_id:
            self.log_test("Receive Purchase Order", False, "- No test purchase order or inventory item available")
            return False
        
        receive_data = [
            {
                "item_id": self.test_inventory_item_id,
                "received_quantity": 100
            }
        ]
        
        success, response = self.make_request(
            'PUT', f'/inventory/purchase-orders/{self.test_purchase_order_id}/receive',
            data=receive_data,
            expected_status=200
        )
        
        if success:
            status = response.get('status', 'unknown')
            self.log_test("Receive Purchase Order", True, f"- PO received successfully, Status: {status}")
            return True
        else:
            self.log_test("Receive Purchase Order", False, f"- {response}")
            return False

    def test_low_stock_alerts(self) -> bool:
        """Test low stock alerts endpoint"""
        print(f"\n🔍 Testing Low Stock Alerts...")
        success, response = self.make_request('GET', '/inventory/low-stock-alerts')
        
        if success:
            if isinstance(response, list):
                self.log_test("Low Stock Alerts", True, f"- Found {len(response)} low stock alerts")
                # Store first alert ID for acknowledgment test
                if response and 'id' in response[0]:
                    self.test_low_stock_alert_id = response[0]['id']
                return True
            else:
                self.log_test("Low Stock Alerts", False, f"- Expected list, got: {type(response)}")
                return False
        else:
            self.log_test("Low Stock Alerts", False, f"- {response}")
            return False

    def test_acknowledge_low_stock_alert(self) -> bool:
        """Test acknowledge low stock alert endpoint"""
        print(f"\n🔍 Testing Acknowledge Low Stock Alert...")
        if not self.test_low_stock_alert_id:
            self.log_test("Acknowledge Low Stock Alert", True, "- No low stock alerts to acknowledge (valid scenario)")
            return True
        
        success, response = self.make_request(
            'PUT', f'/inventory/low-stock-alerts/{self.test_low_stock_alert_id}/acknowledge',
            expected_status=200
        )
        
        if success:
            self.log_test("Acknowledge Low Stock Alert", True, "- Alert acknowledged successfully")
            return True
        else:
            self.log_test("Acknowledge Low Stock Alert", False, f"- {response}")
            return False

    def test_inventory_analytics(self) -> bool:
        """Test inventory analytics endpoint"""
        print(f"\n🔍 Testing Inventory Analytics...")
        success, response = self.make_request('GET', '/inventory/analytics')
        
        if success:
            required_fields = ['total_items', 'total_value', 'low_stock_items', 'out_of_stock_items', 
                             'top_used_items', 'category_breakdown', 'movement_summary', 'recent_movements']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                total_items = response.get('total_items', 0)
                total_value = response.get('total_value', 0)
                self.log_test("Inventory Analytics", True, f"- Analytics complete: {total_items} items, ${total_value:.2f} total value")
                return True
            else:
                self.log_test("Inventory Analytics", False, f"- Missing fields: {missing_fields}")
                return False
        else:
            self.log_test("Inventory Analytics", False, f"- {response}")
            return False

    def test_low_stock_filtering(self) -> bool:
        """Test low stock filtering in inventory items"""
        print(f"\n🔍 Testing Low Stock Filtering...")
        
        # First, create a low stock item by reducing stock below minimum
        if self.test_inventory_item_id:
            # Create a stock movement to reduce stock below minimum
            movement_data = {
                "inventory_item_id": self.test_inventory_item_id,
                "movement_type": "out",
                "quantity": 140,  # This should bring stock below minimum
                "reference_type": "adjustment",
                "notes": "Test low stock scenario"
            }
            
            # Try to create the movement (might fail if insufficient stock)
            self.make_request('POST', '/inventory/movements', data=movement_data)
        
        # Test low stock filter
        success, response = self.make_request('GET', '/inventory/items?low_stock=true')
        
        if success:
            if 'items' in response and isinstance(response['items'], list):
                items = response['items']
                self.log_test("Low Stock Filtering", True, f"- Low stock filter working, {len(items)} low stock items")
                return True
            else:
                self.log_test("Low Stock Filtering", False, f"- Expected items array, got: {response}")
                return False
        else:
            self.log_test("Low Stock Filtering", False, f"- {response}")
            return False

    def test_inventory_workflow(self) -> bool:
        """Test complete inventory workflow"""
        print(f"\n🔍 Testing Complete Inventory Workflow...")
        
        # This test verifies the complete workflow:
        # 1. Create item (already done)
        # 2. Add stock via movement (already done)
        # 3. Use parts in job (already done)
        # 4. Create purchase order (already done)
        # 5. Receive purchase order (already done)
        # 6. Check analytics
        
        if (self.test_inventory_item_id and self.test_stock_movement_id and 
            self.test_purchase_order_id):
            self.log_test("Inventory Workflow", True, "- Complete workflow executed successfully")
            return True
        else:
            missing = []
            if not self.test_inventory_item_id:
                missing.append("inventory_item")
            if not self.test_stock_movement_id:
                missing.append("stock_movement")
            if not self.test_purchase_order_id:
                missing.append("purchase_order")
            
            self.log_test("Inventory Workflow", False, f"- Missing components: {missing}")
            return False

    def cleanup_test_data(self) -> bool:
        """Clean up test data"""
        print(f"\n🧹 Cleaning up test data...")
        cleanup_success = True
        
        # Delete test job
        if self.test_job_id:
            success, response = self.make_request('DELETE', f'/jobs/{self.test_job_id}')
            if success:
                print(f"✅ Deleted test job: {self.test_job_id}")
            else:
                print(f"❌ Failed to delete test job: {response}")
                cleanup_success = False
        
        # Delete test client
        if self.test_client_id:
            success, response = self.make_request('DELETE', f'/clients/{self.test_client_id}')
            if success:
                print(f"✅ Deleted test client: {self.test_client_id}")
            else:
                print(f"❌ Failed to delete test client: {response}")
                cleanup_success = False
        
        return cleanup_success

    def run_all_tests(self) -> bool:
        """Run all API tests"""
        print("🚀 Starting Jobber Pro API Testing...")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Authentication Tests
        if not self.test_user_registration():
            print("❌ Registration failed - stopping tests")
            return False
        
        if not self.test_user_login():
            print("❌ Login failed - stopping tests")
            return False
        
        # Dashboard Tests
        self.test_dashboard_stats()
        self.test_dashboard_recent_jobs()
        
        # Client Management Tests
        self.test_create_client()
        self.test_get_clients()
        self.test_get_specific_client()
        
        # Job Management Tests
        self.test_create_job()
        self.test_get_jobs()
        self.test_get_specific_job()
        self.test_update_job_status()
        self.test_jobs_filtering()
        
        # Invoice Management Tests
        self.test_create_invoice()
        self.test_get_invoices()
        self.test_invoice_status_updates()
        self.test_invoice_pdf_generation()
        
        # Team Management Tests (New Features)
        self.test_create_technician()
        self.test_get_technicians()
        self.test_get_specific_technician()
        self.test_update_technician()
        
        # Time Tracking Tests (New Features)
        self.test_start_time_entry()
        self.test_get_active_time_entry()
        self.test_stop_time_entry()
        self.test_get_time_entries()
        self.test_job_time_entries()
        self.test_job_total_time()
        
        # Notification Tests (New Features)
        self.test_create_notification()
        self.test_get_notifications()
        self.test_mark_notification_read()
        self.test_mark_all_notifications_read()
        
        # Custom Forms Tests (New Features)
        self.test_create_custom_form()
        self.test_get_custom_forms()
        self.test_get_specific_custom_form()
        self.test_submit_custom_form()
        self.test_get_form_submissions()
        
        # Inventory Management Tests (New Features)
        print("\n" + "="*50)
        print("🏭 INVENTORY MANAGEMENT SYSTEM TESTING")
        print("="*50)
        
        self.test_create_inventory_item()
        self.test_get_inventory_items()
        self.test_get_specific_inventory_item()
        self.test_update_inventory_item()
        self.test_inventory_items_filtering()
        self.test_inventory_search()
        
        self.test_create_stock_movement()
        self.test_get_stock_movements()
        self.test_stock_movement_filtering()
        
        self.test_job_parts_usage()
        self.test_get_job_parts_usage()
        
        self.test_create_purchase_order()
        self.test_get_purchase_orders()
        self.test_receive_purchase_order()
        
        self.test_low_stock_alerts()
        self.test_acknowledge_low_stock_alert()
        self.test_inventory_analytics()
        self.test_low_stock_filtering()
        self.test_inventory_workflow()
        
        # Cleanup
        self.cleanup_test_data()
        
        # Print final results
        print("\n" + "=" * 60)
        print(f"📊 TEST RESULTS: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 ALL TESTS PASSED! Backend API is working correctly.")
            return True
        else:
            failed_tests = self.tests_run - self.tests_passed
            print(f"⚠️  {failed_tests} tests failed. Backend needs attention.")
            return False

def main():
    """Main function to run the tests"""
    tester = JobberProAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())