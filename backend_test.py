#!/usr/bin/env python3
"""
Backend API Testing for SEO Endpoints
Tests new and modified endpoints plus regression smoke tests.
"""

import requests
import json
import time
from typing import Dict, Any, Optional

# Base URL from .env
BASE_URL = "https://globe-explorer-111.preview.emergentagent.com"
ADMIN_PASSWORD = "Dinamo123$"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def log_test(name: str, passed: bool, details: str = ""):
    """Log test result with color coding"""
    status = f"{Colors.GREEN}✅ PASS{Colors.END}" if passed else f"{Colors.RED}❌ FAIL{Colors.END}"
    print(f"{status} | {name}")
    if details:
        print(f"    {details}")
    return passed

def get_admin_token() -> Optional[str]:
    """Get admin token by logging in"""
    try:
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": ADMIN_PASSWORD},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            return data.get("token")
        return None
    except Exception as e:
        print(f"Failed to get admin token: {e}")
        return None

def test_admin_login():
    """Test admin login endpoint"""
    print(f"\n{Colors.BLUE}=== Testing Admin Login ==={Colors.END}")
    
    # Test with correct password
    try:
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": ADMIN_PASSWORD},
            timeout=10
        )
        passed = response.status_code == 200 and response.json().get("ok") == True
        log_test("POST /api/admin/login with correct password", passed, 
                f"Status: {response.status_code}, Response: {response.json()}")
    except Exception as e:
        log_test("POST /api/admin/login with correct password", False, f"Error: {e}")
    
    # Test with wrong password
    try:
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "wrongpassword"},
            timeout=10
        )
        passed = response.status_code == 401
        log_test("POST /api/admin/login with wrong password", passed, 
                f"Status: {response.status_code}")
    except Exception as e:
        log_test("POST /api/admin/login with wrong password", False, f"Error: {e}")

def test_admin_articles(token: str):
    """Test GET /api/admin/articles endpoint (NEW)"""
    print(f"\n{Colors.BLUE}=== Testing GET /api/admin/articles (NEW) ==={Colors.END}")
    
    # Test without auth token
    try:
        response = requests.get(f"{BASE_URL}/api/admin/articles", timeout=10)
        passed = response.status_code == 401
        log_test("GET /api/admin/articles without token", passed, 
                f"Status: {response.status_code}")
    except Exception as e:
        log_test("GET /api/admin/articles without token", False, f"Error: {e}")
    
    # Test with valid token
    try:
        response = requests.get(
            f"{BASE_URL}/api/admin/articles",
            headers={"X-Admin-Token": token},
            timeout=10
        )
        data = response.json()
        items = data.get("items", [])
        
        # Check status code
        status_ok = response.status_code == 200
        
        # Check response structure
        has_items = "items" in data
        items_is_array = isinstance(items, list)
        
        # Check first item has required fields
        first_item_valid = False
        if items and len(items) > 0:
            item = items[0]
            required_fields = ["id", "slug", "title", "excerpt", "city", "country", "type", "tags"]
            first_item_valid = all(field in item for field in required_fields)
        
        passed = status_ok and has_items and items_is_array and first_item_valid
        log_test("GET /api/admin/articles with valid token", passed, 
                f"Status: {response.status_code}, Items count: {len(items)}, First item fields: {list(items[0].keys()) if items else 'N/A'}")
        
        return items[0] if items else None
    except Exception as e:
        log_test("GET /api/admin/articles with valid token", False, f"Error: {e}")
        return None

