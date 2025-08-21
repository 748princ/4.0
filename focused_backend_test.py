#!/usr/bin/env python3
"""
Focused Backend API Testing for Jobber Pro - Post User Feedback Fixes
Tests specific endpoints mentioned in the review request:
1. Calendar, Team Management, and Custom Forms endpoints
2. Time Tracking removal verification
3. Inventory verification
4. Authentication verification
"""

import requests
import sys
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

class FocusedJobberProTester:
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
        self.test_technician_id = None
        self.test_form_id = None
        
        # Test data
        self.test_timestamp = datetime.now().strftime('%H%M%S')
        self.test_user = {
            "email": f"focus_test_{self.test_timestamp}@example.com",
            "password": "TestPass123!",
            "full_name": f"Focus Test User {self.test_timestamp}",
            "company_name": f"Focus Test Company {self.test_timestamp}",
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

    def setup_test_data(self) -> bool:
        """Setup test data for focused testing"""
        print(f"\n🔧 Setting up test data...")
        
        # Register user
        success, response = self.make_request(
            'POST', '/auth/register', 
            data=self.test_user, 
            expected_status=200,
            auth_required=False
        )
        
        if not success or 'access_token' not in response:
            print(f"❌ Failed to register test user: {response}")
            return False
        
        self.token = response['access_token']
        self.user_data = response.get('user', {})
        print(f"✅ Test user registered: {self.user_data.get('full_name')}")
        
        # Create test client
        client_data = {
            "name": f"Focus Test Client {self.test_timestamp}",
            "email": f"client_{self.test_timestamp}@example.com",
            "phone": "+1987654321",
            "address": "123 Test Street, Test City, TC 12345",
            "contact_person": "John Doe"
        }
        
        success, response = self.make_request('POST', '/clients', data=client_data)
        if success and 'id' in response:
            self.test_client_id = response['id']
            print(f"✅ Test client created: {self.test_client_id}")
        else:
            print(f"❌ Failed to create test client: {response}")
            return False
        
        # Create test job with scheduled date for Calendar
        job_data = {
            "title": f"Focus Test Job {self.test_timestamp}",
            "description": "Test job for Calendar view testing",
            "client_id": self.test_client_id,
            "service_type": "Maintenance",
            "priority": "medium",
            "scheduled_date": (datetime.utcnow() + timedelta(days=1)).isoformat(),
            "estimated_duration": 120,
            "estimated_cost": 250.00,
            "assigned_technician_id": None
        }
        
        success, response = self.make_request('POST', '/jobs', data=job_data)
        if success and 'id' in response:
            self.test_job_id = response['id']
            print(f"✅ Test job created: {self.test_job_id}")
        else:
            print(f"❌ Failed to create test job: {response}")
            return False
        
        return True

    def test_authentication_verification(self) -> bool:
        """Test JWT authentication is working properly"""
        print(f"\n🔍 Testing Authentication Verification...")
        
        # Test with valid token
        success, response = self.make_request('GET', '/dashboard/stats')
        if not success:
            self.log_test("Authentication - Valid Token", False, f"- Failed with valid token: {response}")
            return False
        
        # Test with invalid token
        old_token = self.token
        self.token = "invalid_token_12345"
        success, response = self.make_request('GET', '/dashboard/stats', expected_status=401)
        
        if success:
            self.log_test("Authentication - Invalid Token Rejection", True, "- Invalid token properly rejected")
        else:
            self.log_test("Authentication - Invalid Token Rejection", False, f"- Invalid token was accepted: {response}")
            self.token = old_token
            return False
        
        # Restore valid token
        self.token = old_token
        
        # Test protected endpoint access
        success, response = self.make_request('GET', '/dashboard/stats')
        if success:
            self.log_test("Authentication Verification", True, "- JWT authentication working properly")
            return True
        else:
            self.log_test("Authentication Verification", False, f"- Failed to access protected endpoint: {response}")
            return False

    def test_calendar_endpoints(self) -> bool:
        """Test Calendar-related endpoints (GET /jobs, GET /clients)"""
        print(f"\n🔍 Testing Calendar Endpoints...")
        
        # Test GET /jobs (Calendar needs jobs with scheduled dates)
        success, response = self.make_request('GET', '/jobs')
        if not success:
            self.log_test("Calendar - GET /jobs", False, f"- {response}")
            return False
        
        if not isinstance(response, list):
            self.log_test("Calendar - GET /jobs", False, f"- Expected list, got: {type(response)}")
            return False
        
        # Check if jobs have scheduled_date field
        jobs_with_dates = [job for job in response if 'scheduled_date' in job]
        if len(jobs_with_dates) == 0 and len(response) > 0:
            self.log_test("Calendar - GET /jobs", False, "- Jobs missing scheduled_date field")
            return False
        
        self.log_test("Calendar - GET /jobs", True, f"- Found {len(response)} jobs, {len(jobs_with_dates)} with scheduled dates")
        
        # Test GET /clients (Calendar needs client data)
        success, response = self.make_request('GET', '/clients')
        if not success:
            self.log_test("Calendar - GET /clients", False, f"- {response}")
            return False
        
        if not isinstance(response, list):
            self.log_test("Calendar - GET /clients", False, f"- Expected list, got: {type(response)}")
            return False
        
        self.log_test("Calendar - GET /clients", True, f"- Found {len(response)} clients")
        
        return True

    def test_team_management_endpoints(self) -> bool:
        """Test Team Management endpoints (GET /technicians)"""
        print(f"\n🔍 Testing Team Management Endpoints...")
        
        # First create a test technician
        technician_data = {
            "email": f"tech_{self.test_timestamp}@example.com",
            "password": "TechPass123!",
            "full_name": f"Focus Test Technician {self.test_timestamp}",
            "phone": "+1555123456",
            "skills": ["Plumbing", "Electrical"],
            "hourly_rate": 45.00,
            "hire_date": datetime.utcnow().isoformat()
        }
        
        success, response = self.make_request('POST', '/technicians', data=technician_data)
        if success and 'id' in response:
            self.test_technician_id = response['id']
            print(f"✅ Test technician created: {self.test_technician_id}")
        else:
            print(f"⚠️ Could not create test technician: {response}")
        
        # Test GET /technicians
        success, response = self.make_request('GET', '/technicians')
        if not success:
            self.log_test("Team Management - GET /technicians", False, f"- {response}")
            return False
        
        if not isinstance(response, list):
            self.log_test("Team Management - GET /technicians", False, f"- Expected list, got: {type(response)}")
            return False
        
        # Check if technicians have required fields for frontend
        required_fields = ['id', 'full_name', 'email', 'skills', 'hourly_rate']
        if response:
            first_tech = response[0]
            missing_fields = [field for field in required_fields if field not in first_tech]
            if missing_fields:
                self.log_test("Team Management - GET /technicians", False, f"- Missing fields: {missing_fields}")
                return False
        
        self.log_test("Team Management - GET /technicians", True, f"- Found {len(response)} technicians with required fields")
        return True

    def test_custom_forms_endpoints(self) -> bool:
        """Test Custom Forms endpoints (GET /forms)"""
        print(f"\n🔍 Testing Custom Forms Endpoints...")
        
        # First create a test form
        form_data = {
            "name": f"Focus Test Form {self.test_timestamp}",
            "description": "A test form for frontend integration testing",
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
                }
            ]
        }
        
        success, response = self.make_request('POST', '/forms', data=form_data)
        if success and 'id' in response:
            self.test_form_id = response['id']
            print(f"✅ Test form created: {self.test_form_id}")
        else:
            print(f"⚠️ Could not create test form: {response}")
        
        # Test GET /forms
        success, response = self.make_request('GET', '/forms')
        if not success:
            self.log_test("Custom Forms - GET /forms", False, f"- {response}")
            return False
        
        if not isinstance(response, list):
            self.log_test("Custom Forms - GET /forms", False, f"- Expected list, got: {type(response)}")
            return False
        
        # Check if forms have required fields for frontend
        required_fields = ['id', 'name', 'description', 'service_types', 'fields']
        if response:
            first_form = response[0]
            missing_fields = [field for field in required_fields if field not in first_form]
            if missing_fields:
                self.log_test("Custom Forms - GET /forms", False, f"- Missing fields: {missing_fields}")
                return False
        
        self.log_test("Custom Forms - GET /forms", True, f"- Found {len(response)} forms with required fields")
        return True

    def test_time_tracking_removal(self) -> bool:
        """Check if Time Tracking endpoints still exist (should be removed)"""
        print(f"\n🔍 Testing Time Tracking Removal...")
        
        time_tracking_endpoints = [
            '/time-entries',
            '/time-entries/active',
            f'/jobs/{self.test_job_id}/time-entries' if self.test_job_id else '/jobs/test/time-entries',
            f'/jobs/{self.test_job_id}/total-time' if self.test_job_id else '/jobs/test/total-time'
        ]
        
        existing_endpoints = []
        
        for endpoint in time_tracking_endpoints:
            success, response = self.make_request('GET', endpoint, expected_status=404)
            if not success:  # If we get 404, that's good (endpoint doesn't exist)
                continue
            else:  # If we get 200, the endpoint still exists
                existing_endpoints.append(endpoint)
        
        if existing_endpoints:
            self.log_test("Time Tracking Removal", False, f"- Still existing endpoints: {existing_endpoints}")
            return False
        else:
            self.log_test("Time Tracking Removal", True, "- All time tracking endpoints properly removed")
            return True

    def test_inventory_verification(self) -> bool:
        """Quick verification that inventory endpoints are functional"""
        print(f"\n🔍 Testing Inventory Verification...")
        
        # Test GET /inventory/items
        success, response = self.make_request('GET', '/inventory/items')
        if not success:
            self.log_test("Inventory - GET /inventory/items", False, f"- {response}")
            return False
        
        # Check response structure
        if not isinstance(response, dict) or 'items' not in response:
            self.log_test("Inventory - GET /inventory/items", False, f"- Expected dict with 'items' key, got: {response}")
            return False
        
        items = response['items']
        if not isinstance(items, list):
            self.log_test("Inventory - GET /inventory/items", False, f"- Expected items to be list, got: {type(items)}")
            return False
        
        self.log_test("Inventory - GET /inventory/items", True, f"- Found {len(items)} inventory items")
        
        # Test GET /inventory/analytics
        success, response = self.make_request('GET', '/inventory/analytics')
        if not success:
            self.log_test("Inventory - GET /inventory/analytics", False, f"- {response}")
            return False
        
        # Check required analytics fields
        required_fields = ['total_items', 'total_value', 'low_stock_items', 'category_breakdown']
        missing_fields = [field for field in required_fields if field not in response]
        
        if missing_fields:
            self.log_test("Inventory - GET /inventory/analytics", False, f"- Missing fields: {missing_fields}")
            return False
        
        total_items = response.get('total_items', 0)
        total_value = response.get('total_value', 0)
        self.log_test("Inventory - GET /inventory/analytics", True, f"- Analytics working: {total_items} items, ${total_value:.2f} value")
        
        return True

    def test_main_data_loading_endpoints(self) -> bool:
        """Test the main data loading endpoints that frontend components need"""
        print(f"\n🔍 Testing Main Data Loading Endpoints...")
        
        endpoints_to_test = [
            ('/technicians', 'Team Management'),
            ('/forms', 'Custom Forms'),
            ('/jobs', 'Calendar'),
            ('/clients', 'General')
        ]
        
        all_passed = True
        
        for endpoint, component in endpoints_to_test:
            success, response = self.make_request('GET', endpoint)
            
            if not success:
                self.log_test(f"Data Loading - {component} ({endpoint})", False, f"- {response}")
                all_passed = False
                continue
            
            if not isinstance(response, list):
                self.log_test(f"Data Loading - {component} ({endpoint})", False, f"- Expected list, got: {type(response)}")
                all_passed = False
                continue
            
            self.log_test(f"Data Loading - {component} ({endpoint})", True, f"- Loaded {len(response)} records")
        
        return all_passed

    def run_focused_tests(self) -> bool:
        """Run focused tests based on review request"""
        print("🎯 Starting Focused Jobber Pro API Testing...")
        print(f"📍 Testing against: {self.base_url}")
        print("🔍 Focus Areas: Calendar, Team Management, Custom Forms, Time Tracking Removal, Inventory, Authentication")
        print("=" * 80)
        
        # Setup test data
        if not self.setup_test_data():
            print("❌ Failed to setup test data - stopping tests")
            return False
        
        # Run focused tests
        test_results = []
        
        print("\n" + "="*50)
        print("PRIMARY FOCUS TESTS")
        print("="*50)
        
        # 1. Authentication verification
        test_results.append(self.test_authentication_verification())
        
        # 2. Main data loading endpoints
        test_results.append(self.test_main_data_loading_endpoints())
        
        # 3. Calendar endpoints
        test_results.append(self.test_calendar_endpoints())
        
        # 4. Team Management endpoints
        test_results.append(self.test_team_management_endpoints())
        
        # 5. Custom Forms endpoints
        test_results.append(self.test_custom_forms_endpoints())
        
        print("\n" + "="*50)
        print("VERIFICATION TESTS")
        print("="*50)
        
        # 6. Time Tracking removal check
        test_results.append(self.test_time_tracking_removal())
        
        # 7. Inventory verification
        test_results.append(self.test_inventory_verification())
        
        # Print summary
        print("\n" + "="*60)
        print("FOCUSED TEST SUMMARY")
        print("="*60)
        print(f"Total Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if all(test_results):
            print("\n🎉 ALL FOCUSED TESTS PASSED!")
            print("✅ Calendar, Team Management, and Custom Forms endpoints are working properly")
            print("✅ Authentication is working correctly")
            print("✅ Time Tracking has been properly removed")
            print("✅ Inventory endpoints are functional")
            return True
        else:
            print("\n⚠️ SOME TESTS FAILED - See details above")
            failed_areas = []
            if not test_results[0]: failed_areas.append("Authentication")
            if not test_results[1]: failed_areas.append("Main Data Loading")
            if not test_results[2]: failed_areas.append("Calendar Endpoints")
            if not test_results[3]: failed_areas.append("Team Management")
            if not test_results[4]: failed_areas.append("Custom Forms")
            if not test_results[5]: failed_areas.append("Time Tracking Removal")
            if not test_results[6]: failed_areas.append("Inventory Verification")
            
            print(f"❌ Failed Areas: {', '.join(failed_areas)}")
            return False

if __name__ == "__main__":
    tester = FocusedJobberProTester()
    success = tester.run_focused_tests()
    sys.exit(0 if success else 1)