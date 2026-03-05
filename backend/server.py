from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import httpx

ROOT_DIR = Path(__file__).parent
STATIC_MENU_PATH = ROOT_DIR / "static_menu.json"
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# GloriaFood / GlobalFood Fetch Menu API configuration
# Restaurant key from: GloriaFood Admin -> Others -> 3rd party integrations -> Fetch Menu
GLORIAFOOD_RESTAURANT_KEY = os.environ.get('GLORIAFOOD_RESTAURANT_KEY', '4QEMyUlaxCO1vzDDg')
GLORIAFOOD_MENU_API_URL = "https://pos.globalfoodsoft.com/pos/menu"

app = FastAPI()
api_router = APIRouter(prefix="/api")

class MenuItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: Optional[float] = None
    sizes: Optional[List[dict]] = None
    category: str

class MenuCategory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    name_en: str
    items: List[dict]

class ContactMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = None
    message: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactMessageCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    message: str

class RestaurantInfo(BaseModel):
    name: str = "Oscars Pizzeria"
    tagline: str = "Pizza og Grill"
    address: str = "Tulipanvegen 1, 2034 Holter, Norway"
    phone: str = "+47 47 73 73 47"
    website: str = "oscarspizzeria.no"
    rating: float = 4.2
    google_maps_url: str = "https://www.google.com/maps/search/Tulipanvegen+1+2034+Holter"
    opening_hours: dict = {
        "monday": "13:00 - 22:00",
        "tuesday": "13:00 - 22:00",
        "wednesday": "13:00 - 22:00",
        "thursday": "13:00 - 22:00",
        "friday": "13:00 - 22:00",
        "saturday": "12:00 - 22:00",
        "sunday": "12:00 - 22:00"
    }

# Category name translations
CATEGORY_TRANSLATIONS = {
    "Smash Burger": "Smash Burger",
    "Hamburger": "Hamburger",
    "Grill/Kebab": "Grill/Kebab",
    "Sides": "Sides",
    "Italiensk Pizza": "Italian Pizza",
    "Biff/Kylling Pizza": "Beef/Chicken Pizza",
    "Mexicansk Pizza": "Mexican Pizza",
    "Kebab Pizza": "Kebab Pizza",
    "Ost i kanten Pizza": "Cheese Crust Pizza",
    "Spesialitet": "Speciality",
    "Sauser": "Sauces",
    "Barnemeny": "Kids Menu",
    "Drikke": "Drinks",
}

# Cache for menu data
menu_cache = {
    "data": None,
    "timestamp": None,
    "ttl": 300  # Cache for 5 minutes
}

async def fetch_menu_from_gloriafood():
    """Fetch menu data from GloriaFood/GlobalFood Fetch Menu API and transform it"""
    
    # Check cache first
    if menu_cache["data"] and menu_cache["timestamp"]:
        cache_age = (datetime.now(timezone.utc) - menu_cache["timestamp"]).total_seconds()
        if cache_age < menu_cache["ttl"]:
            return menu_cache["data"]
    
    if not GLORIAFOOD_RESTAURANT_KEY:
        logger.warning("GloriaFood restaurant key not configured")
        return None
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as http_client:
            response = await http_client.get(
                GLORIAFOOD_MENU_API_URL,
                headers={
                    "Authorization": GLORIAFOOD_RESTAURANT_KEY,
                    "Accept": "application/json",
                    "Glf-Api-Version": "2"
                }
            )
            response.raise_for_status()
            data = response.json()
            
            # Transform the data to our format
            transformed_menu = transform_globalfood_menu(data)
            
            # Update cache
            menu_cache["data"] = transformed_menu
            menu_cache["timestamp"] = datetime.now(timezone.utc)
            
            return transformed_menu
            
    except Exception as e:
        logger.error(f"Error fetching menu from GloriaFood: {e}")
        return None

def load_static_menu():
    """Fallback: load menu from static_menu.json"""
    if STATIC_MENU_PATH.exists():
        try:
            import json
            with open(STATIC_MENU_PATH, encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.warning(f"Could not load static menu: {e}")
    return []

def transform_globalfood_menu(data):
    """Transform GlobalFood API response to our menu format"""
    categories = data.get("categories", [])
    transformed = []
    
    for cat in categories:
        cat_name = cat.get("name", "")
        cat_name_en = CATEGORY_TRANSLATIONS.get(cat_name, cat_name)
        
        items = []
        for item in cat.get("items", []):
            item_name = item.get("name", "")
            item_desc = item.get("description", "")
            item_price = item.get("price", 0)
            item_sizes = item.get("sizes", [])
            
            transformed_item = {
                "name": item_name,
                "description": item_desc or ""
            }
            
            # Handle sizes
            if item_sizes:
                sizes = []
                for size in item_sizes:
                    size_name = size.get("name", "")
                    size_price = size.get("price", 0)
                    # The price in sizes is often the additional price, so we need the base price
                    # For items with sizes, the base price is usually in the first size or item price
                    if size.get("default", False) or len(sizes) == 0:
                        base_price = item_price if item_price > 0 else size_price
                    actual_price = item_price + size_price if item_price > 0 else size_price
                    if actual_price == 0 and item_price > 0:
                        actual_price = item_price
                    sizes.append({
                        "name": size_name,
                        "price": actual_price if actual_price > 0 else item_price
                    })
                transformed_item["sizes"] = sizes
            else:
                transformed_item["price"] = item_price
            
            items.append(transformed_item)
        
        if items:  # Only add categories with items
            transformed.append({
                "name": cat_name,
                "name_en": cat_name_en,
                "items": items
            })
    
    return transformed

@api_router.get("/")
async def root():
    return {"message": "Oscars Pizzeria API"}

@api_router.get("/menu")
async def get_menu():
    """Get menu - GloriaFood API first, fallback to static_menu.json"""
    menu_data = await fetch_menu_from_gloriafood()
    
    if menu_data:
        return menu_data
    # Fallback: static menu (rediger backend/static_menu.json)
    return load_static_menu()

@api_router.get("/menu/{category}")
async def get_menu_category(category: str):
    menu_data = await fetch_menu_from_gloriafood() or load_static_menu()
    
    if not menu_data:
        raise HTTPException(status_code=503, detail="Menu service temporarily unavailable")
    
    for cat in menu_data:
        if cat["name"].lower() == category.lower() or cat["name_en"].lower() == category.lower():
            return cat
    raise HTTPException(status_code=404, detail="Category not found")

@api_router.get("/restaurant-info")
async def get_restaurant_info():
    return RestaurantInfo()

@api_router.post("/contact", response_model=ContactMessage)
async def send_contact_message(input: ContactMessageCreate):
    contact_dict = input.model_dump()
    contact_obj = ContactMessage(**contact_dict)
    doc = contact_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.contact_messages.insert_one(doc)
    return contact_obj

@api_router.get("/contact-messages", response_model=List[ContactMessage])
async def get_contact_messages():
    messages = await db.contact_messages.find({}, {"_id": 0}).to_list(1000)
    for msg in messages:
        if isinstance(msg['timestamp'], str):
            msg['timestamp'] = datetime.fromisoformat(msg['timestamp'])
    return messages

@api_router.post("/menu/refresh")
async def refresh_menu_cache():
    """Force refresh menu cache"""
    menu_cache["data"] = None
    menu_cache["timestamp"] = None
    menu_data = await fetch_menu_from_gloriafood()
    if menu_data:
        return {"status": "success", "categories": len(menu_data)}
    raise HTTPException(status_code=503, detail="Failed to refresh menu")

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
