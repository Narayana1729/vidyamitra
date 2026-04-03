import asyncio
from httpx import AsyncClient

async def test():
    async with AsyncClient() as client:
        # Mocking an auth token isn't easy here, let's just make a dummy request to get the exact exception text
        # If it's a 401, we won't get the 500 error. 
        # But wait, we can just view the logs from the backend!
        pass
