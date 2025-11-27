"""
ATLAS Job Scraper using crawl4ai
================================
This script teaches you how to scrape internship listings using crawl4ai.

crawl4ai is an AI-powered web scraper that:
1. Handles JavaScript-rendered pages (uses Playwright under the hood)
2. Extracts structured data using AI
3. Works with most modern websites
"""

import asyncio
import json
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig
from crawl4ai.extraction_strategy import JsonCssExtractionStrategy, LLMExtractionStrategy

# =============================================================================
# BASIC EXAMPLE: Scrape a simple page
# =============================================================================

async def basic_scrape():
    """
    The simplest way to use crawl4ai - just fetch and get markdown content.
    """
    print("\n📚 LESSON 1: Basic Scraping")
    print("=" * 50)

    async with AsyncWebCrawler() as crawler:
        # Crawl any URL
        result = await crawler.arun(url="https://example.com")

        # The result contains:
        # - result.markdown: Clean markdown version of the page
        # - result.html: Raw HTML
        # - result.success: Whether the crawl succeeded

        print(f"Success: {result.success}")
        print(f"Content preview: {result.markdown[:200]}...")

    return result

# =============================================================================
# INTERMEDIATE: Scrape with CSS selectors (structured extraction)
# =============================================================================

async def scrape_with_css_selectors():
    """
    Extract specific data using CSS selectors.
    This is useful when you know the page structure.
    """
    print("\n📚 LESSON 2: CSS Selector Extraction")
    print("=" * 50)

    # Define what to extract using CSS selectors
    schema = {
        "name": "Job Listings",
        "baseSelector": ".job-card, .opportunity, article",  # Parent element for each job
        "fields": [
            {"name": "title", "selector": "h2, h3, .title", "type": "text"},
            {"name": "company", "selector": ".company, .employer", "type": "text"},
            {"name": "location", "selector": ".location", "type": "text"},
            {"name": "link", "selector": "a", "type": "attribute", "attribute": "href"},
        ]
    }

    extraction_strategy = JsonCssExtractionStrategy(schema)

    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(
            url="https://www.indeed.com/jobs?q=software+intern&l=California",
            extraction_strategy=extraction_strategy,
        )

        if result.success and result.extracted_content:
            jobs = json.loads(result.extracted_content)
            print(f"Found {len(jobs)} job listings")
            for job in jobs[:3]:  # Show first 3
                print(f"  - {job}")

    return result

# =============================================================================
# ADVANCED: Scrape Y Combinator's job board (real example)
# =============================================================================

async def scrape_yc_jobs():
    """
    Scrape Y Combinator's job board for startup internships.
    This is a real, useful example for ATLAS!
    """
    print("\n📚 LESSON 3: Scraping Y Combinator Jobs")
    print("=" * 50)

    # YC Work at a Startup - internships
    url = "https://www.workatastartup.com/jobs?types=intern"

    browser_config = BrowserConfig(
        headless=True,  # Run without visible browser
        verbose=False
    )

    run_config = CrawlerRunConfig(
        wait_until="networkidle",  # Wait for page to fully load
        delay_before_return_html=2.0,  # Extra wait for JS
    )

    async with AsyncWebCrawler(config=browser_config) as crawler:
        result = await crawler.arun(
            url=url,
            config=run_config
        )

        if result.success:
            # Save the markdown for analysis
            with open("yc_jobs_raw.md", "w") as f:
                f.write(result.markdown)
            print(f"✅ Scraped YC jobs! Saved to yc_jobs_raw.md")
            print(f"Content length: {len(result.markdown)} characters")
            print(f"\nPreview:\n{result.markdown[:500]}...")
        else:
            print(f"❌ Failed: {result.error_message}")

    return result

# =============================================================================
# PRACTICAL: Build an ATLAS opportunity scraper
# =============================================================================

async def scrape_for_atlas():
    """
    A practical scraper that pulls opportunities for your ATLAS database.
    Scrapes multiple sources and formats data for Supabase.
    """
    print("\n📚 LESSON 4: Building ATLAS Scraper")
    print("=" * 50)

    opportunities = []

    # List of career pages to scrape
    sources = [
        {
            "name": "Handshake Alternative",
            "url": "https://www.wayup.com/s/internships/california/",
            "type": "internship"
        },
        # Add more sources as needed
    ]

    browser_config = BrowserConfig(headless=True)
    run_config = CrawlerRunConfig(
        wait_until="networkidle",
        delay_before_return_html=2.0,
    )

    async with AsyncWebCrawler(config=browser_config) as crawler:
        for source in sources:
            print(f"\n🔍 Scraping: {source['name']}")

            try:
                result = await crawler.arun(
                    url=source["url"],
                    config=run_config
                )

                if result.success:
                    # Save raw content for manual parsing
                    filename = f"scraped_{source['name'].lower().replace(' ', '_')}.md"
                    with open(filename, "w") as f:
                        f.write(result.markdown)
                    print(f"  ✅ Saved to {filename}")
                else:
                    print(f"  ❌ Failed: {result.error_message}")

            except Exception as e:
                print(f"  ❌ Error: {e}")

    return opportunities

# =============================================================================
# HELPER: Parse scraped content into ATLAS format
# =============================================================================

def parse_to_atlas_format(raw_data: dict) -> dict:
    """
    Convert scraped data to ATLAS database format.
    Use this after scraping to format for Supabase insert.
    """
    return {
        "title": raw_data.get("title", ""),
        "company": raw_data.get("company", ""),
        "location": raw_data.get("location", "California"),
        "opportunity_type": raw_data.get("type", "internship"),
        "url": raw_data.get("url", ""),
        "description": raw_data.get("description", ""),
        "tags": raw_data.get("tags", []),
        "requirements": raw_data.get("requirements", []),
        "is_remote": "remote" in raw_data.get("location", "").lower(),
        "posted_date": raw_data.get("posted_date"),
        "deadline": raw_data.get("deadline"),
        "match_score": 85,  # Default, can be calculated later
    }

# =============================================================================
# MAIN: Run the lessons
# =============================================================================

async def main():
    print("🚀 ATLAS Web Scraping Tutorial with crawl4ai")
    print("=" * 60)

    # Choose which lesson to run:

    # Lesson 1: Basic scraping
    # await basic_scrape()

    # Lesson 2: CSS selectors
    # await scrape_with_css_selectors()

    # Lesson 3: YC Jobs (recommended starting point!)
    await scrape_yc_jobs()

    # Lesson 4: Full ATLAS scraper
    # await scrape_for_atlas()

    print("\n" + "=" * 60)
    print("✨ Tutorial complete!")
    print("\nNext steps:")
    print("1. Check the generated .md files to see scraped content")
    print("2. Modify the CSS selectors for your target sites")
    print("3. Add more sources to the scrape_for_atlas() function")
    print("4. Connect to Supabase to insert opportunities")

if __name__ == "__main__":
    asyncio.run(main())
