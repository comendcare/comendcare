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

export const WaitlistEmail = ({ name, email }: WaitlistEmailProps) => {
    return (
        <Html>
            <Head />
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="my-10 mx-auto p-5 w-[465px]">
                        <Img
                            className="w-full"
                            src="https://www.joincomend.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FFull%20logo.8169b0be.png&w=3840&q=75"
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
