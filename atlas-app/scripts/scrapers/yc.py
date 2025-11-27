"""
Y Combinator (Work at a Startup) Scraper
========================================
Scrapes internship listings from workatastartup.com
"""

import re
from typing import List, Dict, Any
from base import BaseScraper

class YCombinatorScraper(BaseScraper):
    """Scraper for Y Combinator's Work at a Startup job board."""

    SOURCE_NAME = "Y Combinator"
    BASE_URL = "https://www.workatastartup.com"
    INTERNSHIP_URL = f"{BASE_URL}/jobs?types=intern"

    async def scrape_internships(self) -> List[Dict[str, Any]]:
        """
        Scrape all internship listings from YC.

        Returns:
            List of internship dictionaries
        """
        print(f"🔍 Scraping {self.SOURCE_NAME} internships...")

        try:
            markdown = await self.scrape(self.INTERNSHIP_URL)
            jobs = self.parse_jobs(markdown)
            ca_jobs = self.filter_california(jobs)

            print(f"   Found {len(jobs)} total, {len(ca_jobs)} in California")
            return [self.to_atlas_format(j) for j in ca_jobs]

        except Exception as e:
            print(f"   ❌ Error: {e}")
            return []

    def parse_jobs(self, markdown: str) -> List[Dict[str, Any]]:
        """
        Parse YC job board markdown into structured data.

        The YC page has job cards with company name, role, location, etc.
        This parser extracts that information from the markdown.
        """
        jobs = []

        # YC markdown typically has job listings in a structured format
        # We'll use regex patterns to extract job info

        # Split by common job separators
        sections = re.split(r'\n---\n|\n\*\*\*\n|\n#{2,}\s', markdown)

        for section in sections:
            if len(section.strip()) < 50:
                continue

            job = self._extract_job_from_section(section)
            if job and job.get('title'):
                jobs.append(job)

        # If regex parsing didn't work well, try line-by-line parsing
        if len(jobs) < 3:
            jobs = self._fallback_parse(markdown)

        return jobs

    def _extract_job_from_section(self, section: str) -> Dict[str, Any]:
        """Extract job info from a markdown section."""
        job = {}

        # Try to find company name (usually bold or heading)
        company_match = re.search(r'\*\*([^*]+)\*\*|^#+\s*(.+)$', section, re.MULTILINE)
        if company_match:
            job['company'] = (company_match.group(1) or company_match.group(2)).strip()

        # Try to find job title
        title_patterns = [
            r'(?:intern|internship)[^,\n]*',
            r'(?:software|engineer|data|product|design)[^,\n]*intern[^,\n]*',
        ]
        for pattern in title_patterns:
            title_match = re.search(pattern, section, re.IGNORECASE)
            if title_match:
                job['title'] = title_match.group(0).strip()
                break

        # Try to find location
        location_match = re.search(
            r'(?:location|based in|located in)[:\s]*([^\n,]+)|'
            r'(san francisco|los angeles|remote|new york|palo alto|mountain view)[^\n]*',
            section, re.IGNORECASE
        )
        if location_match:
            job['location'] = (location_match.group(1) or location_match.group(2)).strip()
        else:
            job['location'] = 'Remote'

        # Try to find URL
        url_match = re.search(r'\[([^\]]+)\]\(([^)]+)\)', section)
        if url_match:
            job['url'] = url_match.group(2)
            if not job['url'].startswith('http'):
                job['url'] = self.BASE_URL + job['url']

        # Set type
        job['type'] = 'internship'

        # Extract salary if present
        salary_min, salary_max = self.extract_salary(section)
        if salary_min:
            job['salary_min'] = salary_min
            job['salary_max'] = salary_max

        # Extract description (first 500 chars of the section)
        job['description'] = section[:500].strip()

        return job

    def _fallback_parse(self, markdown: str) -> List[Dict[str, Any]]:
        """
        Fallback parser that looks for job-like patterns line by line.
        """
        jobs = []
        lines = markdown.split('\n')

        current_job = {}
        for line in lines:
            line = line.strip()

            # Skip empty lines
            if not line:
                if current_job.get('title') or current_job.get('company'):
                    jobs.append(current_job)
                    current_job = {}
                continue

            # Look for company names (often bold)
            if line.startswith('**') and line.endswith('**'):
                if current_job:
                    jobs.append(current_job)
                current_job = {'company': line.strip('*').strip(), 'type': 'internship'}

            # Look for intern in line
            elif 'intern' in line.lower():
                current_job['title'] = line.strip('*-# ').strip()

            # Look for location keywords
            elif any(loc in line.lower() for loc in ['san francisco', 'remote', 'california', 'los angeles']):
                current_job['location'] = line.strip()

        return jobs


# Test the scraper
if __name__ == "__main__":
    import asyncio

    async def test():
        scraper = YCombinatorScraper()
        jobs = await scraper.scrape_internships()
        print(f"\n✅ Found {len(jobs)} California internships from YC")
        for job in jobs[:5]:
            print(f"   - {job.get('company', 'Unknown')}: {job.get('title', 'Unknown')}")

    asyncio.run(test())