def test_regen_meta(token: str, article_id: str, article_slug: str):
    """Test POST /api/admin/regen-meta endpoint (NEW) - COSTS GEMINI CALL"""
    print(f"\n{Colors.BLUE}=== Testing POST /api/admin/regen-meta (NEW) ==={Colors.END}")
    print(f"{Colors.YELLOW}⚠️  WARNING: This test costs a real Gemini API call{Colors.END}")
    
    # Get original excerpt first
    try:
        response = requests.get(f"{BASE_URL}/api/articles/by-slug/{article_slug}", timeout=10)
        original_excerpt = response.json().get("article", {}).get("excerpt", "")
        print(f"    Original excerpt: {original_excerpt[:50]}...")
    except:
        original_excerpt = None
    
    # Test without auth token
    try:
        response = requests.post(
            f"{BASE_URL}/api/admin/regen-meta",
            json={"id": article_id},
            timeout=30
        )
        passed = response.status_code == 401
        log_test("POST /api/admin/regen-meta without token", passed, 
                f"Status: {response.status_code}")
    except Exception as e:
        log_test("POST /api/admin/regen-meta without token", False, f"Error: {e}")
    
    # Test with auth but missing id
    try:
        response = requests.post(
            f"{BASE_URL}/api/admin/regen-meta",
            json={},
            headers={"X-Admin-Token": token},
            timeout=30
        )
        passed = response.status_code in [400, 500]
        log_test("POST /api/admin/regen-meta without id", passed, 
                f"Status: {response.status_code}, Response: {response.json()}")
    except Exception as e:
        log_test("POST /api/admin/regen-meta without id", False, f"Error: {e}")
    
    # Test with auth but non-existent id
    try:
        response = requests.post(
            f"{BASE_URL}/api/admin/regen-meta",
            json={"id": "non-existent-id-12345"},
            headers={"X-Admin-Token": token},
            timeout=30
        )
        passed = response.status_code == 404
        log_test("POST /api/admin/regen-meta with non-existent id", passed, 
                f"Status: {response.status_code}")
    except Exception as e:
        log_test("POST /api/admin/regen-meta with non-existent id", False, f"Error: {e}")
    
    # Test with valid id (COSTS GEMINI CALL)
    try:
        print(f"    Testing with article ID: {article_id}")
        response = requests.post(
            f"{BASE_URL}/api/admin/regen-meta",
            json={"id": article_id},
            headers={"X-Admin-Token": token},
            timeout=30
        )
        data = response.json()
        
        status_ok = response.status_code == 200
        has_ok = data.get("ok") == True
        has_excerpt = "excerpt" in data and len(data.get("excerpt", "")) > 0
        has_length = "length" in data
        
        excerpt = data.get("excerpt", "")
        length = data.get("length", 0)
        
        # Check length is between 60 and 165
        length_valid = 60 <= length <= 165
        
        # Check excerpt is Romanian text (has at least some characters)
        excerpt_valid = len(excerpt) > 0
        
        passed = status_ok and has_ok and has_excerpt and has_length and length_valid and excerpt_valid
        log_test("POST /api/admin/regen-meta with valid id", passed, 
                f"Status: {response.status_code}, Length: {length}, Excerpt: {excerpt[:80]}...")
        
        # Verify DB was updated by fetching the article again
        time.sleep(1)
        response = requests.get(f"{BASE_URL}/api/articles/by-slug/{article_slug}", timeout=10)
        updated_excerpt = response.json().get("article", {}).get("excerpt", "")
        db_updated = updated_excerpt == excerpt
        log_test("POST /api/admin/regen-meta DB update verification", db_updated, 
                f"New excerpt in DB: {updated_excerpt[:80]}...")
        
        # Restore original excerpt
        if original_excerpt:
            print(f"    Restoring original excerpt...")
            try:
                requests.put(
                    f"{BASE_URL}/api/articles/{article_id}",
                    json={"excerpt": original_excerpt},
                    headers={"X-Admin-Token": token},
                    timeout=10
                )
                print(f"    {Colors.GREEN}✓ Original excerpt restored{Colors.END}")
            except Exception as e:
                print(f"    {Colors.RED}✗ Failed to restore original excerpt: {e}{Colors.END}")
        
        return passed
    except Exception as e:
        log_test("POST /api/admin/regen-meta with valid id", False, f"Error: {e}")
        return False

