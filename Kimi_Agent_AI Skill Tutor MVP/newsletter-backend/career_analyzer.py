"""Career profile analyzer using LLM.

Extracts career information from:
- LinkedIn profile URLs (fetches public profile data)
- Resume PDF/text (extracts key career details)
- Returns structured profile with career category mapping.
"""
import re
import json
from typing import Optional
from config import LLM_PROVIDER, OPENAI_API_KEY, ANTHROPIC_API_KEY, LLM_MODEL, CAREER_CATEGORIES


def get_llm_client():
    """Initialize LLM client based on configuration."""
    if LLM_PROVIDER == "anthropic":
        import anthropic
        return anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    else:
        import openai
        return openai.OpenAI(api_key=OPENAI_API_KEY)


def call_llm(system_prompt: str, user_prompt: str) -> str:
    """Call LLM with system and user prompts."""
    client = get_llm_client()

    if LLM_PROVIDER == "anthropic":
        resp = client.messages.create(
            model=LLM_MODEL,
            max_tokens=2000,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}],
        )
        return resp.content[0].text
    else:
        resp = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,
            max_tokens=2000,
        )
        return resp.choices[0].message.content


def extract_from_linkedin(url: str) -> dict:
    """Analyze a LinkedIn profile URL to extract career info.

    In production, this would use a scraping service (e.g., Proxycurl,
    Bright Data) or LinkedIn API to fetch the actual profile. For the
    MVP, we parse the URL slug and use LLM to infer the profile.
    """
    # Extract slug from URL
    slug_match = re.search(r'linkedin\.com/in/([^/?]+)', url)
    slug = slug_match.group(1) if slug_match else ""

    # Clean slug (remove random suffixes)
    slug = slug.replace("-", " ").replace("_", " ")
    slug = re.sub(r'\d+[a-z]*$', '', slug).strip()  # Remove trailing numbers

    system = """You are a career profile analyzer. Given a LinkedIn profile URL slug,
    infer the person's likely job title, seniority level, industry, and focus areas.
    Respond ONLY with a JSON object in this exact format:
    {
        "role": "Job Title",
        "seniority": "Entry/Mid/Senior/Director/C-Suite",
        "industry": "Industry name",
        "focusAreas": ["area1", "area2", "area3"],
        "confidence": 0.0-1.0
    }"""

    result = call_llm(system, f"LinkedIn profile slug: '{slug}'")

    try:
        # Extract JSON from response
        json_match = re.search(r'\{.*\}', result, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
    except json.JSONDecodeError:
        pass

    # Fallback: map slug keywords to career
    return _fallback_profile(slug)


def extract_from_resume(text: str) -> dict:
    """Analyze resume text to extract career info.

    In production, the resume PDF would be converted to text first
    (using PyPDF2, pdfplumber, or similar).
    """
    # Truncate if too long
    text_preview = text[:8000] if len(text) > 8000 else text

    system = """You are a resume analyzer. Extract the person's current/most recent
    job title, seniority level, industry, and key skill areas from their resume.
    Respond ONLY with a JSON object in this exact format:
    {
        "role": "Job Title",
        "seniority": "Entry/Mid/Senior/Director/C-Suite",
        "industry": "Industry name",
        "focusAreas": ["area1", "area2", "area3"],
        "confidence": 0.0-1.0
    }"""

    result = call_llm(system, f"Resume text:\n\n{text_preview}")

    try:
        json_match = re.search(r'\{.*\}', result, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
    except json.JSONDecodeError:
        pass

    return _fallback_profile(text[:200])


def map_to_career_category(profile: dict) -> str:
    """Map an extracted profile to the closest career category ID."""
    role = profile.get("role", "").lower()
    industry = profile.get("industry", "").lower()
    focus = " ".join(profile.get("focusAreas", [])).lower()
    combined = f"{role} {industry} {focus}"

    # Direct keyword mapping
    keyword_map = {
        "product": "product-management",
        "product manager": "product-management",
        "marketing": "marketing",
        "growth": "marketing",
        "sales": "sales",
        "business development": "sales",
        "operations": "operations",
        "ops": "operations",
        "hr": "hr-people",
        "people": "hr-people",
        "talent": "hr-people",
        "recruit": "hr-people",
        "design": "design",
        "ux": "design",
        "ui": "design",
        "finance": "finance",
        "accounting": "finance",
        "engineer": "engineering",
        "developer": "engineering",
        "software": "engineering",
        "data scientist": "data-science",
        "data analyst": "data-science",
        "machine learning": "data-science",
        "customer success": "customer-success",
        "support": "customer-success",
        "content": "content-creation",
        "writer": "content-creation",
        "consultant": "consulting",
        "strategy": "consulting",
        "legal": "legal",
        "lawyer": "legal",
        "attorney": "legal",
        "healthcare": "healthcare",
        "medical": "healthcare",
        "founder": "entrepreneurship",
        "ceo": "entrepreneurship",
        "entrepreneur": "entrepreneurship",
    }

    for keyword, cat_id in keyword_map.items():
        if keyword in combined:
            return cat_id

    # Use LLM for fuzzy matching
    categories_text = "\n".join([
        f"- {c['id']}: {c['name']} ({c['search_terms']})"
        for c in CAREER_CATEGORIES
    ])

    system = f"""Given a career profile, select the best matching category ID from this list:
{categories_text}

Respond with ONLY the category ID (e.g., "product-management")."""

    result = call_llm(system, f"Role: {profile.get('role')}\nIndustry: {profile.get('industry')}\nFocus: {focus}")
    cat_id = result.strip().strip('"').strip("'")

    # Validate
    valid_ids = {c["id"] for c in CAREER_CATEGORIES}
    return cat_id if cat_id in valid_ids else "product-management"


def _fallback_profile(text: str) -> dict:
    """Create a basic profile from text keywords when LLM fails."""
    text = text.lower()

    # Try to find a role
    roles = [
        "Product Manager", "Marketing Manager", "Sales Director", "Operations Manager",
        "HR Manager", "Designer", "Finance Manager", "Software Engineer",
        "Data Scientist", "Customer Success Manager", "Content Creator",
        "Consultant", "Legal Counsel", "Healthcare Professional", "Founder"
    ]
    detected_role = "Professional"
    for role in roles:
        if role.lower() in text:
            detected_role = role
            break

    # Try seniority
    if any(w in text for w in ["senior", "sr.", "lead", "principal"]):
        seniority = "Senior"
    elif any(w in text for w in ["director", "vp", "head of"]):
        seniority = "Director"
    elif any(w in text for w in ["cso", "ceo", "cto", "chief", "founder", "president"]):
        seniority = "C-Suite"
    elif any(w in text for w in ["junior", "jr.", "entry", "associate", "intern"]):
        seniority = "Entry"
    else:
        seniority = "Mid"

    return {
        "role": detected_role,
        "seniority": seniority,
        "industry": "Technology",
        "focusAreas": ["AI Tools", "Automation"],
        "confidence": 0.5,
    }


def analyze_profile(input_type: str, input_data: str) -> dict:
    """Main entry point: analyze a profile from LinkedIn URL or resume text.

    Returns:
        {
            "profile": {role, seniority, industry, focusAreas, confidence},
            "careerId": "product-management",
            "careerName": "Product Manager"
        }
    """
    if input_type == "linkedin":
        profile = extract_from_linkedin(input_data)
    elif input_type == "resume":
        profile = extract_from_resume(input_data)
    else:
        profile = _fallback_profile(input_data)

    career_id = map_to_career_category(profile)
    career_name = next(
        (c["name"] for c in CAREER_CATEGORIES if c["id"] == career_id),
        "Professional"
    )

    return {
        "profile": profile,
        "careerId": career_id,
        "careerName": career_name,
    }


# --- CLI for testing ---
if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python career_analyzer.py <linkedin_url|resume_text_file>")
        sys.exit(1)

    arg = sys.argv[1]
    if arg.startswith("http"):
        result = analyze_profile("linkedin", arg)
    else:
        with open(arg, "r") as f:
            result = analyze_profile("resume", f.read())

    print(json.dumps(result, indent=2))
