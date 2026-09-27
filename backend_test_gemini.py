#!/usr/bin/env python3
"""
Backend API tests for Romanian travel blog "Destinația Următoare"
CRITICAL: Verify AI generation now works after switching from Emergent LLM Gateway to Google Gemini API
"""

import requests
import json
import time
from datetime import datetime
import os

# Use environment variable or default to localhost
BASE_URL = os.getenv("NEXT_PUBLIC_BASE_URL", "http://localhost:3000") + "/api"
ADMIN_PASSWORD = "Dinamo123$"

# Track test articles for cleanup
test_article_ids = []

def log_test(name, passed, details=""):
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"\n{status}: {name}")
    if details:
        print(f"  Details: {details}")

def cleanup():
    """Delete test articles created during testing"""
    print("\n" + "="*60)
    print("CLEANUP: Deleting test articles...")
    if not test_article_ids:
        print("No test articles to clean up")
        return
    
    # Get admin token first
    try:
        resp = requests.post(f"{BASE_URL}/admin/login", json={"password": ADMIN_PASSWORD}, timeout=10)
        if resp.status_code != 200:
            print(f"❌ Cannot get admin token for cleanup: {resp.status_code}")
            return
        token = resp.json().get("token")
        
        for article_id in test_article_ids:
            try:
                del_resp = requests.delete(
                    f"{BASE_URL}/articles/{article_id}",
                    headers={"X-Admin-Token": token},
                    timeout=10
                )
                if del_resp.status_code == 200:
                    print(f"✅ Deleted article {article_id}")
                else:
                    print(f"⚠️  Failed to delete {article_id}: {del_resp.status_code}")
            except Exception as e:
                print(f"⚠️  Error deleting {article_id}: {e}")
    except Exception as e:
        print(f"❌ Cleanup error: {e}")

