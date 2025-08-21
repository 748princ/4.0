#!/usr/bin/env python3
"""
Edge Case and Error Handling Tests for Jobber Pro Backend API
Tests authentication, authorization, validation, and error scenarios.
"""

import requests
import sys
import json
from datetime import datetime, timedelta

class JobberProEdgeCaseTester:
    def __init__(self, base_url: str = "https://feature-boost-5.preview.emergentagent.com"):
        self.base_url = base_url.rstrip('/')
        self.api_url = f"{self.base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        
        # Test data
        self.test_timestamp = datetime.now().strftime('%H%M%S')
        self.test_user = {
            "email": f"edge_test_{self.test_timestamp}@example.com",
            "password": "TestPass123!",
            "full_name": f"Edge Test User {self.test_timestamp}",
            "company_name": f"Edge Test Company {self.test_timestamp}",
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

    def setup_auth(self) -> bool:
        """Setup authentication for tests"""
        # Register user
        success, response = self.make_request(
            'POST', '/auth/register', 
            data=self.test_user, 
            expected_status=200,
            auth_required=False
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            return True
        return False

    def test_duplicate_registration(self) -> bool:
        """Test duplicate user registration"""
        print(f"\n🔍 Testing Duplicate Registration...")
        success, response = self.make_request(
            'POST', '/auth/register', 
            data=self.test_user, 
            expected_status=400,
            auth_required=False
        )
        
        if success and 'already registered' in str(response).lower():
            self.log_test("Duplicate Registration", True, "- Correctly rejected duplicate email")
            return True
        else:
            self.log_test("Duplicate Registration", False, f"- {response}")
            return False

    def test_invalid_login(self) -> bool:
        """Test invalid login credentials"""
        print(f"\n🔍 Testing Invalid Login...")
        invalid_login = {
            "email": self.test_user["email"],
            "password": "WrongPassword123!"
        }
        
        success, response = self.make_request(
            'POST', '/auth/login',
            data=invalid_login,
            expected_status=401,
            auth_required=False
        )
        
        if success:
            self.log_test("Invalid Login", True, "- Correctly rejected invalid credentials")
            return True
        else:
            self.log_test("Invalid Login", False, f"- {response}")
            return False

    def test_unauthorized_access(self) -> bool:
        """Test accessing protected endpoints without token"""
        print(f"\n🔍 Testing Unauthorized Access...")
        
        # Temporarily remove token
        original_token = self.token
        self.token = None
        
        success, response = self.make_request(
            'GET', '/clients',
            expected_status=403,
            auth_required=True
        )
        
        # Restore token
        self.token = original_token
        
        if success or response.get('status_code') == 403:
            self.log_test("Unauthorized Access", True, "- Correctly blocked unauthorized access")
            return True
        else:
            self.log_test("Unauthorized Access", False, f"- {response}")
            return False

    def test_invalid_client_data(self) -> bool:
        """Test client creation with invalid data"""
        print(f"\n🔍 Testing Invalid Client Data...")
        invalid_client = {
            "name": "",  # Empty name
            "email": "invalid-email",  # Invalid email format
            "phone": "",  # Empty phone
            "address": ""  # Empty address
        }
        
        success, response = self.make_request(
            'POST', '/clients',
            data=invalid_client,
            expected_status=422
        )
        
        if success:
            self.log_test("Invalid Client Data", True, "- Correctly rejected invalid client data")
            return True
        else:
            self.log_test("Invalid Client Data", False, f"- {response}")
            return False

    def test_nonexistent_client(self) -> bool:
        """Test accessing non-existent client"""
        print(f"\n🔍 Testing Non-existent Client...")
        fake_client_id = "00000000-0000-0000-0000-000000000000"
        
        success, response = self.make_request(
            'GET', f'/clients/{fake_client_id}',
            expected_status=404
        )
        
        if success:
            self.log_test("Non-existent Client", True, "- Correctly returned 404 for non-existent client")
            return True
        else:
            self.log_test("Non-existent Client", False, f"- {response}")
            return False

    def test_invalid_job_status(self) -> bool:
        """Test updating job with invalid status"""
        print(f"\n🔍 Testing Invalid Job Status...")
        
        # First create a client and job
        client_data = {
            "name": f"Test Client {self.test_timestamp}",
            "email": f"client_{self.test_timestamp}@example.com",
            "phone": "+1987654321",
            "address": "123 Test Street"
        }
        
        success, client_response = self.make_request('POST', '/clients', data=client_data)
        if not success:
            self.log_test("Invalid Job Status", False, "- Failed to create test client")
            return False
        
        client_id = client_response['id']
        
        job_data = {
            "title": f"Test Job {self.test_timestamp}",
            "client_id": client_id,
            "service_type": "Test",
            "scheduled_date": (datetime.utcnow() + timedelta(days=1)).isoformat(),
            "estimated_duration": 60,
            "estimated_cost": 100.0
        }
        
        success, job_response = self.make_request('POST', '/jobs', data=job_data)
        if not success:
            self.log_test("Invalid Job Status", False, "- Failed to create test job")
            return False
        
        job_id = job_response['id']
        
        # Try to update with invalid status
        success, response = self.make_request(
            'PUT', f'/jobs/{job_id}/status?status=invalid_status',
            expected_status=400
        )
        
        # Cleanup
        self.make_request('DELETE', f'/jobs/{job_id}')
        self.make_request('DELETE', f'/clients/{client_id}')
        
        if success:
            self.log_test("Invalid Job Status", True, "- Correctly rejected invalid job status")
            return True
        else:
            self.log_test("Invalid Job Status", False, f"- {response}")
            return False

    def test_company_isolation(self) -> bool:
        """Test that users can only access their company's data"""
        print(f"\n🔍 Testing Company Isolation...")
        
        # Create a second user with different company
        second_user = {
            "email": f"second_user_{self.test_timestamp}@example.com",
            "password": "TestPass123!",
            "full_name": f"Second User {self.test_timestamp}",
            "company_name": f"Second Company {self.test_timestamp}",
            "phone": "+1234567891"
        }
        
        # Register second user
        success, response = self.make_request(
            'POST', '/auth/register',
            data=second_user,
            auth_required=False
        )
        
        if not success:
            self.log_test("Company Isolation", False, "- Failed to create second user")
            return False
        
        second_token = response['access_token']
        
        # Create client with first user
        client_data = {
            "name": f"Isolation Test Client {self.test_timestamp}",
            "email": f"isolation_client_{self.test_timestamp}@example.com",
            "phone": "+1987654321",
            "address": "123 Isolation Street"
        }
        
        success, client_response = self.make_request('POST', '/clients', data=client_data)
        if not success:
            self.log_test("Company Isolation", False, "- Failed to create test client")
            return False
        
        client_id = client_response['id']
        
        # Try to access client with second user's token
        original_token = self.token
        self.token = second_token
        
        success, response = self.make_request(
            'GET', f'/clients/{client_id}',
            expected_status=404
        )
        
        # Restore original token and cleanup
        self.token = original_token
        self.make_request('DELETE', f'/clients/{client_id}')
        
        if success:
            self.log_test("Company Isolation", True, "- Company isolation working correctly")
            return True
        else:
            self.log_test("Company Isolation", False, f"- {response}")
            return False

    def run_edge_case_tests(self) -> bool:
        """Run all edge case tests"""
        print("🚀 Starting Jobber Pro Edge Case Testing...")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Setup authentication
        if not self.setup_auth():
            print("❌ Failed to setup authentication - stopping tests")
            return False
        
        # Run edge case tests
        self.test_duplicate_registration()
        self.test_invalid_login()
        self.test_unauthorized_access()
        self.test_invalid_client_data()
        self.test_nonexistent_client()
        self.test_invalid_job_status()
        self.test_company_isolation()
        
        # Print final results
        print("\n" + "=" * 60)
        print(f"📊 EDGE CASE TEST RESULTS: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 ALL EDGE CASE TESTS PASSED! Backend error handling is robust.")
            return True
        else:
            failed_tests = self.tests_run - self.tests_passed
            print(f"⚠️  {failed_tests} edge case tests failed. Backend needs attention.")
            return False

def main():
    """Main function to run the edge case tests"""
    tester = JobberProEdgeCaseTester()
    success = tester.run_edge_case_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())