import axios from "axios";

export async function POST(req: Request) {
    const data = await req.json();
    const { token } = data;
    const secretKey: string | undefined = process.env.RECAPTCHA_SECRET_KEY;

    if (!token) {
        return new Response(JSON.stringify({ message: "Token not found" }), {
            status: 405,
        });
    }

    try {
        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`,
        );

        if (response.data.success) {
            return new Response(JSON.stringify({ message: "Success" }), {
                status: 200,
                headers: {
                    "Set-Cookie": `require_captcha=false; Path=/; Max-Age=0`,
                },
            });
        } else {
            return new Response(JSON.stringify({ message: "Failed to verify" }), {
                status: 405,
            });
        }
    } catch (error) {
        return new Response(JSON.stringify({ message: "Internal Server Error" }), {
            status: 500,
        });
    }
}