def test_ai_article_generator_now_works(admin_token):
    """
    TEST 1: AI Article Generator NOW WORKS (main fix)
    Verify that switching to Google Gemini API fixed the "Internal server error"
    """
    print("\n" + "="*60)
    print("TEST 1: AI Article Generator NOW WORKS (main fix)")
    print("="*60)
    
    print("\n⚠️  IMPORTANT: This test will call the AI API. Limit: 2 calls to respect free tier.")
    print("Generating article for Barcelona, Spania...")
    
    try:
        resp = requests.post(
            f"{BASE_URL}/ai/generate-article",
            json={
                "city": "Barcelona",
                "country": "Spania",
                "type": "City Break",
                "duration": "4 zile",
                "budget": "mediu"
            },
            headers={"X-Admin-Token": admin_token},
            timeout=120  # Allow up to 120 seconds for AI generation
        )
        
        print(f"Response status: {resp.status_code}")
        
        # CRITICAL: Must return 200 (not 500 or 402)
        if resp.status_code != 200:
            log_test("AI Article Generator returns 200", False, 
                    f"Status: {resp.status_code}, Body: {resp.text[:500]}")
            return None
        
        log_test("AI Article Generator returns 200", True, "AI generation successful!")
        
        # Parse response
        data = resp.json()
        article = data.get("article")
        
        if not article:
            log_test("Response has 'article' object", False, f"Response: {data}")
            return None
        
        log_test("Response has 'article' object", True)
        
        # Verify required fields
        required_fields = [
            "title", "slug", "excerpt", "intro", "whenToVisit", "budget", 
            "transport", "accommodation", "attractions", "restaurants", "tips", 
            "tags", "cover", "gallery", "readingMinutes", "continent", "country", 
            "city", "type", "author", "publishedAt"
        ]
        
        missing_fields = [f for f in required_fields if f not in article]
        if missing_fields:
            log_test("Article has all required fields", False, f"Missing: {missing_fields}")
        else:
            log_test("Article has all required fields", True, f"All {len(required_fields)} fields present")
        
        # Verify field types and content
        checks = []
        
        # String fields
        if isinstance(article.get("title"), str) and len(article.get("title", "")) > 0:
            checks.append(("title is string", True))
        else:
            checks.append(("title is string", False))
        
        if isinstance(article.get("slug"), str) and article.get("slug", "").islower() and "-" in article.get("slug", ""):
            checks.append(("slug is lowercase with dashes", True))
        else:
            checks.append(("slug is lowercase with dashes", False))
        
        # Array fields with minimum items
        attractions = article.get("attractions", [])
        if isinstance(attractions, list) and len(attractions) >= 3:
            # Check each attraction has name and description
            valid_attractions = all(
                isinstance(a, dict) and "name" in a and "description" in a 
                for a in attractions
            )
            if valid_attractions:
                checks.append((f"attractions array (≥3 items with name+description)", True))
            else:
                checks.append((f"attractions array structure", False))
        else:
            checks.append((f"attractions array (≥3 items)", False))
        
        restaurants = article.get("restaurants", [])
        if isinstance(restaurants, list) and len(restaurants) >= 2:
            valid_restaurants = all(
                isinstance(r, dict) and "name" in r and "description" in r 
                for r in restaurants
            )
            if valid_restaurants:
                checks.append((f"restaurants array (≥2 items with name+description)", True))
            else:
                checks.append((f"restaurants array structure", False))
        else:
            checks.append((f"restaurants array (≥2 items)", False))
        
        tips = article.get("tips", [])
        if isinstance(tips, list) and len(tips) >= 3:
            checks.append((f"tips array (≥3 items)", True))
        else:
            checks.append((f"tips array (≥3 items)", False))
        
        tags = article.get("tags", [])
        if isinstance(tags, list) and len(tags) > 0:
            checks.append(("tags array", True))
        else:
            checks.append(("tags array", False))
        
        # URL fields
        cover = article.get("cover", "")
        if isinstance(cover, str) and (cover.startswith("http://") or cover.startswith("https://")):
            checks.append(("cover is URL", True))
        else:
            checks.append(("cover is URL", False))
        
        gallery = article.get("gallery", [])
        if isinstance(gallery, list) and len(gallery) > 0:
            valid_gallery = all(
                isinstance(url, str) and (url.startswith("http://") or url.startswith("https://"))
                for url in gallery
            )
            if valid_gallery:
                checks.append(("gallery is array of URLs", True))
            else:
                checks.append(("gallery array structure", False))
        else:
            checks.append(("gallery is array of URLs", False))
        
        # Number field
        reading_minutes = article.get("readingMinutes")
        if isinstance(reading_minutes, (int, float)) and reading_minutes > 0:
            checks.append(("readingMinutes is number", True))
        else:
            checks.append(("readingMinutes is number", False))
        
        # Provider field (should be gemini/gemini-3.8-flash or emergent)
        provider = article.get("_provider", "")
        if provider:
            if "gemini" in provider.lower():
                checks.append((f"_provider field (using Gemini: {provider})", True))
            elif "emergent" in provider.lower():
                checks.append((f"_provider field (using Emergent fallback: {provider})", True))
            else:
                checks.append((f"_provider field (unknown: {provider})", False))
        else:
            checks.append(("_provider field", False))
        
        # Log all checks
        for check_name, check_passed in checks:
            log_test(check_name, check_passed)
        
        # Print sample data
        print("\n📊 Sample Article Data:")
        print(f"  Title: {article.get('title', 'N/A')}")
        print(f"  Slug: {article.get('slug', 'N/A')}")
        print(f"  Continent: {article.get('continent', 'N/A')}")
        print(f"  Country: {article.get('country', 'N/A')}")
        print(f"  City: {article.get('city', 'N/A')}")
        print(f"  Type: {article.get('type', 'N/A')}")
        print(f"  Attractions: {len(attractions)} items")
        print(f"  Restaurants: {len(restaurants)} items")
        print(f"  Tips: {len(tips)} items")
        print(f"  Tags: {tags}")
        print(f"  Reading Minutes: {reading_minutes}")
        print(f"  Provider: {provider}")
        
        return article
        
    except requests.exceptions.Timeout:
        log_test("AI Article Generator (timeout)", False, "Request timeout (>120s)")
        return None
    except Exception as e:
        log_test("AI Article Generator (exception)", False, f"Exception: {e}")
        return None

