import json
from typing import Set, List

from fastapi import FastAPI, Depends
from starlette.exceptions import HTTPException
from starlette.requests import Request
from starlette.responses import RedirectResponse, JSONResponse, Response
from routers import route
from dependencies import create_db_and_tables, get_redis_client
from msal import ConfidentialClientApplication
from dotenv import load_dotenv
from redis import Redis
from fastapi_pagination import add_pagination
from utils import decode_jwt
from fastapi.middleware.cors import CORSMiddleware

import os
import uvicorn
import uuid
import requests

# LLM
from llama_index.core.settings import Settings
from llama_index.llms.ollama import Ollama
from llama_index.embeddings.ollama import OllamaEmbedding

load_dotenv()

# LLM
llm = Ollama(model="llama3.1")
embed_model = OllamaEmbedding(model_name="nomic-embed-text")
Settings.llm = llm
Settings.embed_model = embed_model
Settings.chunk_size = 512
Settings.chunk_overlap = 50

ALLOWED_GROUPS_IDS = [
    'c7c0bd91-5cfa-4a58-a704-d36ae5a4b51c', # GDE-APP-GLOBALCTINSIGHTCHAT-RO
    '16658413-e21e-4c7d-bbfd-4d59ba68aeb4', # global CT All
]
CLIENT_ID=os.getenv("CLIENT_ID")
CLIENT_SECRET=os.getenv("CLIENT_SECRET")
TENANT_ID=os.getenv("TENANT_ID")
AUTHORITY=f"https://login.microsoftonline.com/{TENANT_ID}"
REDIRECT_URI = os.getenv("REDIRECT_URI")
SCOPES = ["User.Read"]
PORT = int(os.environ.get("PORT", 4000))

origins = [
    "http://localhost",
    "http://localhost:3000",  # Default Next.js dev server
    "http://localhost:4000",  # Make sure this is included
]

azure_app = ConfidentialClientApplication(CLIENT_ID, CLIENT_SECRET, AUTHORITY)

app = FastAPI()
app.include_router(route.router)
add_pagination(app)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow frontend URLs
    allow_credentials=True,  # Required for cookies/sessions
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

def user_is_part_of_group(user_groups: list[str], allowed_groups: list[str]) -> bool:
    return bool(set(user_groups) & set(allowed_groups))

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/signin")
async def azure_signin():
    auth_url = azure_app.get_authorization_request_url(SCOPES, redirect_uri=REDIRECT_URI)
    return RedirectResponse(url=auth_url)

@app.get("/logout")
def azure_logout(redis_client: Redis = Depends(get_redis_client), request: Request = Request):
    session_id = request.cookies.get("session_id")
    if not session_id:
        raise HTTPException(status_code=401, detail="Not logged in")
    redis_client.delete(f"session:{session_id}")
    return RedirectResponse(url=REDIRECT_URI)

@app.get("/redirect")
def auth_callback(request: Request, redis_client: Redis = Depends(get_redis_client)):
    code = request.query_params.get("code")
    if not code:
        return JSONResponse({"error": "Authorization code not found"}, status_code=400)

    token_response = azure_app.acquire_token_by_authorization_code(code, SCOPES, redirect_uri=REDIRECT_URI)

    if "access_token" in token_response:
        session_id = str(uuid.uuid4())
        # Store access token in Redis (expires in 1 hour)
        redis_client.setex(f"session:{session_id}", 3600, token_response["access_token"])
        # Set session cookie
        resp = RedirectResponse(url="http://localhost:3000")
        resp.set_cookie("session_id", session_id, httponly=True, secure=False)
        return resp
    else:
        return JSONResponse({"error": "Failed to retrieve access token"}, status_code=400)

@app.get("/me")
async def get_user_claims(request: Request, redis_client: Redis = Depends(get_redis_client)):
    """Extracts JWT claims from access token"""
    session_id = request.cookies.get("session_id")
    if not session_id:
        return JSONResponse({"error": "Failed to retrieve access token"}, status_code=400)
    token = redis_client.get(f"session:{session_id}")
    claims = decode_jwt(token)

    headers = {
        'Authorization': f"Bearer {token}",
    }
    user_info = requests.get("https://graph.microsoft.com/v1.0/me", headers=headers).json()
    group_info = requests.get("https://graph.microsoft.com/v1.0/me/memberOf", headers=headers).json()

    return {
        "user": user_info,
        "groups": group_info,
    }

@app.get("/profile-picture")
async def get_profile_picture(request: Request,
                              redis_client: Redis = Depends(get_redis_client)):
    GRAPH_API_URL = "https://graph.microsoft.com/v1.0/me/photo/$value"
    session_id = request.cookies.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID not found")

    token = redis_client.get(f"session:{session_id}")
    if not token:
        raise HTTPException(status_code=401, detail="Token not found in Redis")

    response = requests.get(GRAPH_API_URL, headers={"Authorization": f"Bearer {token}"})

    if response.status_code == 200:
        return Response(content=response.content, media_type="image/jpeg")
    elif response.status_code == 401:
        raise HTTPException(status_code=401, detail="Unauthorized. Invalid or expired token")
    elif response.status_code == 404:
        raise HTTPException(status_code=404, detail="Profile picture not found")
    else:
        raise HTTPException(status_code=500, detail="Error fetching profile picture")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)