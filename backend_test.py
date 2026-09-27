#!/usr/bin/env python3
"""
Backend API tests for Romanian travel blog "Destinația Următoare"
Tests Bulk AI error handling fix + regression smoke tests
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
test_comment_ids = []

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

def test_admin_login():
    """Test 1: Admin login with new password"""
    print("\n" + "="*60)
    print("TEST 1: Admin Login with New Password")
    print("="*60)
    
    # Test correct password
    try:
        resp = requests.post(f"{BASE_URL}/admin/login", json={"password": ADMIN_PASSWORD}, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("ok") and data.get("token") == ADMIN_PASSWORD:
                log_test("Admin login with correct password", True, f"Token: {data.get('token')}")
            else:
                log_test("Admin login with correct password", False, f"Unexpected response: {data}")
        else:
            log_test("Admin login with correct password", False, f"Status: {resp.status_code}, Body: {resp.text}")
    except Exception as e:
        log_test("Admin login with correct password", False, f"Exception: {e}")
    
    # Test wrong password
    try:
        resp = requests.post(f"{BASE_URL}/admin/login", json={"password": "wrong"}, timeout=10)
        if resp.status_code == 401:
            log_test("Admin login with wrong password (expect 401)", True, f"Got 401 as expected")
        else:
            log_test("Admin login with wrong password (expect 401)", False, f"Status: {resp.status_code}, expected 401")
    except Exception as e:
        log_test("Admin login with wrong password", False, f"Exception: {e}")

def test_ai_article_generator_budget_exceeded(admin_token):
    """Test 2: AI Article Generator - Budget Exceeded Error Handling"""
    print("\n" + "="*60)
    print("TEST 2: AI Article Generator - Budget Exceeded Error Handling")
    print("="*60)
    
    # Test without auth
    try:
        resp = requests.post(
            f"{BASE_URL}/ai/generate-article",
            json={"city": "Test", "country": "Test"},
            timeout=10
        )
        if resp.status_code == 401:
            log_test("AI generate without auth (expect 401)", True)
        else:
            log_test("AI generate without auth (expect 401)", False, f"Status: {resp.status_code}")
    except Exception as e:
        log_test("AI generate without auth", False, f"Exception: {e}")
    
    # Test with wrong token
    try:
        resp = requests.post(
            f"{BASE_URL}/ai/generate-article",
            json={"city": "Test", "country": "Test"},
            headers={"X-Admin-Token": "wrong-token"},
            timeout=10
        )
        if resp.status_code == 401:
            log_test("AI generate with wrong token (expect 401)", True)
        else:
            log_test("AI generate with wrong token (expect 401)", False, f"Status: {resp.status_code}")
    except Exception as e:
        log_test("AI generate with wrong token", False, f"Exception: {e}")
    
    # Test without city field
    try:
        resp = requests.post(
            f"{BASE_URL}/ai/generate-article",
            json={"country": "Test"},
            headers={"X-Admin-Token": admin_token},
            timeout=10
        )
        if resp.status_code == 400:
            log_test("AI generate without city (expect 400)", True)
        else:
            log_test("AI generate without city (expect 400)", False, f"Status: {resp.status_code}")
    except Exception as e:
        log_test("AI generate without city", False, f"Exception: {e}")
    
    # Test budget exceeded error (expected to fail with 402)
    print("\n⚠️  Testing budget exceeded error handling (expected to fail with 402)...")
    try:
        resp = requests.post(
            f"{BASE_URL}/ai/generate-article",
            json={
                "city": "Test",
                "country": "Test"
            },
            headers={"X-Admin-Token": admin_token},
            timeout=90
        )
        
        # Expected: 402 Payment Required with specific error structure
        if resp.status_code == 402:
            data = resp.json()
            error = data.get("error")
            detail = data.get("detail")
            code = data.get("code")
            
            # Verify error structure
            if error == "Buget LLM depășit" and code == "BUDGET_EXCEEDED" and detail and "buget" in detail.lower():
                log_test("AI generate budget exceeded (expect 402 with proper error)", True, 
                        f"Error: {error}, Code: {code}, Detail: {detail[:100]}")
            else:
                log_test("AI generate budget exceeded error structure", False, 
                        f"Status 402 but wrong structure. Error: {error}, Code: {code}, Detail: {detail}")
        elif resp.status_code == 200:
            # If it succeeds, budget is not exceeded (unexpected but not a failure)
            log_test("AI generate budget exceeded", False, 
                    "Expected 402 but got 200 - budget may not be exceeded yet")
        elif resp.status_code == 500:
            # This is the bug we're fixing - should be 402, not 500
            log_test("AI generate budget exceeded (expect 402, got 500)", False, 
                    f"BUG: Got 500 instead of 402. Body: {resp.text[:200]}")
        else:
            log_test("AI generate budget exceeded", False, 
                    f"Unexpected status: {resp.status_code}, Body: {resp.text[:200]}")
    except requests.exceptions.Timeout:
        log_test("AI generate budget exceeded", False, "Request timeout (>90s)")
    except Exception as e:
        log_test("AI generate budget exceeded", False, f"Exception: {e}")
    
    return None

def test_non_ai_error_handling():
    """Test 3: Non-AI endpoints error handling"""
    print("\n" + "="*60)
    print("TEST 3: Non-AI Endpoints Error Handling")
    print("="*60)
    
    # Test create article without required fields (expect 400)
    try:
        resp = requests.post(
            f"{BASE_URL}/articles",
            json={"excerpt": "Test"},
            headers={"X-Admin-Token": ADMIN_PASSWORD},
            timeout=10
        )
        if resp.status_code == 400:
            data = resp.json()
            error = data.get("error")
            if error and "obligatorii" in error.lower():
                log_test("POST /api/articles without required fields (expect 400)", True, f"Error: {error}")
            else:
                log_test("POST /api/articles without required fields", False, f"Got 400 but wrong error: {error}")
        else:
            log_test("POST /api/articles without required fields (expect 400)", False, 
                    f"Status: {resp.status_code}, expected 400")
    except Exception as e:
        log_test("POST /api/articles without required fields", False, f"Exception: {e}")
    
    # Test fetch nonexistent article by slug (expect 404)
    try:
        resp = requests.get(f"{BASE_URL}/articles/by-slug/nonexistent-article-12345", timeout=10)
        if resp.status_code == 404:
            data = resp.json()
            error = data.get("error")
            if error:
                log_test("GET /api/articles/by-slug/nonexistent (expect 404)", True, f"Error: {error}")
            else:
                log_test("GET /api/articles/by-slug/nonexistent", False, "Got 404 but no error message")
        else:
            log_test("GET /api/articles/by-slug/nonexistent (expect 404)", False, 
                    f"Status: {resp.status_code}, expected 404")
    except Exception as e:
        log_test("GET /api/articles/by-slug/nonexistent", False, f"Exception: {e}")
    
    # Test invalid admin route (expect 404)
    try:
        resp = requests.get(f"{BASE_URL}/admin/invalid-route-12345", timeout=10)
        if resp.status_code == 404:
            data = resp.json()
            error = data.get("error")
            if error and "not found" in error.lower():
                log_test("GET /api/admin/invalid-route (expect 404)", True, f"Error: {error}")
            else:
                log_test("GET /api/admin/invalid-route", False, f"Got 404 but wrong error: {error}")
        else:
            log_test("GET /api/admin/invalid-route (expect 404)", False, 
                    f"Status: {resp.status_code}, expected 404")
    except Exception as e:
        log_test("GET /api/admin/invalid-route", False, f"Exception: {e}")
    
    # Test newsletter with invalid email (expect 400)
    try:
        resp = requests.post(
            f"{BASE_URL}/newsletter",
            json={"email": "invalid-email"},
            timeout=10
        )
        if resp.status_code == 400:
            data = resp.json()
            error = data.get("error")
            if error and "invalid" in error.lower():
                log_test("POST /api/newsletter with invalid email (expect 400)", True, f"Error: {error}")
            else:
                log_test("POST /api/newsletter with invalid email", False, f"Got 400 but wrong error: {error}")
        else:
            log_test("POST /api/newsletter with invalid email (expect 400)", False, 
                    f"Status: {resp.status_code}, expected 400")
    except Exception as e:
        log_test("POST /api/newsletter with invalid email", False, f"Exception: {e}")
    
    # Test contact without required fields (expect 400)
    try:
        resp = requests.post(
            f"{BASE_URL}/contact",
            json={"name": "Test"},
            timeout=10
        )
        if resp.status_code == 400:
            data = resp.json()
            error = data.get("error")
            if error:
                log_test("POST /api/contact without required fields (expect 400)", True, f"Error: {error}")
            else:
                log_test("POST /api/contact without required fields", False, "Got 400 but no error message")
        else:
            log_test("POST /api/contact without required fields (expect 400)", False, 
                    f"Status: {resp.status_code}, expected 400")
    except Exception as e:
        log_test("POST /api/contact without required fields", False, f"Exception: {e}")

def test_post_scheduling(admin_token):
    """Test 4: Post Scheduling - hide future-dated articles"""
    print("\n" + "="*60)
    print("TEST 4: Post Scheduling")
    print("="*60)
    
    timestamp = int(time.time())
    test_slug = f"test-scheduled-article-{timestamp}"
    
    # Create article with future publishedAt
    try:
        article_data = {
            "title": "Test Scheduled Article",
            "slug": test_slug,
            "excerpt": "Test scheduled article",
            "continent": "Europa",
            "country": "Romania",
            "city": "Bucuresti",
            "type": "City Break",
            "cover": "https://picsum.photos/1600/1000",
            "publishedAt": "2099-12-31"
        }
        
        resp = requests.post(
            f"{BASE_URL}/articles",
            json=article_data,
            headers={"X-Admin-Token": admin_token},
            timeout=10
        )
        
        if resp.status_code == 200:
            data = resp.json()
            article_id = data.get("id")
            if article_id:
                test_article_ids.append(article_id)
                log_test("Create scheduled article (2099-12-31)", True, f"ID: {article_id}")
                
                # Test 1: Default GET should NOT include it
                try:
                    list_resp = requests.get(f"{BASE_URL}/articles", timeout=10)
                    if list_resp.status_code == 200:
                        items = list_resp.json().get("items", [])
                        found = any(item.get("slug") == test_slug for item in items)
                        if not found:
                            log_test("Scheduled article NOT in default list", True)
                        else:
                            log_test("Scheduled article NOT in default list", False, 
                                    "Article appeared in default list (should be hidden)")
                    else:
                        log_test("Get articles list", False, f"Status: {list_resp.status_code}")
                except Exception as e:
                    log_test("Get articles list", False, f"Exception: {e}")
                
                # Test 2: With includeScheduled=true should include it
                try:
                    list_resp2 = requests.get(f"{BASE_URL}/articles?includeScheduled=true", timeout=10)
                    if list_resp2.status_code == 200:
                        items2 = list_resp2.json().get("items", [])
                        found2 = any(item.get("slug") == test_slug for item in items2)
                        if found2:
                            log_test("Scheduled article IN list with includeScheduled=true", True)
                        else:
                            log_test("Scheduled article IN list with includeScheduled=true", False,
                                    "Article not found with includeScheduled=true")
                    else:
                        log_test("Get articles with includeScheduled", False, f"Status: {list_resp2.status_code}")
                except Exception as e:
                    log_test("Get articles with includeScheduled", False, f"Exception: {e}")
                
                # Test 3: Direct access by slug should still work
                try:
                    slug_resp = requests.get(f"{BASE_URL}/articles/by-slug/{test_slug}", timeout=10)
                    if slug_resp.status_code == 200:
                        log_test("Scheduled article accessible by direct slug", True)
                    else:
                        log_test("Scheduled article accessible by direct slug", False, 
                                f"Status: {slug_resp.status_code}")
                except Exception as e:
                    log_test("Direct slug access", False, f"Exception: {e}")
                
                # Test 4: Update to past date, should now appear in default list
                try:
                    update_resp = requests.put(
                        f"{BASE_URL}/articles/{article_id}",
                        json={"publishedAt": "2020-01-01"},
                        headers={"X-Admin-Token": admin_token},
                        timeout=10
                    )
                    if update_resp.status_code == 200:
                        # Check if now appears in default list
                        time.sleep(0.5)  # Small delay
                        list_resp3 = requests.get(f"{BASE_URL}/articles", timeout=10)
                        if list_resp3.status_code == 200:
                            items3 = list_resp3.json().get("items", [])
                            found3 = any(item.get("slug") == test_slug for item in items3)
                            if found3:
                                log_test("Updated article (past date) now in default list", True)
                            else:
                                log_test("Updated article (past date) now in default list", False,
                                        "Article still not in default list after update")
                        else:
                            log_test("Get articles after update", False, f"Status: {list_resp3.status_code}")
                    else:
                        log_test("Update article publishedAt", False, f"Status: {update_resp.status_code}")
                except Exception as e:
                    log_test("Update article publishedAt", False, f"Exception: {e}")
            else:
                log_test("Create scheduled article", False, "No ID in response")
        else:
            log_test("Create scheduled article", False, f"Status: {resp.status_code}, Body: {resp.text}")
    except Exception as e:
        log_test("Create scheduled article", False, f"Exception: {e}")

def test_regression_smoke():
    """Test 4: Regression smoke tests"""
    print("\n" + "="*60)
    print("TEST 4: REGRESSION SMOKE TESTS")
    print("="*60)
    
    # Test 4.1: GET /api/articles (default)
    try:
        resp = requests.get(f"{BASE_URL}/articles", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            items = data.get("items", [])
            total = data.get("total", 0)
            pages = data.get("pages")
            if len(items) > 0 and total >= 8 and pages is not None:
                log_test("GET /api/articles (default)", True, 
                        f"Items: {len(items)}, Total: {total}, Pages: {pages}")
            else:
                log_test("GET /api/articles (default)", False, 
                        f"Items: {len(items)}, Total: {total}, Pages: {pages}")
        else:
            log_test("GET /api/articles", False, f"Status: {resp.status_code}")
    except Exception as e:
        log_test("GET /api/articles", False, f"Exception: {e}")
    
    # Test 4.2: GET /api/articles/by-slug/ghid-complet-paris-7-zile with relatedGroups
    try:
        resp = requests.get(f"{BASE_URL}/articles/by-slug/ghid-complet-paris-7-zile", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            article = data.get("article")
            related = data.get("related", [])
            related_groups = data.get("relatedGroups", {})
            same_country = related_groups.get("sameCountry", [])
            same_type = related_groups.get("sameType", [])
            same_continent = related_groups.get("sameContinent", [])
            
            if article and isinstance(related_groups, dict):
                log_test("GET /api/articles/by-slug/ghid-complet-paris-7-zile with relatedGroups", True, 
                        f"Article found, Related: {len(related)}, sameCountry: {len(same_country)}, sameType: {len(same_type)}, sameContinent: {len(same_continent)}")
            else:
                log_test("GET /api/articles/by-slug/ghid-complet-paris-7-zile", False, 
                        f"Article: {bool(article)}, relatedGroups: {bool(related_groups)}")
        else:
            log_test("GET /api/articles/by-slug/ghid-complet-paris-7-zile", False, 
                    f"Status: {resp.status_code}")
    except Exception as e:
        log_test("GET /api/articles/by-slug/ghid-complet-paris-7-zile", False, f"Exception: {e}")
    
    # Test 4.3: POST /api/admin/login
    try:
        resp = requests.post(f"{BASE_URL}/admin/login", json={"password": ADMIN_PASSWORD}, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("ok") and data.get("token"):
                log_test("POST /api/admin/login", True, "Login successful")
            else:
                log_test("POST /api/admin/login", False, f"Unexpected response: {data}")
        else:
            log_test("POST /api/admin/login", False, f"Status: {resp.status_code}")
    except Exception as e:
        log_test("POST /api/admin/login", False, f"Exception: {e}")
    
    # Test 4.4: POST /api/admin/bulk-update-year
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
                log_test("POST /api/admin/bulk-update-year", True, f"Updated: {updated} articles")
            else:
                log_test("POST /api/admin/bulk-update-year", False, f"Invalid response: {data}")
        else:
            log_test("POST /api/admin/bulk-update-year", False, f"Status: {resp.status_code}")
    except Exception as e:
        log_test("POST /api/admin/bulk-update-year", False, f"Exception: {e}")
    
    # Test 4.5: GET /sitemap.xml
    try:
        # Use base URL without /api for sitemap
        sitemap_url = BASE_URL.replace("/api", "") + "/../sitemap.xml"
        # Clean up the URL
        import re
        sitemap_url = re.sub(r'/[^/]+/\.\.', '', sitemap_url)
        
        resp = requests.get(sitemap_url, timeout=10)
        if resp.status_code == 200:
            content_type = resp.headers.get("Content-Type", "")
            if "application/xml" in content_type and "charset=utf-8" in content_type:
                log_test("GET /sitemap.xml", True, f"Content-Type: {content_type}")
            else:
                log_test("GET /sitemap.xml", False, f"Wrong Content-Type: {content_type}, expected 'application/xml; charset=utf-8'")
        else:
            log_test("GET /sitemap.xml", False, f"Status: {resp.status_code}")
    except Exception as e:
        log_test("GET /sitemap.xml", False, f"Exception: {e}")
    
    # Test 4.6: GET /feed.xml
    try:
        # Use base URL without /api for feed
        feed_url = BASE_URL.replace("/api", "") + "/../feed.xml"
        # Clean up the URL
        import re
        feed_url = re.sub(r'/[^/]+/\.\.', '', feed_url)
        
        resp = requests.get(feed_url, timeout=10)
        if resp.status_code == 200:
            content = resp.text
            if "<rss" in content and "version=" in content:
                log_test("GET /feed.xml", True, "Valid RSS feed")
            else:
                log_test("GET /feed.xml", False, "Invalid RSS format")
        else:
            log_test("GET /feed.xml", False, f"Status: {resp.status_code}")
    except Exception as e:
        log_test("GET /feed.xml", False, f"Exception: {e}")

def main():
    print("="*60)
    print("BACKEND API TESTS - Bulk AI Error Handling Fix")
    print("="*60)
    print(f"Base URL: {BASE_URL}")
    print(f"Admin Password: {ADMIN_PASSWORD}")
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
        
        # Run tests
        test_admin_login()
        test_ai_article_generator_budget_exceeded(admin_token)
        test_non_ai_error_handling()
        test_regression_smoke()
        
    except Exception as e:
        print(f"\n❌ FATAL ERROR: {e}")
    finally:
        cleanup()
    
    print("\n" + "="*60)
    print("BACKEND TESTS COMPLETE")
    print("="*60)

if __name__ == "__main__":
    main()
