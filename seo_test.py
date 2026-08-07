#!/usr/bin/env python3
"""
SEO Testing Suite for Destinația Următoare
Tests sitemap, robots, feed, JSON-LD schemas, metadata, and core page accessibility
"""

import requests
import json
import re
from xml.etree import ElementTree as ET
from html.parser import HTMLParser

BASE_URL = "http://localhost:3000"
API_URL = f"{BASE_URL}/api"
ADMIN_PASSWORD = "Dinamo123$"
EXPECTED_BASE_URL = "https://www.destinatiaurmatoare.eu"

test_results = {
    "passed": 0,
    "failed": 0,
    "critical_failures": []
}

def log_test(name, passed, details="", critical=False):
    """Log test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"\n{status}: {name}")
    if details:
        print(f"  Details: {details}")
    
    if passed:
        test_results["passed"] += 1
    else:
        test_results["failed"] += 1
        if critical:
            test_results["critical_failures"].append(f"{name}: {details}")

class JSONLDExtractor(HTMLParser):
    """Extract JSON-LD scripts from HTML"""
    def __init__(self):
        super().__init__()
        self.json_ld_scripts = []
        self.in_json_ld = False
        self.current_script = []
    
    def handle_starttag(self, tag, attrs):
        if tag == 'script':
            attrs_dict = dict(attrs)
            if attrs_dict.get('type') == 'application/ld+json':
                self.in_json_ld = True
                self.current_script = []
    
    def handle_endtag(self, tag):
        if tag == 'script' and self.in_json_ld:
            self.in_json_ld = False
            script_content = ''.join(self.current_script)
            if script_content.strip():
                self.json_ld_scripts.append(script_content)
    
    def handle_data(self, data):
        if self.in_json_ld:
            self.current_script.append(data)

def test_sitemap():
    """Test 1: Sitemap.xml validation"""
    print("\n" + "="*60)
    print("TEST 1: SITEMAP.XML VALIDATION")
    print("="*60)
    
    try:
        resp = requests.get(f"{BASE_URL}/sitemap.xml", timeout=10)
        
        # Check status code
        if resp.status_code != 200:
            log_test("Sitemap returns 200", False, f"Status: {resp.status_code}", critical=True)
            return
        log_test("Sitemap returns 200", True)
        
        # Check Content-Type with charset
        content_type = resp.headers.get('Content-Type', '')
        if 'application/xml' in content_type and 'charset=utf-8' in content_type:
            log_test("Sitemap Content-Type includes 'charset=utf-8'", True, f"Content-Type: {content_type}")
        else:
            log_test("Sitemap Content-Type includes 'charset=utf-8'", False, 
                    f"Content-Type: {content_type} (CRITICAL: Google might not read it)", critical=True)
        
        # Check XML validity
        xml_text = resp.text
        if not xml_text.startswith('<?xml'):
            log_test("Sitemap starts with XML declaration", False, "Missing <?xml declaration", critical=True)
            return
        log_test("Sitemap starts with XML declaration", True)
        
        # Parse XML
        try:
            root = ET.fromstring(xml_text)
            log_test("Sitemap is valid XML", True)
        except ET.ParseError as e:
            log_test("Sitemap is valid XML", False, f"Parse error: {e}", critical=True)
            return
        
        # Check for xmlns:image namespace
        if 'xmlns:image' in xml_text or 'http://www.google.com/schemas/sitemap-image/1.1' in xml_text:
            log_test("Sitemap contains xmlns:image namespace", True)
        else:
            log_test("Sitemap contains xmlns:image namespace", False, "Missing image sitemap namespace", critical=True)
        
        # Check for multiple <url> and <loc> entries
        url_count = xml_text.count('<url>')
        loc_count = xml_text.count('<loc>')
        if url_count > 5 and loc_count > 5:
            log_test("Sitemap contains multiple <url> and <loc> entries", True, 
                    f"URLs: {url_count}, Locations: {loc_count}")
        else:
            log_test("Sitemap contains multiple <url> and <loc> entries", False, 
                    f"URLs: {url_count}, Locations: {loc_count}")
        
        # Check for specific Paris article URL
        expected_url = f"{EXPECTED_BASE_URL}/blog/ghid-complet-paris-7-zile"
        if expected_url in xml_text:
            log_test("Sitemap contains Paris article URL", True, expected_url)
        else:
            # Check if NEXT_PUBLIC_BASE_URL is being used correctly
            if '/blog/ghid-complet-paris-7-zile' in xml_text:
                log_test("Sitemap contains Paris article URL", False, 
                        f"URL found but with wrong base (expected {EXPECTED_BASE_URL})")
            else:
                log_test("Sitemap contains Paris article URL", False, "URL not found in sitemap")
        
    except Exception as e:
        log_test("Sitemap test", False, f"Exception: {e}", critical=True)

def test_robots():
    """Test 2: Robots.txt validation"""
    print("\n" + "="*60)
    print("TEST 2: ROBOTS.TXT VALIDATION")
    print("="*60)
    
    try:
        resp = requests.get(f"{BASE_URL}/robots.txt", timeout=10)
        
        if resp.status_code != 200:
            log_test("Robots.txt returns 200", False, f"Status: {resp.status_code}", critical=True)
            return
        log_test("Robots.txt returns 200", True)
        
        content = resp.text
        
        # Check for Sitemap directive
        if 'Sitemap:' in content and 'sitemap.xml' in content:
            log_test("Robots.txt contains Sitemap directive", True)
        else:
            log_test("Robots.txt contains Sitemap directive", False, 
                    "Missing Sitemap directive pointing to sitemap.xml", critical=True)
        
        # Check basic structure
        if 'User-agent:' in content:
            log_test("Robots.txt has User-agent directive", True)
        else:
            log_test("Robots.txt has User-agent directive", False)
        
    except Exception as e:
        log_test("Robots.txt test", False, f"Exception: {e}", critical=True)

def test_feed():
    """Test 3: RSS Feed validation"""
    print("\n" + "="*60)
    print("TEST 3: RSS FEED VALIDATION")
    print("="*60)
    
    try:
        resp = requests.get(f"{BASE_URL}/feed.xml", timeout=10)
        
        if resp.status_code != 200:
            log_test("Feed.xml returns 200", False, f"Status: {resp.status_code}", critical=True)
            return
        log_test("Feed.xml returns 200", True)
        
        # Check Content-Type
        content_type = resp.headers.get('Content-Type', '')
        if 'xml' in content_type.lower():
            log_test("Feed.xml Content-Type is XML", True, f"Content-Type: {content_type}")
        else:
            log_test("Feed.xml Content-Type is XML", False, f"Content-Type: {content_type}")
        
        # Check for RSS 2.0 structure
        xml_text = resp.text
        if '<rss version="2.0"' in xml_text:
            log_test("Feed is valid RSS 2.0", True)
        else:
            log_test("Feed is valid RSS 2.0", False, "Missing RSS 2.0 declaration")
        
        # Check for required RSS elements
        required_elements = ['<channel>', '<title>', '<link>', '<description>', '<item>']
        missing = [elem for elem in required_elements if elem not in xml_text]
        if not missing:
            log_test("Feed contains required RSS elements", True)
        else:
            log_test("Feed contains required RSS elements", False, f"Missing: {missing}")
        
    except Exception as e:
        log_test("Feed.xml test", False, f"Exception: {e}", critical=True)

def test_core_pages():
    """Test 4: Core pages return 200"""
    print("\n" + "="*60)
    print("TEST 4: CORE PAGES ACCESSIBILITY")
    print("="*60)
    
    pages = [
        ('/', 'Homepage'),
        ('/blog', 'Blog listing'),
        ('/travel-tips', 'Travel Tips'),
        ('/despre', 'Despre'),
        ('/contact', 'Contact'),
        ('/autor/andrei-munteanu', 'Author page - Andrei Munteanu'),
        ('/blog/ghid-complet-paris-7-zile', 'Paris article'),
    ]
    
    for path, name in pages:
        try:
            resp = requests.get(f"{BASE_URL}{path}", timeout=10)
            if resp.status_code == 200:
                log_test(f"{name} returns 200", True, f"URL: {path}")
            else:
                log_test(f"{name} returns 200", False, f"Status: {resp.status_code}, URL: {path}", critical=True)
        except Exception as e:
            log_test(f"{name} returns 200", False, f"Exception: {e}", critical=True)
    
    # Test 404 for non-existent author
    try:
        resp = requests.get(f"{BASE_URL}/autor/inexistent", timeout=10)
        if resp.status_code == 404:
            log_test("Non-existent author returns 404", True)
        else:
            log_test("Non-existent author returns 404", False, 
                    f"Status: {resp.status_code} (expected 404)", critical=True)
    except Exception as e:
        log_test("Non-existent author returns 404", False, f"Exception: {e}")

def test_json_ld_schemas():
    """Test 5: JSON-LD schemas on article page"""
    print("\n" + "="*60)
    print("TEST 5: JSON-LD SCHEMAS ON ARTICLE PAGE")
    print("="*60)
    
    try:
        resp = requests.get(f"{BASE_URL}/blog/ghid-complet-paris-7-zile", timeout=10)
        
        if resp.status_code != 200:
            log_test("Article page accessible", False, f"Status: {resp.status_code}", critical=True)
            return
        
        html = resp.text
        
        # Extract JSON-LD scripts
        parser = JSONLDExtractor()
        parser.feed(html)
        json_ld_scripts = parser.json_ld_scripts
        
        # Check count
        if len(json_ld_scripts) >= 5:
            log_test("Article has at least 5 JSON-LD scripts", True, f"Found: {len(json_ld_scripts)}")
        else:
            log_test("Article has at least 5 JSON-LD scripts", False, 
                    f"Found: {len(json_ld_scripts)} (expected >= 5)", critical=True)
        
        # Parse each script and check validity
        schemas = []
        for i, script in enumerate(json_ld_scripts):
            try:
                schema = json.loads(script)
                schemas.append(schema)
                log_test(f"JSON-LD script {i+1} is valid JSON", True, f"Type: {schema.get('@type', 'Unknown')}")
            except json.JSONDecodeError as e:
                log_test(f"JSON-LD script {i+1} is valid JSON", False, f"Parse error: {e}", critical=True)
        
        # Check for required schema types
        schema_types = [s.get('@type') for s in schemas]
        required_types = ['Article', 'FAQPage', 'HowTo', 'TouristTrip']
        
        for req_type in required_types:
            if req_type in schema_types:
                log_test(f"Found {req_type} schema", True)
            else:
                log_test(f"Found {req_type} schema", False, 
                        f"Missing {req_type} schema (found: {schema_types})", critical=True)
        
        # Check Article schema fields
        article_schema = next((s for s in schemas if s.get('@type') == 'Article'), None)
        if article_schema:
            required_fields = ['headline', 'datePublished', 'author']
            missing_fields = [f for f in required_fields if f not in article_schema]
            if not missing_fields:
                log_test("Article schema has required fields", True, 
                        f"headline, datePublished, author present")
            else:
                log_test("Article schema has required fields", False, 
                        f"Missing: {missing_fields}", critical=True)
        
        # Check HowTo schema steps
        howto_schema = next((s for s in schemas if s.get('@type') == 'HowTo'), None)
        if howto_schema:
            steps = howto_schema.get('step', [])
            if isinstance(steps, list) and len(steps) >= 3:
                log_test("HowTo schema has >= 3 steps", True, f"Found {len(steps)} steps")
            else:
                log_test("HowTo schema has >= 3 steps", False, 
                        f"Found {len(steps) if isinstance(steps, list) else 0} steps", critical=True)
        
    except Exception as e:
        log_test("JSON-LD schemas test", False, f"Exception: {e}", critical=True)

def test_seo_metadata():
    """Test 6: SEO metadata on key pages"""
    print("\n" + "="*60)
    print("TEST 6: SEO METADATA ON KEY PAGES")
    print("="*60)
    
    pages = [
        ('/travel-tips', 'Sfaturi de călătorie', 'Travel Tips'),
        ('/despre', 'Despre mine', 'Despre'),
        ('/autor/andrei-munteanu', 'Andrei Munteanu', 'Author page'),
    ]
    
    for path, expected_text, name in pages:
        try:
            resp = requests.get(f"{BASE_URL}{path}", timeout=10)
            if resp.status_code != 200:
                log_test(f"{name} - page accessible", False, f"Status: {resp.status_code}")
                continue
            
            html = resp.text
            
            # Check title
            title_match = re.search(r'<title[^>]*>(.*?)</title>', html, re.IGNORECASE | re.DOTALL)
            if title_match:
                title = title_match.group(1).strip()
                if expected_text.lower() in title.lower():
                    log_test(f"{name} - title contains '{expected_text}'", True, f"Title: {title}")
                else:
                    log_test(f"{name} - title contains '{expected_text}'", False, 
                            f"Title: {title} (expected to contain '{expected_text}')")
            else:
                log_test(f"{name} - has title tag", False, "No <title> tag found")
            
            # Check canonical link
            if 'rel="canonical"' in html or 'rel=\'canonical\'' in html:
                log_test(f"{name} - has canonical link", True)
            else:
                log_test(f"{name} - has canonical link", False, "No canonical link found")
            
        except Exception as e:
            log_test(f"{name} - metadata test", False, f"Exception: {e}")

def test_api_endpoints():
    """Test 7: API endpoints health check"""
    print("\n" + "="*60)
    print("TEST 7: API ENDPOINTS HEALTH CHECK")
    print("="*60)
    
    # Test GET /api/articles
    try:
        resp = requests.get(f"{API_URL}/articles", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            items = data.get('items', [])
            if isinstance(items, list) and len(items) > 0:
                log_test("GET /api/articles returns items array", True, f"Found {len(items)} items")
            else:
                log_test("GET /api/articles returns items array", False, "Empty or missing items array")
        else:
            log_test("GET /api/articles", False, f"Status: {resp.status_code}", critical=True)
    except Exception as e:
        log_test("GET /api/articles", False, f"Exception: {e}", critical=True)
    
    # Test GET /api/articles/by-slug/ghid-complet-paris-7-zile
    try:
        resp = requests.get(f"{API_URL}/articles/by-slug/ghid-complet-paris-7-zile", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            article = data.get('article')
            related = data.get('related')
            relatedGroups = data.get('relatedGroups')
            
            if article:
                log_test("GET /api/articles/by-slug returns article", True)
            else:
                log_test("GET /api/articles/by-slug returns article", False, "Missing article field")
            
            if relatedGroups:
                required_keys = ['sameCountry', 'sameType', 'sameContinent']
                missing_keys = [k for k in required_keys if k not in relatedGroups]
                if not missing_keys:
                    log_test("relatedGroups has required keys", True, 
                            f"Keys: {list(relatedGroups.keys())}")
                else:
                    log_test("relatedGroups has required keys", False, 
                            f"Missing: {missing_keys}, Found: {list(relatedGroups.keys())}")
            else:
                log_test("relatedGroups present", False, "Missing relatedGroups field")
        else:
            log_test("GET /api/articles/by-slug", False, f"Status: {resp.status_code}", critical=True)
    except Exception as e:
        log_test("GET /api/articles/by-slug", False, f"Exception: {e}", critical=True)
    
    # Test GET /api/articles/meta
    try:
        resp = requests.get(f"{API_URL}/articles/meta", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            continents = data.get('continents', [])
            countries = data.get('countries', [])
            types = data.get('types', [])
            if continents and countries and types:
                log_test("GET /api/articles/meta returns metadata", True, 
                        f"Continents: {len(continents)}, Countries: {len(countries)}, Types: {len(types)}")
            else:
                log_test("GET /api/articles/meta returns metadata", False, 
                        "Missing continents, countries, or types")
        else:
            log_test("GET /api/articles/meta", False, f"Status: {resp.status_code}", critical=True)
    except Exception as e:
        log_test("GET /api/articles/meta", False, f"Exception: {e}", critical=True)
    
    # Test POST /api/admin/login
    try:
        resp = requests.post(f"{API_URL}/admin/login", json={"password": ADMIN_PASSWORD}, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            token = data.get('token')
            if token:
                log_test("POST /api/admin/login returns token", True)
                
                # Test POST /api/admin/bulk-update-year
                try:
                    resp2 = requests.post(
                        f"{API_URL}/admin/bulk-update-year",
                        json={"from": "2025", "to": "2026"},
                        headers={"X-Admin-Token": token},
                        timeout=10
                    )
                    if resp2.status_code == 200:
                        data2 = resp2.json()
                        if 'updated' in data2 and isinstance(data2['updated'], (int, float)):
                            log_test("POST /api/admin/bulk-update-year returns updated count", True, 
                                    f"Updated: {data2['updated']}")
                        else:
                            log_test("POST /api/admin/bulk-update-year returns updated count", False, 
                                    f"Missing or invalid 'updated' field: {data2}")
                    else:
                        log_test("POST /api/admin/bulk-update-year", False, f"Status: {resp2.status_code}")
                except Exception as e:
                    log_test("POST /api/admin/bulk-update-year", False, f"Exception: {e}")
            else:
                log_test("POST /api/admin/login returns token", False, "Missing token in response")
        else:
            log_test("POST /api/admin/login", False, f"Status: {resp.status_code}", critical=True)
    except Exception as e:
        log_test("POST /api/admin/login", False, f"Exception: {e}", critical=True)
    
    # Test POST /api/newsletter
    try:
        resp = requests.post(f"{API_URL}/newsletter", json={"email": "seotest@example.com"}, timeout=10)
        if resp.status_code == 200:
            log_test("POST /api/newsletter", True)
        else:
            log_test("POST /api/newsletter", False, f"Status: {resp.status_code}")
    except Exception as e:
        log_test("POST /api/newsletter", False, f"Exception: {e}")
    
    # Test POST /api/contact
    try:
        resp = requests.post(
            f"{API_URL}/contact",
            json={"name": "SEO Test", "email": "seotest@example.com", "message": "Test"},
            timeout=10
        )
        if resp.status_code == 200:
            log_test("POST /api/contact", True)
        else:
            log_test("POST /api/contact", False, f"Status: {resp.status_code}")
    except Exception as e:
        log_test("POST /api/contact", False, f"Exception: {e}")
    
    # Test POST /api/comments
    try:
        resp = requests.post(
            f"{API_URL}/comments?slug=ghid-complet-paris-7-zile",
            json={"slug": "ghid-complet-paris-7-zile", "name": "SEO Test", "message": "Test comment"},
            timeout=10
        )
        if resp.status_code == 200:
            log_test("POST /api/comments", True)
        else:
            log_test("POST /api/comments", False, f"Status: {resp.status_code}")
    except Exception as e:
        log_test("POST /api/comments", False, f"Exception: {e}")

def test_author_page_articles():
    """Test 8: Author page renders articles"""
    print("\n" + "="*60)
    print("TEST 8: AUTHOR PAGE RENDERS ARTICLES")
    print("="*60)
    
    try:
        resp = requests.get(f"{BASE_URL}/autor/andrei-munteanu", timeout=10)
        if resp.status_code != 200:
            log_test("Author page accessible", False, f"Status: {resp.status_code}", critical=True)
            return
        
        html = resp.text
        
        # Count <article> tags
        article_count = html.count('<article')
        
        if article_count > 0:
            log_test("Author page renders articles", True, f"Found {article_count} <article> blocks")
        else:
            log_test("Author page renders articles", False, 
                    "No <article> blocks found (expected > 0 since seed articles have author 'Andrei Munteanu')", 
                    critical=True)
        
        # Check for author name in content
        if 'Andrei Munteanu' in html:
            log_test("Author page contains author name", True)
        else:
            log_test("Author page contains author name", False, "Author name not found in HTML")
        
    except Exception as e:
        log_test("Author page test", False, f"Exception: {e}", critical=True)

def main():
    print("="*60)
    print("SEO TESTING SUITE - Destinația Următoare")
    print("="*60)
    print(f"Base URL: {BASE_URL}")
    print(f"Expected Base URL in sitemap: {EXPECTED_BASE_URL}")
    print("="*60)
    
    try:
        # Run all tests
        test_sitemap()
        test_robots()
        test_feed()
        test_core_pages()
        test_json_ld_schemas()
        test_seo_metadata()
        test_api_endpoints()
        test_author_page_articles()
        
    except Exception as e:
        print(f"\n❌ FATAL ERROR: {e}")
    
    # Print summary
    print("\n" + "="*60)
    print("SEO TEST SUMMARY")
    print("="*60)
    print(f"✅ Passed: {test_results['passed']}")
    print(f"❌ Failed: {test_results['failed']}")
    
    if test_results['critical_failures']:
        print(f"\n🚨 CRITICAL FAILURES ({len(test_results['critical_failures'])}):")
        for i, failure in enumerate(test_results['critical_failures'], 1):
            print(f"  {i}. {failure}")
    else:
        print("\n✅ No critical failures - SEO is healthy!")
    
    print("="*60)

if __name__ == "__main__":
    main()
