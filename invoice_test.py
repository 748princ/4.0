#!/usr/bin/env python3
"""
Invoice Management System Tests for Jobber Pro Backend API
Tests invoice creation, calculations, and retrieval functionality.
"""

import requests
import sys
import json
from datetime import datetime, timedelta

class JobberProInvoiceTester:
    def __init__(self, base_url: str = "https://build-continue-1.preview.emergentagent.com"):
        self.base_url = base_url.rstrip('/')
        self.api_url = f"{self.base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_client_id = None
        self.test_job_ids = []
        
        # Test data
        self.test_timestamp = datetime.now().strftime('%H%M%S')
        self.test_user = {
            "email": f"invoice_test_{self.test_timestamp}@example.com",
            "password": "TestPass123!",
            "full_name": f"Invoice Test User {self.test_timestamp}",
            "company_name": f"Invoice Test Company {self.test_timestamp}",
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

    def make_request(self, method: str, endpoint: str, data=None, 
                    expected_status: int = 200, auth_required: bool = True) -> tuple[bool, dict]:
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

    def setup_test_data(self) -> bool:
        """Setup authentication and test data"""
        # Register user
        success, response = self.make_request(
            'POST', '/auth/register', 
            data=self.test_user, 
            expected_status=200,
            auth_required=False
        )
        
        if not success or 'access_token' not in response:
            return False
        
        self.token = response['access_token']
        
        # Create test client
        client_data = {
            "name": f"Invoice Test Client {self.test_timestamp}",
            "email": f"invoice_client_{self.test_timestamp}@example.com",
            "phone": "+1987654321",
            "address": "123 Invoice Street, Invoice City, IC 12345",
            "contact_person": "Invoice Manager"
        }
        
        success, client_response = self.make_request('POST', '/clients', data=client_data)
        if not success:
            return False
        
        self.test_client_id = client_response['id']
        
        # Create multiple test jobs
        for i in range(3):
            job_data = {
                "title": f"Invoice Test Job {i+1} - {self.test_timestamp}",
                "description": f"Test job {i+1} for invoice testing",
                "client_id": self.test_client_id,
                "service_type": "Maintenance",
                "priority": "medium",
                "scheduled_date": (datetime.utcnow() + timedelta(days=i+1)).isoformat(),
                "estimated_duration": 120,
                "estimated_cost": 100.0 + (i * 50),  # Different costs: 100, 150, 200
                "assigned_technician_id": None
            }
            
            success, job_response = self.make_request('POST', '/jobs', data=job_data)
            if success:
                job_id = job_response['id']
                self.test_job_ids.append(job_id)
                
                # Mark jobs as completed to enable invoicing
                self.make_request('PUT', f'/jobs/{job_id}/status?status=completed')
        
        return len(self.test_job_ids) == 3

    def test_create_invoice(self) -> bool:
        """Test invoice creation"""
        print(f"\n🔍 Testing Invoice Creation...")
        
        if not self.test_job_ids:
            self.log_test("Invoice Creation", False, "- No test jobs available")
            return False
        
        invoice_data = {
            "client_id": self.test_client_id,
            "job_ids": self.test_job_ids,
            "due_date": (datetime.utcnow() + timedelta(days=30)).isoformat(),
            "tax_rate": 0.08,  # 8% tax
            "discount_amount": 25.0,
            "notes": "Test invoice for API testing"
        }
        
        success, response = self.make_request('POST', '/invoices', data=invoice_data)
        
        if success and 'id' in response:
            # Verify calculations
            expected_subtotal = 100.0 + 150.0 + 200.0  # 450.0
            expected_tax = expected_subtotal * 0.08  # 36.0
            expected_total = expected_subtotal + expected_tax - 25.0  # 461.0
            
            actual_subtotal = response.get('subtotal', 0)
            actual_tax = response.get('tax_amount', 0)
            actual_total = response.get('total_amount', 0)
            
            if (abs(actual_subtotal - expected_subtotal) < 0.01 and 
                abs(actual_tax - expected_tax) < 0.01 and 
                abs(actual_total - expected_total) < 0.01):
                self.log_test("Invoice Creation", True, 
                             f"- Invoice created with correct calculations: ${actual_total:.2f}")
                self.test_invoice_id = response['id']
                return True
            else:
                self.log_test("Invoice Creation", False, 
                             f"- Calculation error: Expected ${expected_total:.2f}, got ${actual_total:.2f}")
                return False
        else:
            self.log_test("Invoice Creation", False, f"- {response}")
            return False

    def test_get_invoices(self) -> bool:
        """Test retrieving invoices"""
        print(f"\n🔍 Testing Get Invoices...")
        
        success, response = self.make_request('GET', '/invoices')
        
        if success:
            if isinstance(response, list):
                invoice_found = any(invoice.get('client_id') == self.test_client_id for invoice in response)
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

    def test_invoice_with_invalid_jobs(self) -> bool:
        """Test invoice creation with invalid job IDs"""
        print(f"\n🔍 Testing Invoice with Invalid Jobs...")
        
        invalid_invoice_data = {
            "client_id": self.test_client_id,
            "job_ids": ["00000000-0000-0000-0000-000000000000"],  # Non-existent job ID
            "due_date": (datetime.utcnow() + timedelta(days=30)).isoformat(),
            "tax_rate": 0.08,
            "discount_amount": 0.0
        }
        
        success, response = self.make_request(
            'POST', '/invoices', 
            data=invalid_invoice_data,
            expected_status=400
        )
        
        if success:
            self.log_test("Invoice with Invalid Jobs", True, "- Correctly rejected invalid job IDs")
            return True
        else:
            self.log_test("Invoice with Invalid Jobs", False, f"- {response}")
            return False

    def cleanup_test_data(self) -> bool:
        """Clean up test data"""
        print(f"\n🧹 Cleaning up invoice test data...")
        cleanup_success = True
        
        # Delete test jobs
        for job_id in self.test_job_ids:
            success, response = self.make_request('DELETE', f'/jobs/{job_id}')
            if success:
                print(f"✅ Deleted test job: {job_id}")
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

    def run_invoice_tests(self) -> bool:
        """Run all invoice tests"""
        print("🚀 Starting Jobber Pro Invoice Testing...")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Setup test data
        if not self.setup_test_data():
            print("❌ Failed to setup test data - stopping tests")
            return False
        
        # Run invoice tests
        self.test_create_invoice()
        self.test_get_invoices()
        self.test_invoice_with_invalid_jobs()
        
        # Cleanup
        self.cleanup_test_data()
        
        # Print final results
        print("\n" + "=" * 60)
        print(f"📊 INVOICE TEST RESULTS: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 ALL INVOICE TESTS PASSED! Invoice system is working correctly.")
            return True
        else:
            failed_tests = self.tests_run - self.tests_passed
            print(f"⚠️  {failed_tests} invoice tests failed. Invoice system needs attention.")
            return False

def main():
    """Main function to run the invoice tests"""
    tester = JobberProInvoiceTester()
    success = tester.run_invoice_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())