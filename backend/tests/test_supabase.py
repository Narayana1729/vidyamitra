import os
from supabase import create_client

url = "https://bgdohxnhrjmjssjhivjo.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZG9oeG5ocmptanNzamhpdmpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMTUyODgsImV4cCI6MjA4OTU5MTI4OH0.vYOfF3j8TkleWHC-lV8JI3VTATacXnnp7P5fuAL_Nfk"
supabase = create_client(url, key)

try:
    res = supabase.table("profiles").select("*").limit(1).execute()
    print("SUCCESS: Supabase is active.", len(res.data), "rows found.")
except Exception as e:
    print("ERROR WITH SUPABASE:", e)
