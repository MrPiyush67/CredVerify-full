"""
Simple test script to verify Surya OCR service is working correctly
Usage: python test_service.py
"""

import requests
import sys

def test_health_check():
    """Test the health check endpoint"""
    print("=" * 60)
    print("Testing Health Check Endpoint")
    print("=" * 60)

    try:
        response = requests.get("http://localhost:5000/health", timeout=5)

        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed")
            print(f"   Status: {data.get('status')}")
            print(f"   Engine: {data.get('engine')}")
            print(f"   Version: {data.get('version')}")
            return True
        else:
            print(f"❌ Health check failed with status {response.status_code}")
            return False

    except requests.exceptions.ConnectionError:
        print("❌ Connection failed - Is the service running on port 5000?")
        print("   Start it with: python app.py")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False


def test_ocr_extraction():
    """Test OCR extraction with a simple test image"""
    print("\n" + "=" * 60)
    print("Testing OCR Extraction")
    print("=" * 60)

    # Simple 1x1 white PNG as base64 (minimal test image)
    test_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="

    try:
        response = requests.post(
            "http://localhost:5000/extract-text",
            json={"imageData": test_image},
            timeout=30
        )

        if response.status_code == 200:
            data = response.json()

            print(f"✅ OCR extraction endpoint works")
            print(f"   Success: {data.get('success')}")
            print(f"   Engine: {data.get('engine')}")

            if data.get('success'):
                print(f"   Text extracted: '{data.get('full_text', '')[:50]}...'")
                print(f"   Confidence: {data.get('avg_confidence', 0):.1f}%")
                print(f"   Lines: {data.get('num_lines', 0)}")
            else:
                print(f"   Error: {data.get('error')}")

            return data.get('success', False)
        else:
            print(f"❌ OCR extraction failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False

    except requests.exceptions.Timeout:
        print("❌ Request timeout - OCR might be loading models (first run)")
        print("   Try again in a few seconds")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False


def main():
    """Run all tests"""
    print("\n🧪 Surya OCR Service Test Suite\n")

    # Test 1: Health check
    health_ok = test_health_check()

    if not health_ok:
        print("\n❌ Service is not running or not accessible")
        print("\nTo start the service:")
        print("  1. cd backend/ocr-service")
        print("  2. source venv/bin/activate  (or venv\\Scripts\\activate on Windows)")
        print("  3. python app.py")
        sys.exit(1)

    # Test 2: OCR extraction
    ocr_ok = test_ocr_extraction()

    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    print(f"Health Check: {'✅ Passed' if health_ok else '❌ Failed'}")
    print(f"OCR Extraction: {'✅ Passed' if ocr_ok else '❌ Failed'}")

    if health_ok and ocr_ok:
        print("\n🎉 All tests passed! Service is ready to use.")
        print("\nNext steps:")
        print("  1. Start Node.js backend: cd ../.. && npm run dev")
        print("  2. Load extension in browser")
        print("  3. Try verifying a certificate")
        sys.exit(0)
    else:
        print("\n⚠️ Some tests failed. Check the errors above.")
        sys.exit(1)


if __name__ == "__main__":
    main()
