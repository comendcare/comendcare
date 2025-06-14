export async function GET(request: Request) {
    const url = new URL(request.url);
    const fileUrl = url.searchParams.get('fileUrl');

    if (!fileUrl) {
        return new Response('Missing fileUrl parameter', { status: 400 });
    }

    try {
        const response = await fetch(fileUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
        }

        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();

        // Serialize the data into base64
        const base64Data = Buffer.from(arrayBuffer).toString('base64');
        const fileName = fileUrl.split('/').pop() || 'unknown';

        return new Response(JSON.stringify({
            name: fileName,
            type: blob.type,
            data: base64Data
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error fetching file:', error);
        return new Response('Error fetching file', { status: 500 });
    }
}