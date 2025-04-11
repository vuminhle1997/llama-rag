from fastapi import FastAPI, Depends
from starlette.exceptions import HTTPException
from starlette.requests import Request
from starlette.responses import RedirectResponse, JSONResponse, Response
from routers import route
from dependencies import create_db_and_tables, get_redis_client, logger
from msal import ConfidentialClientApplication
from dotenv import load_dotenv
from redis import Redis
from fastapi_pagination import add_pagination
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import os
import uvicorn
import uuid
import requests

# LLM
from llama_index.core.settings import Settings
from llama_index.llms.ollama import Ollama
from llama_index.embeddings.ollama import OllamaEmbedding
from llama_index.llms.groq import Groq
from llama_index.llms.google_genai import GoogleGenAI

load_dotenv()

groq = os.getenv("GROQ_API_KEY")

# LLM
llm = Ollama(model="hf.co/MaziyarPanahi/gemma-3-27b-it-GGUF:Q4_K_M")
# llm = Groq(model="llama-3.3-70b-versatile", api_key=groq)
# llm = GoogleGenAI(model="gemini-2.0-flash")
embed_model = OllamaEmbedding(model_name="mxbai-embed-large")
Settings.llm = llm
Settings.embed_model = embed_model
Settings.chunk_size = 512
Settings.chunk_overlap = 50

ALLOWED_GROUPS_IDS = os.getenv("ALLOWED_GROUPS_IDS").split(',')
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
app.mount("/uploads/avatars", StaticFiles(directory="uploads/avatars"), name="avatar")

def user_is_part_of_group(user_groups: list[str], allowed_groups: list[str]) -> bool:
    return bool(set(user_groups) & set(allowed_groups))

# Middleware to log requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Request: {request.method} {request.url}, \n "
                f"ip-address: {request.client.host} \n "
                f"agent: {request.headers.get('User-Agent')} \n "
                f"accept: {request.headers.get('Accept')}")
    try:
        response = await call_next(request)
    except Exception as ex:
        logger.error(f"Request failed: {ex}", exc_info=True)
        raise
    return response

@app.on_event("startup")
def on_startup():
    logger.debug("Creating tables for Database")
    create_db_and_tables()

@app.get("/signin")
async def azure_signin(request: Request):
    """
    Initiates the Azure sign-in process by redirecting the user to the Azure authorization URL.

    This endpoint generates an authorization URL for the user to sign in with their Azure account.
    Once the user signs in, they will be redirected to the specified redirect URI.

    Example:
        GET /signin

    Returns:
        RedirectResponse: Redirects the user to the Azure authorization URL.
    """
    auth_url = azure_app.get_authorization_request_url(SCOPES, redirect_uri=REDIRECT_URI)
    logger.info("Signed in user IP: ", request.client.host)
    return RedirectResponse(url=auth_url)

@app.get("/logout")
def azure_logout(redis_client: Redis = Depends(get_redis_client), request: Request = Request):
    """
    Logs out the user by deleting their session from Redis.

    This endpoint invalidates the user's session by removing the session ID from Redis.
    The user will be redirected to the specified redirect URI after logout.

    Example:
        GET /logout

    Returns:
        RedirectResponse: Redirects the user to the specified redirect URI.
    """
    session_id = request.cookies.get("session_id")
    if not session_id:
        raise HTTPException(status_code=401, detail="Not logged in")
    redis_client.delete(f"session:{session_id}")
    return RedirectResponse(url=REDIRECT_URI)

@app.get("/redirect")
def auth_callback(request: Request, redis_client: Redis = Depends(get_redis_client)):
    """
    Handles the Azure authentication callback and retrieves the access token.

    This endpoint is called after the user signs in with Azure. It processes the authorization
    code and retrieves an access token. The token is stored in Redis, and a session cookie is set.

    Example:
        GET /redirect?code=<authorization_code>

    Args:
        request (Request): The incoming HTTP request.
        redis_client (Redis): Redis client dependency.

    Returns:
        RedirectResponse: Redirects the user to the frontend if successful.
        JSONResponse: Returns an error message if the token retrieval fails.
    """
    code = request.query_params.get("code")
    if not code:
        logger.error(f"No code for Azure found for user: {request.client.host}")
        return JSONResponse({"error": "Authorization code not found"}, status_code=400)

    token_response = azure_app.acquire_token_by_authorization_code(code, SCOPES, redirect_uri=REDIRECT_URI)

    if "access_token" in token_response:
        session_id = str(uuid.uuid4())
        # Store access token in Redis (expires in 1 hour)
        redis_client.setex(f"session:{session_id}", 3600, token_response["access_token"])
        # Set session cookie
        resp = RedirectResponse(url="http://localhost:3000")
        resp.set_cookie("session_id", session_id, httponly=True, secure=False)
        logger.info(f"Successfully logged in: {session_id} for user: {request.client.host}")
        return resp
    else:
        return JSONResponse({"error": "Failed to retrieve access token"}, status_code=400)

