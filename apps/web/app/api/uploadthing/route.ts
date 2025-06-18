import type {FileRouter} from 'uploadthing/next';

import {createRouteHandler, createUploadthing} from 'uploadthing/next';

const f = createUploadthing();

const ourFileRouter = {
    editorUploader: f(['image', 'text', 'blob', 'pdf', 'video', 'audio'])
        .middleware(() => {
            return {};
        })
        .onUploadComplete(({file}) => {
            return {
                name: file.name,
                url: file.url,
                size: file.size,
                type: file.type,
                key: file.key,
                customId: file.customId,
                appUrl: file.appUrl,
                ufsUrl: file.ufsUrl,
                fileHash: file.fileHash,
            };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

export const {GET, POST} = createRouteHandler({
    router: ourFileRouter,
});
