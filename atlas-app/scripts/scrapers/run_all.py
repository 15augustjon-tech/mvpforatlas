"""
ATLAS Scraper Runner
====================
Runs all scrapers and saves results to Supabase.

Usage:
    python run_all.py              # Scrape and print results
    python run_all.py --save       # Scrape and save to Supabase
    python run_all.py --test       # Test mode (just YC, no save)
"""

import asyncio
import argparse
import json
import os
from datetime import datetime
from typing import List, Dict, Any

# Import scrapers
from yc import YCombinatorScraper

# Optional: Supabase client
try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    print("⚠️  Supabase not installed. Run: pip install supabase")

# =============================================================================
# Configuration
# =============================================================================

# Load from environment variables or .env file
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")  # Use service key for inserts

# =============================================================================
# Scraper Registry
# =============================================================================

SCRAPERS = [
    YCombinatorScraper(),
    # Add more scrapers here as you build them:
    # BuiltInScraper(),
    # WellfoundScraper(),
    # LinkedInScraper(),
]

# =============================================================================
# Main Functions
# =============================================================================

async def scrape_all() -> List[Dict[str, Any]]:
    """
    Run all scrapers and collect results.

    Returns:
        Combined list of all opportunities
    """
    all_opportunities = []

    print("\n🚀 ATLAS Scraper Starting...")
    print("=" * 50)

    for scraper in SCRAPERS:
        try:
            if hasattr(scraper, 'scrape_internships'):
                jobs = await scraper.scrape_internships()
            else:
                # Generic scrape method
                jobs = await scraper.scrape()

            all_opportunities.extend(jobs)
            print(f"   ✅ {scraper.SOURCE_NAME}: {len(jobs)} opportunities")

        except Exception as e:
            print(f"   ❌ {scraper.SOURCE_NAME} failed: {e}")

    print("=" * 50)
    print(f"📊 Total: {len(all_opportunities)} opportunities scraped")

    return all_opportunities


def save_to_json(opportunities: List[Dict[str, Any]], filename: str = None):
    """
    Save opportunities to a JSON file.

    Args:
        opportunities: List of opportunity dictionaries
        filename: Output filename (default: scraped_YYYY-MM-DD.json)
    """
    if not filename:
        date_str = datetime.now().strftime("%Y-%m-%d")
        filename = f"scraped_{date_str}.json"

    with open(filename, 'w') as f:
        json.dump(opportunities, f, indent=2, default=str)

    print(f"💾 Saved to {filename}")


async def save_to_supabase(opportunities: List[Dict[str, Any]]) -> int:
    """
    Save opportunities to Supabase database.

    Args:
        opportunities: List of opportunity dictionaries

    Returns:
        Number of opportunities inserted
    """
    if not SUPABASE_AVAILABLE:
        print("❌ Supabase library not installed")
        return 0

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ Supabase credentials not configured")
        print("   Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY")
        return 0

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    inserted = 0

    print("\n📤 Uploading to Supabase...")

    for opp in opportunities:
        try:
            # Check if opportunity already exists (by URL)
            existing = supabase.table("opportunities").select("id").eq("url", opp.get("url", "")).execute()

            if existing.data:
                # Update existing
                supabase.table("opportunities").update(opp).eq("url", opp["url"]).execute()
                print(f"   🔄 Updated: {opp.get('company', 'Unknown')}")
            else:
                # Insert new
                supabase.table("opportunities").insert(opp).execute()
                inserted += 1
                print(f"   ✅ Inserted: {opp.get('company', 'Unknown')} - {opp.get('title', 'Unknown')}")

        except Exception as e:
            print(f"   ❌ Failed to save {opp.get('company', 'Unknown')}: {e}")

    print(f"\n✨ Inserted {inserted} new opportunities")
    return inserted


def print_summary(opportunities: List[Dict[str, Any]]):
    """Print a summary of scraped opportunities."""
    print("\n📋 SCRAPED OPPORTUNITIES")
    print("=" * 60)

    for i, opp in enumerate(opportunities[:10], 1):
        print(f"\n{i}. {opp.get('company', 'Unknown Company')}")
        print(f"   Title: {opp.get('title', 'N/A')}")
        print(f"   Location: {opp.get('location', 'N/A')}")
        print(f"   Type: {opp.get('opportunity_type', 'N/A')}")
        if opp.get('salary_min'):
            print(f"   Salary: ${opp['salary_min']:,} - ${opp.get('salary_max', 0):,}")

    if len(opportunities) > 10:
        print(f"\n... and {len(opportunities) - 10} more")


# =============================================================================
# CLI Entry Point
# =============================================================================

async def main():
    parser = argparse.ArgumentParser(description="ATLAS Opportunity Scraper")
    parser.add_argument("--save", action="store_true", help="Save to Supabase")
    parser.add_argument("--json", action="store_true", help="Save to JSON file")
    parser.add_argument("--test", action="store_true", help="Test mode (limited scraping)")
    args = parser.parse_args()

    # Run scrapers
    opportunities = await scrape_all()

    if not opportunities:
        print("\n⚠️  No opportunities found. Check your internet connection.")
        return

    # Print summary
    print_summary(opportunities)

    # Save results
    if args.json or not args.save:
        save_to_json(opportunities)

    if args.save:
        await save_to_supabase(opportunities)

    print("\n✅ Done!")


if __name__ == "__main__":
    asyncio.run(main())
