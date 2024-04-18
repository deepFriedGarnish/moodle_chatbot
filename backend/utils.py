from supabase import create_client
from dotenv import load_dotenv
load_dotenv()

def connectToDB(url, key):
    try:
        connection = create_client(url, key)
        print("---- Connection to Supabase database was successful. ----")
        return connection
    except:
        print("---- Connection to Supabase database failed. ----")