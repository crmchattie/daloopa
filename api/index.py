from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pymongo import MongoClient
import base64
import os
from typing import Optional

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow the Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# MongoDB Configuration
MONGO_URI = "mongodb+srv://crmchattie:wlfkYHdCsO3MbAz2@daloopa.strbq.mongodb.net/?retryWrites=true&w=majority&appName=Daloopa"
DATABASE_NAME = "daloopa"
COLLECTION_NAME = "companies"
client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]
collection = db[COLLECTION_NAME]

# API Key for Authentication
API_USERNAME = "daloopa"
API_KEY = "MGIGYv1MMAE5BheY"
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
    if not ticker and not company:
        raise HTTPException(status_code=400, detail="Either 'ticker' or 'company' must be provided as a query parameter.")

    query_filter = {"ticker": ticker} if ticker else {"company": company}

    try:
        company_data = collection.find_one(query_filter, {"_id": 0})
        if not company_data:
            raise HTTPException(status_code=404, detail="Company not found.")
        return {"success": True, "data": company_data}
    except Exception as e:
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
    
    headers = {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Authorization',
    }
    
    return FileResponse(
        path=file_path,
        filename="RDDT Model.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers
    )