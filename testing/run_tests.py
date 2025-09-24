#!/usr/bin/env python3
"""
Test Runner for School Management System
"""
import os
import sys
import subprocess
import argparse
from pathlib import Path

def run_command(command, description):
    """Run a command and return the result"""
    print(f"\n{'='*60}")
    print(f"Running: {description}")
    print(f"Command: {command}")
    print(f"{'='*60}")
    
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    
    if result.stdout:
        print("STDOUT:")
        print(result.stdout)
    
    if result.stderr:
        print("STDERR:")
        print(result.stderr)
    
    return result.returncode == 0

def install_dependencies():
    """Install test dependencies"""
    print("Installing test dependencies...")
    return run_command("pip install -r requirements.txt", "Installing dependencies")

def run_smoke_tests():
    """Run smoke tests"""
    return run_command(
        "pytest tests/e2e/test_authentication.py::TestAuthentication::test_admin_login_success -v",
        "Running smoke tests"
    )

def run_regression_tests():
    """Run regression tests"""
    return run_command(
        "pytest tests/e2e/ -v --tb=short",
        "Running regression tests"
    )

def run_integration_tests():
    """Run integration tests"""
    return run_command(
        "pytest tests/integration/ -v --tb=short",
        "Running integration tests"
    )

def run_performance_tests():
    """Run performance tests"""
    return run_command(
        "pytest tests/performance/ -v --tb=short -m performance",
        "Running performance tests"
    )

def run_api_tests():
    """Run API tests"""
    return run_command(
        "pytest tests/integration/test_api_integration.py -v --tb=short",
        "Running API tests"
    )

def run_ui_tests():
    """Run UI tests"""
    return run_command(
        "pytest tests/e2e/ -v --tb=short -m ui",
        "Running UI tests"
    )

def run_security_tests():
    """Run security tests"""
    return run_command(
        "pytest tests/e2e/test_authentication.py -v --tb=short -m security",
        "Running security tests"
    )

def run_negative_tests():
    """Run negative test cases"""
    return run_command(
        "pytest tests/e2e/ -v --tb=short -m negative",
        "Running negative test cases"
    )

def run_edge_case_tests():
    """Run edge case tests"""
    return run_command(
        "pytest tests/e2e/ -v --tb=short -m edge_case",
        "Running edge case tests"
    )

def run_all_tests():
    """Run all tests"""
    return run_command(
        "pytest tests/ -v --tb=short",
        "Running all tests"
    )

def run_parallel_tests():
    """Run tests in parallel"""
    return run_command(
        "pytest tests/ -v --tb=short -n auto",
        "Running tests in parallel"
    )

def generate_report():
    """Generate test report"""
    print("\nGenerating test report...")
    
    # Generate HTML report
    run_command(
        "pytest tests/ --html=reports/report.html --self-contained-html",
        "Generating HTML report"
    )
    
    # Generate coverage report
    run_command(
        "pytest tests/ --cov=. --cov-report=html:reports/coverage --cov-report=term-missing",
        "Generating coverage report"
    )
    
    # Generate Allure report
    run_command(
        "allure generate reports/allure-results -o reports/allure-report --clean",
        "Generating Allure report"
    )
    
    print("\nReports generated:")
    print("- HTML Report: reports/report.html")
    print("- Coverage Report: reports/coverage/index.html")
    print("- Allure Report: reports/allure-report/index.html")

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="School Management System Test Runner")
    parser.add_argument("--test-type", choices=[
        "smoke", "regression", "integration", "performance", 
        "api", "ui", "security", "negative", "edge_case", "all"
    ], default="all", help="Type of tests to run")
    parser.add_argument("--parallel", action="store_true", help="Run tests in parallel")
    parser.add_argument("--install-deps", action="store_true", help="Install dependencies first")
    parser.add_argument("--generate-report", action="store_true", help="Generate test report")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    
    args = parser.parse_args()
    
    # Change to testing directory
    os.chdir(Path(__file__).parent)
    
    # Create reports directory
    os.makedirs("reports", exist_ok=True)
    
    success = True
    
    # Install dependencies if requested
    if args.install_deps:
        success &= install_dependencies()
    
    # Run tests based on type
    if args.test_type == "smoke":
        success &= run_smoke_tests()
    elif args.test_type == "regression":
        success &= run_regression_tests()
    elif args.test_type == "integration":
        success &= run_integration_tests()
    elif args.test_type == "performance":
        success &= run_performance_tests()
    elif args.test_type == "api":
        success &= run_api_tests()
    elif args.test_type == "ui":
        success &= run_ui_tests()
    elif args.test_type == "security":
        success &= run_security_tests()
    elif args.test_type == "negative":
        success &= run_negative_tests()
    elif args.test_type == "edge_case":
        success &= run_edge_case_tests()
    elif args.test_type == "all":
        if args.parallel:
            success &= run_parallel_tests()
        else:
            success &= run_all_tests()
    
    # Generate report if requested
    if args.generate_report:
        generate_report()
    
    # Print final result
    print(f"\n{'='*60}")
    if success:
        print("✅ All tests completed successfully!")
    else:
        print("❌ Some tests failed!")
    print(f"{'='*60}")
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
