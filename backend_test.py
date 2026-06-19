#!/usr/bin/env python3
"""
Backend API tests for Romanian travel blog "Destinația Următoare"
Tests new features + regression smoke tests
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:3000/api"
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

def test_ai_article_generator(admin_token):
    """Test 2: AI Article Generator (max 2 calls)"""
    print("\n" + "="*60)
    print("TEST 2: AI Article Generator")
    print("="*60)
    
    # Test without auth
    try:
        resp = requests.post(
            f"{BASE_URL}/ai/generate-article",
            json={"city": "Lisabona", "country": "Portugalia"},
            timeout=10
        )
        if resp.status_code == 401:
            log_test("AI generate without auth (expect 401)", True)
        else:
            log_test("AI generate without auth (expect 401)", False, f"Status: {resp.status_code}")
    except Exception as e:
        log_test("AI generate without auth", False, f"Exception: {e}")
    
    # Test without city field
    try:
        resp = requests.post(
            f"{BASE_URL}/ai/generate-article",
            json={"country": "Portugalia"},
            headers={"X-Admin-Token": admin_token},
            timeout=10
        )
        if resp.status_code == 400:
            log_test("AI generate without city (expect 400)", True)
        else:
            log_test("AI generate without city (expect 400)", False, f"Status: {resp.status_code}")
    except Exception as e:
        log_test("AI generate without city", False, f"Exception: {e}")
    
    # Test valid AI generation (ONLY 1 CALL to minimize costs)
    print("\n⚠️  Making 1 AI call to Emergent LLM Gateway (Claude Haiku) - this may take 30-60s...")
    try:
        resp = requests.post(
            f"{BASE_URL}/ai/generate-article",
            json={
                "city": "Lisabona",
                "country": "Portugalia",
                "type": "City Break",
                "duration": "4 zile",
                "budget": "mediu"
            },
            headers={"X-Admin-Token": admin_token},
            timeout=90  # Allow up to 90s for AI call
        )
        if resp.status_code == 200:
            data = resp.json()
            article = data.get("article", {})
            
            # Check required fields
            required_fields = [
                "title", "slug", "excerpt", "continent", "country", "city",
                "intro", "whenToVisit", "budget", "transport", "accommodation",
                "attractions", "restaurants", "tips", "tags", "cover", "gallery",
                "readingMinutes", "type", "publishedAt"
            ]
            
            missing_fields = [f for f in required_fields if f not in article]
            
            if not missing_fields:
                # Verify arrays
                if (isinstance(article.get("attractions"), list) and len(article["attractions"]) > 0 and
                    isinstance(article.get("restaurants"), list) and len(article["restaurants"]) > 0 and
                    isinstance(article.get("tips"), list) and len(article["tips"]) > 0 and
                    isinstance(article.get("tags"), list) and len(article["tags"]) > 0 and
                    isinstance(article.get("gallery"), list)):
                    log_test("AI generate article with valid data", True, 
                            f"Title: {article.get('title')}, Slug: {article.get('slug')}")
                    return article  # Return for use in save test
                else:
                    log_test("AI generate article", False, "Arrays not properly populated")
            else:
                log_test("AI generate article", False, f"Missing fields: {missing_fields}")
        else:
            log_test("AI generate article", False, f"Status: {resp.status_code}, Body: {resp.text[:500]}")
    except requests.exceptions.Timeout:
        log_test("AI generate article", False, "Request timeout (>90s)")
    except Exception as e:
        log_test("AI generate article", False, f"Exception: {e}")
    
    return None

def test_ai_save_article(admin_token, generated_article):
    """Test 3: AI Save Article with slug uniqueness"""
    print("\n" + "="*60)
    print("TEST 3: AI Save Article")
    print("="*60)
    
    # Test without auth
    try:
        resp = requests.post(
            f"{BASE_URL}/ai/save-article",
            json={"title": "Test", "slug": "test"},
            timeout=10
        )
        if resp.status_code == 401:
            log_test("AI save without auth (expect 401)", True)
        else:
            log_test("AI save without auth (expect 401)", False, f"Status: {resp.status_code}")
    except Exception as e:
        log_test("AI save without auth", False, f"Exception: {e}")
    
    # Use generated article or create minimal payload
    if generated_article:
        article_data = generated_article
    else:
        article_data = {
            "title": "Test Lisabona Article",
            "slug": "test-lisabona-article",
            "excerpt": "Test excerpt",
            "continent": "Europa",
            "country": "Portugalia",
            "city": "Lisabona",
            "type": "City Break",
            "intro": "Test intro",
            "whenToVisit": "Test",
            "budget": "Test",
            "transport": "Test",
            "accommodation": "Test",
            "attractions": [{"name": "Test", "description": "Test"}],
            "restaurants": [{"name": "Test", "description": "Test"}],
            "tips": ["Test"],
            "tags": ["test"],
            "cover": "https://picsum.photos/1600/1000",
            "gallery": [],
            "readingMinutes": 5,
            "publishedAt": "2025-01-01"
        }
    
    # Save first time
    try:
        resp = requests.post(
            f"{BASE_URL}/ai/save-article",
            json=article_data,
            headers={"X-Admin-Token": admin_token},
            timeout=10
        )
        if resp.status_code == 200:
            data = resp.json()
            article_id = data.get("id")
            slug = data.get("slug")
            if article_id:
                test_article_ids.append(article_id)
                log_test("AI save article (first time)", True, f"ID: {article_id}, Slug: {slug}")
                
                # Verify via GET by slug
                try:
                    get_resp = requests.get(f"{BASE_URL}/articles/by-slug/{slug}", timeout=10)
                    if get_resp.status_code == 200:
                        log_test("Verify saved article via GET by-slug", True)
                    else:
                        log_test("Verify saved article via GET by-slug", False, f"Status: {get_resp.status_code}")
                except Exception as e:
                    log_test("Verify saved article", False, f"Exception: {e}")
                
                # Save again with same slug - should auto-suffix
                try:
                    resp2 = requests.post(
                        f"{BASE_URL}/ai/save-article",
                        json=article_data,
                        headers={"X-Admin-Token": admin_token},
                        timeout=10
                    )
                    if resp2.status_code == 200:
                        data2 = resp2.json()
                        slug2 = data2.get("slug")
                        article_id2 = data2.get("id")
                        if article_id2:
                            test_article_ids.append(article_id2)
                        if slug2 != slug and slug2.startswith(article_data["slug"]):
                            log_test("AI save with duplicate slug (auto-suffix)", True, 
                                    f"Original: {slug}, New: {slug2}")
                        else:
                            log_test("AI save with duplicate slug", False, 
                                    f"Expected auto-suffix, got: {slug2}")
                    else:
                        log_test("AI save with duplicate slug", False, f"Status: {resp2.status_code}")
                except Exception as e:
                    log_test("AI save with duplicate slug", False, f"Exception: {e}")
            else:
                log_test("AI save article", False, "No ID in response")
        else:
            log_test("AI save article", False, f"Status: {resp.status_code}, Body: {resp.text}")
    except Exception as e:
        log_test("AI save article", False, f"Exception: {e}")

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
    """Test 5-12: Regression smoke tests"""
    print("\n" + "="*60)
    print("REGRESSION SMOKE TESTS")
    print("="*60)
    
    # Test 5: GET /api/articles (default)
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
    
    # Test 6: GET /api/articles?continent=Europa
    try:
        resp = requests.get(f"{BASE_URL}/articles?continent=Europa", timeout=10)
        if resp.status_code == 200:
            items = resp.json().get("items", [])
            all_europa = all(item.get("continent") == "Europa" for item in items)
            if all_europa and len(items) > 0:
                log_test("GET /api/articles?continent=Europa", True, f"Found {len(items)} Europa articles")
            else:
                log_test("GET /api/articles?continent=Europa", False, 
                        f"Not all items are Europa or empty: {len(items)}")
        else:
            log_test("GET /api/articles?continent=Europa", False, f"Status: {resp.status_code}")
    except Exception as e:
        log_test("GET /api/articles?continent=Europa", False, f"Exception: {e}")
    
    # Test 7: GET /api/articles?search=paris
    try:
        resp = requests.get(f"{BASE_URL}/articles?search=paris", timeout=10)
        if resp.status_code == 200:
            items = resp.json().get("items", [])
            if len(items) > 0:
                log_test("GET /api/articles?search=paris", True, f"Found {len(items)} results")
            else:
                log_test("GET /api/articles?search=paris", False, "No results found")
        else:
            log_test("GET /api/articles?search=paris", False, f"Status: {resp.status_code}")
    except Exception as e:
        log_test("GET /api/articles?search=paris", False, f"Exception: {e}")
    
    # Test 8: GET /api/articles/meta
    try:
        resp = requests.get(f"{BASE_URL}/articles/meta", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            continents = data.get("continents", [])
            countries = data.get("countries", [])
            types = data.get("types", [])
            if len(continents) > 0 and len(countries) > 0 and len(types) > 0:
                log_test("GET /api/articles/meta", True, 
                        f"Continents: {len(continents)}, Countries: {len(countries)}, Types: {len(types)}")
            else:
                log_test("GET /api/articles/meta", False, "Empty arrays returned")
        else:
            log_test("GET /api/articles/meta", False, f"Status: {resp.status_code}")
    except Exception as e:
        log_test("GET /api/articles/meta", False, f"Exception: {e}")
    
    # Test 9: GET /api/articles/by-slug/ghid-complet-paris-7-zile
    try:
        resp = requests.get(f"{BASE_URL}/articles/by-slug/ghid-complet-paris-7-zile", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            article = data.get("article")
            related = data.get("related", [])
            if article and len(related) <= 3:
                log_test("GET /api/articles/by-slug/ghid-complet-paris-7-zile", True, 
                        f"Article found, Related: {len(related)}")
            else:
                log_test("GET /api/articles/by-slug/ghid-complet-paris-7-zile", False, 
                        f"Article: {bool(article)}, Related: {len(related)}")
        else:
            log_test("GET /api/articles/by-slug/ghid-complet-paris-7-zile", False, 
                    f"Status: {resp.status_code}")
    except Exception as e:
        log_test("GET /api/articles/by-slug/ghid-complet-paris-7-zile", False, f"Exception: {e}")
    
    # Test 10: POST /api/newsletter
    try:
        timestamp = int(time.time())
        resp = requests.post(
            f"{BASE_URL}/newsletter",
            json={"email": f"test+{timestamp}@example.com"},
            timeout=10
        )
        if resp.status_code == 200:
            log_test("POST /api/newsletter", True)
        else:
            log_test("POST /api/newsletter", False, f"Status: {resp.status_code}")
    except Exception as e:
        log_test("POST /api/newsletter", False, f"Exception: {e}")
    
    # Test 11: POST /api/contact
    try:
        resp = requests.post(
            f"{BASE_URL}/contact",
            json={
                "name": "Test User",
                "email": "test@example.com",
                "message": "Test message"
            },
            timeout=10
        )
        if resp.status_code == 200:
            log_test("POST /api/contact", True)
        else:
            log_test("POST /api/contact", False, f"Status: {resp.status_code}")
    except Exception as e:
        log_test("POST /api/contact", False, f"Exception: {e}")
    
    # Test 12: POST /api/comments and GET /api/comments
    try:
        timestamp = int(time.time())
        resp = requests.post(
            f"{BASE_URL}/comments?slug=ghid-complet-paris-7-zile",
            json={
                "slug": "ghid-complet-paris-7-zile",
                "name": f"Test User {timestamp}",
                "message": "Test comment"
            },
            timeout=10
        )
        if resp.status_code == 200:
            log_test("POST /api/comments", True)
            
            # Verify GET
            get_resp = requests.get(f"{BASE_URL}/comments?slug=ghid-complet-paris-7-zile", timeout=10)
            if get_resp.status_code == 200:
                items = get_resp.json().get("items", [])
                found = any(item.get("name") == f"Test User {timestamp}" for item in items)
                if found:
                    log_test("GET /api/comments (verify posted comment)", True)
                else:
                    log_test("GET /api/comments (verify posted comment)", False, "Comment not found")
            else:
                log_test("GET /api/comments", False, f"Status: {get_resp.status_code}")
        else:
            log_test("POST /api/comments", False, f"Status: {resp.status_code}")
    except Exception as e:
        log_test("POST /api/comments", False, f"Exception: {e}")

def main():
    print("="*60)
    print("BACKEND API TESTS - Destinația Următoare")
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
        generated_article = test_ai_article_generator(admin_token)
        test_ai_save_article(admin_token, generated_article)
        test_post_scheduling(admin_token)
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
