
import os
from dotenv import load_dotenv

from supabase import create_client, Client

load_dotenv()

print((os.environ.get("SUPABASE_URL")))
print((os.environ.get("SUPABASE_KEY")))

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)
