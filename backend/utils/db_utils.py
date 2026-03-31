from db.supabase_client import supabase

def save_to_supabase(table: str, data: dict):
    if not supabase:
        return None
    try:
        return supabase.table(table).insert(data).execute()
    except Exception as e:
        print(f"[Supabase Error] Failed to save {table}: {e}")
        return None