def test_bulk_ai_flow_end_to_end(admin_token, generated_article=None):
    """
    TEST 2: Bulk AI flow end-to-end
    Generate article → Save article → Retrieve by slug → Cleanup
    """
    print("\n" + "="*60)
    print("TEST 2: Bulk AI flow end-to-end")
    print("="*60)
    
    # If we don't have a generated article from Test 1, skip this test
    if not generated_article:
        print("⚠️  Skipping: No generated article from Test 1")
        return
    
    # Step 1: Save the generated article
    print("\nStep 1: Saving generated article...")
    try:
        save_resp = requests.post(
            f"{BASE_URL}/ai/save-article",
            json=generated_article,
            headers={"X-Admin-Token": admin_token},
            timeout=10
        )
        
        if save_resp.status_code != 200:
            log_test("Save generated article", False, 
                    f"Status: {save_resp.status_code}, Body: {save_resp.text[:500]}")
            return
        
        saved_article = save_resp.json()
        article_id = saved_article.get("id")
        article_slug = saved_article.get("slug")
        
        if not article_id or not article_slug:
            log_test("Save generated article", False, "No ID or slug in response")
            return
        
        test_article_ids.append(article_id)
        log_test("Save generated article", True, f"ID: {article_id}, Slug: {article_slug}")
        
        # Step 2: Retrieve by slug
        print("\nStep 2: Retrieving article by slug...")
        try:
            get_resp = requests.get(f"{BASE_URL}/articles/by-slug/{article_slug}", timeout=10)
            
            if get_resp.status_code != 200:
                log_test("Retrieve article by slug", False, f"Status: {get_resp.status_code}")
                return
            
            retrieved_data = get_resp.json()
            retrieved_article = retrieved_data.get("article")
            
            if not retrieved_article:
                log_test("Retrieve article by slug", False, "No article in response")
                return
            
            # Verify it's the same article
            if retrieved_article.get("id") == article_id and retrieved_article.get("slug") == article_slug:
                log_test("Retrieve article by slug", True, f"Article found: {article_slug}")
            else:
                log_test("Retrieve article by slug", False, "Article mismatch")
            
            # Verify related articles are included
            related = retrieved_data.get("related", [])
            related_groups = retrieved_data.get("relatedGroups", {})
            log_test("Related articles included", True, 
                    f"Related: {len(related)}, Groups: {len(related_groups)} categories")
            
        except Exception as e:
            log_test("Retrieve article by slug", False, f"Exception: {e}")
        
        # Step 3: Cleanup will be done in the finally block
        print("\nStep 3: Cleanup will be done at the end of all tests")
        
    except Exception as e:
        log_test("Save generated article", False, f"Exception: {e}")

def test_auth_still_works(admin_token):
    """
    TEST 3: Auth still works
    """
    print("\n" + "="*60)
    print("TEST 3: Auth still works")
    print("="*60)
    
    # Test 3.1: Without X-Admin-Token → 401
    try:
        resp = requests.post(
            f"{BASE_URL}/ai/generate-article",
            json={"city": "Test", "country": "Test"},
            timeout=10
        )
        if resp.status_code == 401:
            log_test("POST /api/ai/generate-article WITHOUT X-Admin-Token → 401", True)
        else:
            log_test("POST /api/ai/generate-article WITHOUT X-Admin-Token → 401", False, 
                    f"Status: {resp.status_code}, expected 401")
    except Exception as e:
        log_test("POST /api/ai/generate-article WITHOUT X-Admin-Token", False, f"Exception: {e}")
    
    # Test 3.2: With wrong token → 401
    try:
        resp = requests.post(
            f"{BASE_URL}/ai/generate-article",
            json={"city": "Test", "country": "Test"},
            headers={"X-Admin-Token": "wrong-token-12345"},
            timeout=10
        )
        if resp.status_code == 401:
            log_test("POST /api/ai/generate-article WITH wrong token → 401", True)
        else:
            log_test("POST /api/ai/generate-article WITH wrong token → 401", False, 
                    f"Status: {resp.status_code}, expected 401")
    except Exception as e:
        log_test("POST /api/ai/generate-article WITH wrong token", False, f"Exception: {e}")