@app.get("/me")
async def get_user_claims(request: Request, redis_client: Redis = Depends(get_redis_client)):
    """
    Retrieves the user's claims and group memberships from Microsoft Graph API.

    This endpoint extracts the user's claims and group memberships using the access token
    stored in Redis. It validates whether the user belongs to the allowed groups.

    Example:
        GET /me

    Args:
        request (Request): The incoming HTTP request.
        redis_client (Redis): Redis client dependency.

    Returns:
        dict: A dictionary containing user information and group memberships.

    Raises:
        HTTPException: If the session ID or token is not found, or if the user does not belong
        to the allowed groups.
    """
    session_id = request.cookies.get("session_id")
    if not session_id:
        logger.error(f"No session id for Azure found for user: {request.client.host}")
        return JSONResponse({"error": "Failed to retrieve access token"}, status_code=400)
    token = redis_client.get(f"session:{session_id}")

    headers = {
        'Authorization': f"Bearer {token}",
    }
    user_info = requests.get("https://graph.microsoft.com/v1.0/me", headers=headers).json()
    group_info = requests.get("https://graph.microsoft.com/v1.0/me/memberOf", headers=headers).json()

    groups: list[str] = map(lambda g: g["id"], list(group_info["value"]))

    if not user_is_part_of_group(groups, ALLOWED_GROUPS_IDS):
        logger.error(f"User {request.client.host} does not belong to any group: {groups}")
        raise HTTPException(status_code=401, detail="User is not part of the group")

    return {
        "user": user_info,
        "groups": group_info,
    }

@app.get("/profile-picture")
async def get_profile_picture(request: Request,
                              redis_client: Redis = Depends(get_redis_client)):
    """
    Fetches the user's profile picture from Microsoft Graph API.

    This endpoint retrieves the user's profile picture using the access token stored in Redis.
    The profile picture is returned as a JPEG image.

    Example:
        GET /profile-picture

    Args:
        request (Request): The incoming HTTP request.
        redis_client (Redis): Redis client dependency.

    Returns:
        Response: The profile picture as a JPEG image.

    Raises:
        HTTPException: If the session ID or token is not found, or if the profile picture
        cannot be retrieved due to an error or invalid token.
    """
    GRAPH_API_URL = "https://graph.microsoft.com/v1.0/me/photo/$value"
    session_id = request.cookies.get("session_id")
    if not session_id:
        logger.error(f"No session id for Azure found for user: {request.client.host}")
        raise HTTPException(status_code=400, detail="Session ID not found")

    token = redis_client.get(f"session:{session_id}")
    if not token:
        logger.error(f"No session id for Azure found for user: {request.client.host}")
        raise HTTPException(status_code=401, detail="Token not found in Redis")

    response = requests.get(GRAPH_API_URL, headers={"Authorization": f"Bearer {token}"})

    if response.status_code == 200:
        return Response(content=response.content, media_type="image/jpeg")
    elif response.status_code == 401:
        logger.error(f"Failed to get session id for user: {request.client.host}")
        raise HTTPException(status_code=401, detail="Unauthorized. Invalid or expired token")
    elif response.status_code == 404:
        logger.error(f"Failed to get session id for user: {request.client.host}")
        raise HTTPException(status_code=404, detail="Profile picture not found")
    else:
        logger.error(f"Failed to get session id for user: {request.client.host}")
        raise HTTPException(status_code=500, detail="Error fetching profile picture")

if __name__ == "__main__":
    logger.debug(f"Backend running at port: {PORT}")
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)