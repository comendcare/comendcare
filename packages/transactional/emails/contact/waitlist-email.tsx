import {
    Body,
    Container,
    Head,
    Html,
    Preview,
    Text,
    Tailwind,
    Img
} from "@react-email/components"

interface WaitlistEmailProps {
    name: string | null | undefined
    email: string | null | undefined
}

export default function WaitlistEmail ({ name, email }: WaitlistEmailProps) {
    return (
        <Html>
            <Head />
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="my-10 mx-auto p-5 w-[465px]">
                        <Img
                            className="w-full"
                            src="https://storage.googleapis.com/comend-app-public-permanent/Full%20logo.png"
                            alt="Comend logo"
                        />
                        <Text className="text-sm">
                            New waitlist request from {name}
                        </Text>
                        <Text className="text-sm">Reply to {email}</Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    )
}
