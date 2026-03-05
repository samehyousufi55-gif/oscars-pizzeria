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

ROOT_DIR = Path(__file__).parent
STATIC_MENU_PATH = ROOT_DIR / "static_menu.json"
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Meny hentes fra Ninito/Foodora via scripts/fetch-menu.js og lagres i static_menu.json

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

def load_static_menu():
    """Load menu from static_menu.json (oppdateres via scripts/fetch-menu.js fra Ninito/Foodora)"""
    if STATIC_MENU_PATH.exists():
        try:
            import json
            with open(STATIC_MENU_PATH, encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logging.warning(f"Could not load static menu: {e}")
    return []

@api_router.get("/")
async def root():
    return {"message": "Oscars Pizzeria API"}

@api_router.get("/menu")
async def get_menu():
    """Get menu from static_menu.json"""
    return load_static_menu()

@api_router.get("/menu/{category}")
async def get_menu_category(category: str):
    menu_data = load_static_menu()
    
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
async def refresh_menu():
    """Reload menu from static_menu.json (bruk scripts/fetch-menu.js for å hente ny meny)"""
    menu_data = load_static_menu()
    if menu_data:
        return {"status": "success", "categories": len(menu_data)}
    raise HTTPException(status_code=503, detail="Menu not available")

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
