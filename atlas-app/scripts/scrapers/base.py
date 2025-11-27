"""
Base Scraper Class for ATLAS
============================
All scrapers inherit from this class.
"""

from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig
from typing import List, Dict, Any
import re

class BaseScraper:
    """Base class for all ATLAS scrapers."""

    def __init__(self):
        self.browser_config = BrowserConfig(
            headless=True,
            verbose=False
        )
        self.run_config = CrawlerRunConfig(
            wait_until="networkidle",
            delay_before_return_html=2.0,
        )

    async def scrape(self, url: str) -> str:
        """
        Scrape a URL and return clean markdown content.

        Args:
            url: The URL to scrape

        Returns:
            Clean markdown content of the page
        """
        async with AsyncWebCrawler(config=self.browser_config) as crawler:
            result = await crawler.arun(url=url, config=self.run_config)
            if result.success:
                return result.markdown
            else:
                raise Exception(f"Failed to scrape {url}: {result.error_message}")

    def parse_jobs(self, markdown: str) -> List[Dict[str, Any]]:
        """
        Parse scraped markdown into job listings.
        Override this method in subclasses.

        Args:
            markdown: Raw markdown content from scraping

        Returns:
            List of job dictionaries
        """
        raise NotImplementedError("Subclasses must implement parse_jobs()")

    def filter_california(self, jobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Filter jobs to only include California locations.

        Args:
            jobs: List of job dictionaries

        Returns:
            Filtered list of California jobs
        """
        ca_keywords = [
            'california', 'ca', 'san francisco', 'sf', 'los angeles', 'la',
            'san jose', 'san diego', 'palo alto', 'mountain view', 'sunnyvale',
            'santa clara', 'cupertino', 'menlo park', 'redwood city', 'oakland',
            'berkeley', 'irvine', 'santa monica', 'pasadena', 'sacramento',
            'remote', 'hybrid'
        ]

        filtered = []
        for job in jobs:
            location = job.get('location', '').lower()
            if any(keyword in location for keyword in ca_keywords):
                filtered.append(job)

        return filtered

    def to_atlas_format(self, job: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert a job dictionary to ATLAS database format.

        Args:
            job: Raw job dictionary

        Returns:
            Job in ATLAS database format
        """
        location = job.get('location', 'California')

        return {
            "title": job.get("title", ""),
            "company": job.get("company", ""),
            "location": location,
            "opportunity_type": job.get("type", "internship"),
            "url": job.get("url", ""),
            "description": job.get("description", ""),
            "tags": job.get("tags", []),
            "requirements": job.get("requirements", []),
            "is_remote": any(word in location.lower() for word in ["remote", "hybrid"]),
            "posted_date": job.get("posted_date"),
            "deadline": job.get("deadline"),
            "salary_min": job.get("salary_min"),
            "salary_max": job.get("salary_max"),
            "match_score": 85,  # Default score
        }

    def extract_salary(self, text: str) -> tuple:
        """
        Extract salary range from text.

        Args:
            text: Text that might contain salary info

        Returns:
            Tuple of (min_salary, max_salary) or (None, None)
        """
        # Pattern for salary ranges like "$50,000 - $70,000" or "$50k-70k"
        patterns = [
            r'\$(\d{1,3}(?:,\d{3})*)\s*[-–to]+\s*\$(\d{1,3}(?:,\d{3})*)',  # $50,000 - $70,000
            r'\$(\d+)k\s*[-–to]+\s*\$?(\d+)k',  # $50k - $70k
            r'(\d{1,3}(?:,\d{3})*)\s*[-–to]+\s*(\d{1,3}(?:,\d{3})*)\s*(?:per year|/yr|annually)',
        ]

        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                min_sal = int(match.group(1).replace(',', ''))
                max_sal = int(match.group(2).replace(',', ''))
                # Handle "k" notation
                if min_sal < 1000:
                    min_sal *= 1000
                if max_sal < 1000:
                    max_sal *= 1000
                return (min_sal, max_sal)

        return (None, None)
