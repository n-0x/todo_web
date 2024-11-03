import os.path

DATA = """# Prisma
DATABASE_URL=""

# Json-Webtoken secret
JWT_SECRET=""

# Mongodb-secrets
MONGODB_USER=""
MONGODB_PASSWORD=""
MONGODB_HOST=\"\"

# S2S-secret token
S2S_SECRET)\"\""""

def main():
    file = '.env'
    if os.path.exists(file):
        procc = input('.env alread exists. Override? (y/n)')
        if procc != 'y':
            exit(0)
    
    with open(file, 'w') as f:
        f.write(DATA)

if __name__ == "__main__":
    main()