
export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();
        
        
        
        return Response.json({ message: 'Welcome!', code: 200});
    } catch(error) {
        const data = await req.json();
        console.log(error);
        return Response.json({ message: 'Failed to login!', code: 500});
    }
}