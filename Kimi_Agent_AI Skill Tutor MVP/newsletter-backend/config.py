"""Configuration for Daily AI Edge newsletter system."""
import os
from dotenv import load_dotenv

load_dotenv()

# LLM Provider (OpenAI or Anthropic)
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai")  # "openai" or "anthropic"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")  # or "claude-3-haiku-20240307"

# Email (Resend)
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "newsletter@dailyaiedge.com")
FROM_NAME = os.getenv("FROM_NAME", "Daily AI Edge")

# Database (SQLite for MVP)
DATABASE_PATH = os.getenv("DATABASE_PATH", "./subscribers.db")

# Newsletter settings
NEWSLETTER_TIME = os.getenv("NEWSLETTER_TIME", "07:00")  # 24-hour format
MAX_NEWS_ITEMS = int(os.getenv("MAX_NEWS_ITEMS", "5"))
MAX_TOOLS = int(os.getenv("MAX_TOOLS", "3"))

# Career categories
CAREER_CATEGORIES = [
    {"id": "product-management", "name": "Product Manager", "search_terms": "AI product management, AI roadmap tools, product analytics AI"},
    {"id": "marketing", "name": "Marketing", "search_terms": "AI marketing tools, generative AI advertising, AI content marketing"},
    {"id": "sales", "name": "Sales", "search_terms": "AI sales tools, AI prospecting, sales automation AI"},
    {"id": "operations", "name": "Operations", "search_terms": "AI operations, workflow automation, RPA AI"},
    {"id": "hr-people", "name": "HR & People", "search_terms": "AI HR tools, recruiting AI, people analytics"},
    {"id": "design", "name": "Design", "search_terms": "AI design tools, generative design, AI UX"},
    {"id": "finance", "name": "Finance", "search_terms": "AI finance tools, fintech AI, accounting automation"},
    {"id": "engineering", "name": "Engineering", "search_terms": "AI coding tools, developer AI, AI DevOps"},
    {"id": "data-science", "name": "Data Science", "search_terms": "AI data science, ML tools, AI analytics"},
    {"id": "customer-success", "name": "Customer Success", "search_terms": "AI customer success, support automation, AI CRM"},
    {"id": "content-creation", "name": "Content Creation", "search_terms": "AI content creation, video AI, AI writing tools"},
    {"id": "consulting", "name": "Consulting", "search_terms": "AI consulting, enterprise AI, digital transformation AI"},
    {"id": "legal", "name": "Legal", "search_terms": "AI legal tools, legal tech AI, contract AI"},
    {"id": "healthcare", "name": "Healthcare", "search_terms": "AI healthcare, medical AI, health tech"},
    {"id": "entrepreneurship", "name": "Entrepreneurship", "search_terms": "AI startups, founder AI tools, AI business"},
]

CAREER_ID_MAP = {c["id"]: c for c in CAREER_CATEGORIES}