def test_by_slug_link_targets():
    """Test GET /api/articles/by-slug/:slug for linkTargets (MODIFIED)"""
    print(f"\n{Colors.BLUE}=== Testing GET /api/articles/by-slug/:slug (MODIFIED) ==={Colors.END}")
    
    slug = "ghid-complet-paris-7-zile"
    
    try:
        response = requests.get(f"{BASE_URL}/api/articles/by-slug/{slug}", timeout=10)
        data = response.json()
        
        status_ok = response.status_code == 200
        has_article = "article" in data
        has_related = "related" in data
        has_related_groups = "relatedGroups" in data
        has_link_targets = "linkTargets" in data
        
        link_targets = data.get("linkTargets", [])
        link_targets_is_array = isinstance(link_targets, list)
        
        # Check linkTargets structure
        link_targets_valid = False
        self_slug_excluded = True
        if link_targets and len(link_targets) > 0:
            first_target = link_targets[0]
            link_targets_valid = all(field in first_target for field in ["slug", "city", "country"])
            
            # CRITICAL: Check that current article's slug is NOT in linkTargets
            self_slug_excluded = slug not in [t.get("slug") for t in link_targets]
        
        # Get total articles count to verify linkTargets length
        articles_response = requests.get(f"{BASE_URL}/api/articles?limit=100", timeout=10)
        total_articles = articles_response.json().get("total", 0)
        expected_link_targets = total_articles - 1  # All articles except self
        
        length_correct = len(link_targets) == expected_link_targets
        
        passed = (status_ok and has_article and has_related and has_related_groups and 
                 has_link_targets and link_targets_is_array and link_targets_valid and 
                 self_slug_excluded and length_correct)
        
        log_test("GET /api/articles/by-slug/:slug returns linkTargets", passed, 
                f"Status: {response.status_code}, linkTargets count: {len(link_targets)}, Expected: {expected_link_targets}, Self excluded: {self_slug_excluded}, Sample: {link_targets[0] if link_targets else 'N/A'}")
        
        return passed
    except Exception as e:
        log_test("GET /api/articles/by-slug/:slug returns linkTargets", False, f"Error: {e}")
        return False

def test_ai_generate_article(token: str):
    """Test POST /api/ai/generate-article (REGRESSION) - COSTS GEMINI CALL"""
    print(f"\n{Colors.BLUE}=== Testing POST /api/ai/generate-article (REGRESSION) ==={Colors.END}")
    print(f"{Colors.YELLOW}⚠️  WARNING: This test costs a real Gemini API call{Colors.END}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/ai/generate-article",
            json={
                "city": "Bologna",
                "country": "Italia",
                "type": "City Break",
                "duration": "3 zile",
                "budget": "mediu"
            },
            headers={"X-Admin-Token": token},
            timeout=60
        )
        data = response.json()
        
        status_ok = response.status_code == 200
        has_article = "article" in data
        
        article = data.get("article", {})
        required_fields = ["title", "slug", "excerpt", "continent", "country", "city", 
                          "intro", "whenToVisit", "budget", "transport", "accommodation",
                          "attractions", "restaurants", "tips", "tags", "cover", "gallery",
                          "readingMinutes", "type", "author", "publishedAt", "_provider"]
        
        all_fields_present = all(field in article for field in required_fields)
        provider_valid = article.get("_provider", "").startswith(("gemini/", "emergent"))
        
        passed = status_ok and has_article and all_fields_present and provider_valid
        log_test("POST /api/ai/generate-article", passed, 
                f"Status: {response.status_code}, Provider: {article.get('_provider')}, Title: {article.get('title', 'N/A')[:50]}...")
        
        # Save and cleanup
        if passed and article.get("id"):
            article_id = article.get("id")
            # Delete the generated article
            try:
                requests.delete(
                    f"{BASE_URL}/api/articles/{article_id}",
                    headers={"X-Admin-Token": token},
                    timeout=10
                )
                print(f"    {Colors.GREEN}✓ Test article cleaned up{Colors.END}")
            except:
                pass
        
        return passed
    except Exception as e:
        log_test("POST /api/ai/generate-article", False, f"Error: {e}")
        return False

