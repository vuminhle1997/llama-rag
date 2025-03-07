from fastapi import FastAPI, HTTPException, Depends
from starlette.requests import Request
from starlette.responses import RedirectResponse, JSONResponse

from routers import route
from dependencies import create_db_and_tables
from msal import ConfidentialClientApplication
from dotenv import load_dotenv
import os
import uvicorn
import uuid
import redis

import jwt

load_dotenv()

CLIENT_ID=os.getenv("CLIENT_ID")
CLIENT_SECRET=os.getenv("CLIENT_SECRET")
TENANT_ID=os.getenv("TENANT_ID")
AUTHORITY=f"https://login.microsoftonline.com/{TENANT_ID}"
REDIRECT_URI = os.getenv("REDIRECT_URI")
SCOPES = ["User.Read"]
PORT = int(os.environ.get("PORT", 4000))

azure_app = ConfidentialClientApplication(CLIENT_ID, CLIENT_SECRET, AUTHORITY)

# redis
REDIS_HOST = os.environ.get("REDIS_HOST", "localhost")
REDIS_PORT = os.environ.get("REDIS_PORT", 6379)
print(REDIS_HOST, REDIS_PORT)
redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

def decode_jwt(token: str):
    """Decodes and verifies the JWT token"""
    try:
        decoded_token = jwt.decode(token, options={"verify_signature": False})  # No signature verification for now
        return decoded_token
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

app = FastAPI()
app.include_router(route.router)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/signin")
async def azure_signin():
    auth_url = azure_app.get_authorization_request_url(SCOPES, redirect_uri=REDIRECT_URI)
    return RedirectResponse(url=auth_url)

@app.get("/redirect")
def auth_callback(request: Request):
    code = request.query_params.get("code")
    if not code:
        return JSONResponse({"error": "Authorization code not found"}, status_code=400)

    token_response = azure_app.acquire_token_by_authorization_code(code, SCOPES, redirect_uri=REDIRECT_URI)

    if "access_token" in token_response:
        session_id = str(uuid.uuid4())
        # Store access token in Redis (expires in 1 hour)
        # redis_client.setex(f"session:{session_id}", 3600, token_response["access_token"])

        # Set session cookie
        response = JSONResponse({"message": "Login successful!"})
        response.set_cookie("session_id", session_id, httponly=True, secure=False)  # Set secure=True in production
        return response
    else:
        return JSONResponse({"error": "Failed to retrieve access token"}, status_code=400)

@app.get("/me")
async def get_user_claims(request: Request):
    session_id = request.cookies.get("session_id")
    """Extracts JWT claims from access token"""
    # token = redis_client.get(f"session:{session_id}")
    # claims = decode_jwt(token)
    # return claims
    return session_id

if __name__ == "__main__":
    print(PORT)
    uvicorn.run(app, host="0.0.0.0", port=PORT, reload=True)