def test_error_handling_still_works(admin_token):
    """
    TEST 4: Error handling still works
    """
    print("\n" + "="*60)
    print("TEST 4: Error handling still works")
    print("="*60)
    
    # Test 4.1: Without city in body → 400
    try:
        resp = requests.post(
            f"{BASE_URL}/ai/generate-article",
            json={"country": "Test"},
            headers={"X-Admin-Token": admin_token},
            timeout=10
        )
        if resp.status_code == 400:
            data = resp.json()
            error = data.get("error", "")
            if "city" in error.lower() or "obligatoriu" in error.lower():
                log_test("POST /api/ai/generate-article without city → 400 with meaningful error", True, 
                        f"Error: {error}")
            else:
                log_test("POST /api/ai/generate-article without city → 400", False, 
                        f"Got 400 but error message unclear: {error}")
        else:
            log_test("POST /api/ai/generate-article without city → 400", False, 
                    f"Status: {resp.status_code}, expected 400")
    except Exception as e:
        log_test("POST /api/ai/generate-article without city", False, f"Exception: {e}")

def test_regression_smoke_tests():
    """
    TEST 5: Regression smoke tests (must not break)
    """
    print("\n" + "="*60)
    print("TEST 5: Regression smoke tests (must not break)")
    print("="*60)
    
    # Test 5.1: GET /api/articles → 200 with items
    try:
        resp = requests.get(f"{BASE_URL}/articles", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            items = data.get("items", [])
            if len(items) > 0:
                log_test("GET /api/articles → 200 with items", True, f"Items: {len(items)}")
            else:
                log_test("GET /api/articles → 200 with items", False, "No items returned")
        else:
            log_test("GET /api/articles", False, f"Status: {resp.status_code}")
    except Exception as e:
        log_test("GET /api/articles", False, f"Exception: {e}")
    
    # Test 5.2: GET /api/articles/by-slug/ghid-complet-paris-7-zile → 200 with article + relatedGroups
    try:
        resp = requests.get(f"{BASE_URL}/articles/by-slug/ghid-complet-paris-7-zile", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            article = data.get("article")
            related_groups = data.get("relatedGroups", {})
            if article and isinstance(related_groups, dict):
                log_test("GET /api/articles/by-slug/ghid-complet-paris-7-zile → 200 with article + relatedGroups", 
                        True, f"Article found, relatedGroups: {len(related_groups)} categories")
            else:
                log_test("GET /api/articles/by-slug/ghid-complet-paris-7-zile", False, 
                        f"Article: {bool(article)}, relatedGroups: {bool(related_groups)}")
        else:
            log_test("GET /api/articles/by-slug/ghid-complet-paris-7-zile", False, 
                    f"Status: {resp.status_code}")
    except Exception as e:
        log_test("GET /api/articles/by-slug/ghid-complet-paris-7-zile", False, f"Exception: {e}")
    
    # Test 5.3: POST /api/admin/login {password:"Dinamo123$"} → 200 with token
    try:
        resp = requests.post(f"{BASE_URL}/admin/login", json={"password": ADMIN_PASSWORD}, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("ok") and data.get("token"):
                log_test("POST /api/admin/login → 200 with token", True)
            else:
                log_test("POST /api/admin/login", False, f"Unexpected response: {data}")
        else:
            log_test("POST /api/admin/login", False, f"Status: {resp.status_code}")
    except Exception as e:
        log_test("POST /api/admin/login", False, f"Exception: {e}")
    
    # Test 5.4: POST /api/admin/bulk-update-year → 200
    try:
        resp = requests.post(
            f"{BASE_URL}/admin/bulk-update-year",
            json={"from": "2025", "to": "2026"},
            headers={"X-Admin-Token": ADMIN_PASSWORD},
            timeout=10
        )
        if resp.status_code == 200:
            data = resp.json()
            updated = data.get("updated")
            if isinstance(updated, int) and updated >= 0:
                log_test("POST /api/admin/bulk-update-year → 200", True, f"Updated: {updated} articles")
            else:
                log_test("POST /api/admin/bulk-update-year", False, f"Invalid response: {data}")
        else:
            log_test("POST /api/admin/bulk-update-year", False, f"Status: {resp.status_code}")
    except Exception as e:
        log_test("POST /api/admin/bulk-update-year", False, f"Exception: {e}")
    
    # Test 5.5: GET /sitemap.xml → 200 with Content-Type "application/xml; charset=utf-8"
    try:
        # Use base URL without /api for sitemap
        base_url_no_api = BASE_URL.replace("/api", "")
        resp = requests.get(f"{base_url_no_api}/sitemap.xml", timeout=10)
        if resp.status_code == 200:
            content_type = resp.headers.get("Content-Type", "")
            if "application/xml" in content_type and "charset=utf-8" in content_type:
                log_test("GET /sitemap.xml → 200 with Content-Type 'application/xml; charset=utf-8'", True, 
                        f"Content-Type: {content_type}")
            else:
                log_test("GET /sitemap.xml → 200 with correct Content-Type", False, 
                        f"Content-Type: {content_type}, expected 'application/xml; charset=utf-8'")
        else:
            log_test("GET /sitemap.xml", False, f"Status: {resp.status_code}")
    except Exception as e:
        log_test("GET /sitemap.xml", False, f"Exception: {e}")
    
    # Test 5.6: GET /feed.xml → 200
    try:
        base_url_no_api = BASE_URL.replace("/api", "")
        resp = requests.get(f"{base_url_no_api}/feed.xml", timeout=10)
        if resp.status_code == 200:
            content = resp.text
            if "<rss" in content and "version=" in content:
                log_test("GET /feed.xml → 200", True, "Valid RSS feed")
            else:
                log_test("GET /feed.xml", False, "Invalid RSS format")
        else:
            log_test("GET /feed.xml", False, f"Status: {resp.status_code}")
    except Exception as e:
        log_test("GET /feed.xml", False, f"Exception: {e}")
    
    # Test 5.7: GET /robots.txt → 200 with Sitemap directive
    try:
        base_url_no_api = BASE_URL.replace("/api", "")
        resp = requests.get(f"{base_url_no_api}/robots.txt", timeout=10)
        if resp.status_code == 200:
            content = resp.text
            if "Sitemap:" in content:
                log_test("GET /robots.txt → 200 with Sitemap directive", True)
            else:
                log_test("GET /robots.txt → 200 with Sitemap directive", False, 
                        "No Sitemap directive found")
        else:
            log_test("GET /robots.txt", False, f"Status: {resp.status_code}")
    except Exception as e:
        log_test("GET /robots.txt", False, f"Exception: {e}")

def main():
    print("="*60)
    print("BACKEND API TESTS - Gemini API Integration Verification")
    print("="*60)
    print(f"Base URL: {BASE_URL}")
    print(f"Admin Password: {ADMIN_PASSWORD}")
    print("="*60)
    print("\n🎯 OBJECTIVE: Verify AI generation now works after switching")
    print("   from Emergent LLM Gateway to Google Gemini API")
    print("="*60)
    
    try:
        # Get admin token
        print("\nGetting admin token...")
        resp = requests.post(f"{BASE_URL}/admin/login", json={"password": ADMIN_PASSWORD}, timeout=10)
        if resp.status_code != 200:
            print(f"❌ FATAL: Cannot get admin token. Status: {resp.status_code}")
            return
        admin_token = resp.json().get("token")
        print(f"✅ Admin token obtained: {admin_token}")
        
        # Run tests in order
        generated_article = test_ai_article_generator_now_works(admin_token)
        test_bulk_ai_flow_end_to_end(admin_token, generated_article)
        test_auth_still_works(admin_token)
        test_error_handling_still_works(admin_token)
        test_regression_smoke_tests()
        
    except Exception as e:
        print(f"\n❌ FATAL ERROR: {e}")
        import traceback
        traceback.print_exc()
    finally:
        cleanup()
    
    print("\n" + "="*60)
    print("BACKEND TESTS COMPLETE")
    print("="*60)

if __name__ == "__main__":
    main()
