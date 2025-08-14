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
    def __init__(self, base_url: str = "https://build-continue-1.preview.emergentagent.com"):
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
            self.log_test("Invoice Status Updates", False, "- Invalid status was accepted (should have been rejected)")
            return False
        
        self.log_test("Invoice Status Updates", True, "- All status updates working correctly (sent, paid, overdue, invalid rejected)")
        return True

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