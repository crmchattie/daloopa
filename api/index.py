from os import getenv
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pymongo import MongoClient
import base64
import os
from typing import Optional

load_dotenv()

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://v0-daloopa-pwmoe6lpl42.vercel.app"],  # Allow the Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# MongoDB Configuration with default values as fallback
MONGO_URI = getenv('MONGO_URI') or "mongodb://localhost:27017"
DATABASE_NAME = getenv('DATABASE_NAME') or "daloopa"
COLLECTION_NAME = getenv('COLLECTION_NAME') or "companies"

# Verify environment variables are loaded
if not all([MONGO_URI, DATABASE_NAME, COLLECTION_NAME]):
    raise ValueError("Required environment variables are not set")

client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]
collection = db[COLLECTION_NAME]

# API Key for Authentication with default values as fallback
API_USERNAME = getenv('API_USERNAME') or "default_user"
API_KEY = getenv('API_KEY') or "default_key"

# Verify auth environment variables are loaded
if API_USERNAME == "default_user" or API_KEY == "default_key":
    print("Warning: Using default authentication credentials")

AUTH_HEADER = base64.b64encode(f"{API_USERNAME}:{API_KEY}".encode()).decode()

# Define security
security = HTTPBasic()

def authenticate(credentials: HTTPBasicCredentials = Depends(security)):
    """Authenticates API requests using Basic Auth."""
    encoded_credentials = base64.b64encode(f"{credentials.username}:{credentials.password}".encode()).decode()
    if encoded_credentials != AUTH_HEADER:
        raise HTTPException(status_code=401, detail="Invalid API credentials")
    return True

@app.get("/api/get_company")
def get_company(
    ticker: Optional[str] = None,
    company: Optional[str] = None,
    credentials: HTTPBasicCredentials = Depends(authenticate),
):
    print(f"Received request for ticker: {ticker}, company: {company}")
    
    if not ticker and not company:
        raise HTTPException(status_code=400, detail="Either 'ticker' or 'company' must be provided as a query parameter.")

    query_filter = {"ticker": ticker} if ticker else {"company": company}

    try:
        company_data = collection.find_one(query_filter, {"_id": 0})
        print(f"Query result: {'Found' if company_data else 'Not found'}")
        if not company_data:
            raise HTTPException(status_code=404, detail="Company not found.")
        return {"success": True, "data": company_data}
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/api/hello")
async def hello():
    return {"message": "Hello from FastAPI!"}

@app.options("/api/get_company")
async def options_get_company():
    return {"message": "OK"}

@app.get("/api/download_excel")
async def download_excel():
    file_path = "RDDT Model.xlsx"
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Excel file not found")
    
    origin = 'http://localhost:3000' if getenv('NODE_ENV') == 'development' else 'https://v0-daloopa-pwmoe6lpl42.vercel.app'
    
    headers = {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Authorization',
    }
    
    return FileResponse(
        path=file_path,
        filename="RDDT Model.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers
    )