def test_regression_smoke():
    """Test existing endpoints (REGRESSION SMOKE)"""
    print(f"\n{Colors.BLUE}=== Testing Regression Smoke Tests ==={Colors.END}")
    
    # GET /api/articles
    try:
        response = requests.get(f"{BASE_URL}/api/articles", timeout=10)
        data = response.json()
        passed = response.status_code == 200 and "items" in data
        log_test("GET /api/articles", passed, 
                f"Status: {response.status_code}, Items: {len(data.get('items', []))}")
    except Exception as e:
        log_test("GET /api/articles", False, f"Error: {e}")
    
    # GET /api/articles/meta
    try:
        response = requests.get(f"{BASE_URL}/api/articles/meta", timeout=10)
        data = response.json()
        passed = (response.status_code == 200 and 
                 "continents" in data and "countries" in data and "types" in data)
        log_test("GET /api/articles/meta", passed, 
                f"Status: {response.status_code}, Continents: {len(data.get('continents', []))}")
    except Exception as e:
        log_test("GET /api/articles/meta", False, f"Error: {e}")
    
    # GET /sitemap.xml
    try:
        response = requests.get(f"{BASE_URL}/sitemap.xml", timeout=10)
        content_type = response.headers.get("Content-Type", "")
        passed = (response.status_code == 200 and 
                 "xml" in content_type.lower() and 
                 "charset=utf-8" in content_type.lower())
        log_test("GET /sitemap.xml", passed, 
                f"Status: {response.status_code}, Content-Type: {content_type}")
    except Exception as e:
        log_test("GET /sitemap.xml", False, f"Error: {e}")
    
    # GET /feed.xml
    try:
        response = requests.get(f"{BASE_URL}/feed.xml", timeout=10)
        passed = response.status_code == 200 and "<rss" in response.text
        log_test("GET /feed.xml", passed, 
                f"Status: {response.status_code}, Valid RSS: {passed}")
    except Exception as e:
        log_test("GET /feed.xml", False, f"Error: {e}")
    
    # GET /robots.txt
    try:
        response = requests.get(f"{BASE_URL}/robots.txt", timeout=10)
        passed = response.status_code == 200 and "Sitemap:" in response.text
        log_test("GET /robots.txt", passed, 
                f"Status: {response.status_code}, Has Sitemap directive: {passed}")
    except Exception as e:
        log_test("GET /robots.txt", False, f"Error: {e}")

def main():
    """Run all tests"""
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}Backend API Testing - SEO Endpoints{Colors.END}")
    print(f"{Colors.BLUE}Base URL: {BASE_URL}{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}")
    
    # Get admin token
    print(f"\n{Colors.YELLOW}Getting admin token...{Colors.END}")
    token = get_admin_token()
    if not token:
        print(f"{Colors.RED}Failed to get admin token. Aborting tests.{Colors.END}")
        return
    print(f"{Colors.GREEN}✓ Admin token obtained{Colors.END}")
    
    # Run tests
    test_admin_login()
    
    # Test new endpoints
    article = test_admin_articles(token)
    
    if article:
        # Test regen-meta on ONE article only (costs Gemini call)
        test_regen_meta(token, article["id"], article["slug"])
    
    # Test modified endpoint
    test_by_slug_link_targets()
    
    # Test AI generate (costs Gemini call)
    test_ai_generate_article(token)
    
    # Regression smoke tests
    test_regression_smoke()
    
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.GREEN}Testing complete!{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")

if __name__ == "__main__":
    main()
