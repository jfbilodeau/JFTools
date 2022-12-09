import {getStudyGuide} from '../scrapper.js'
import pug from 'pug'
import {BlobServiceClient, StorageSharedKeyCredential} from '@azure/storage-blob'
import fs from "fs";

async function streamToText(readable) {
    readable.setEncoding('utf8');
    let data = '';
    for await (const chunk of readable) {
        data += chunk;
    }
    return data;
}

export default async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    // const name = (req.query.name || (req.body && req.body.name));
    // const responseMessage = name
    //     ? "Hello, " + name + ". This HTTP triggered function executed successfully."
    //     : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";

    var content = ``
    var status = 200
    var contentType = `text/html`

    try {
        const templatePath = `KCGen/templates`
        const code = req.query.code
        const courseId = req.query.courseId?.toLowerCase()
        const locale = req.query.locale?.toLowerCase() ?? `en-us`

        if (courseId) {
            const accountName = `jfbilodeau`;
            const storageAccountUrl = `https://${accountName}.blob.core.windows.net`;
            const accountKey = `6IYAjWjBLTcL1C46boIfeB8iWe8IUdAlDQ391WGIG9vSsLM5QDXCF9sw1q7+6kqkgWUVnPvi5+JT+ASteTtnbA==`;
            const blobClient = new BlobServiceClient(storageAccountUrl, new StorageSharedKeyCredential(accountName, accountKey))

            const containerName = `knowledgechecks`;
            const container = await blobClient.getContainerClient(containerName)

            const blobName = `${courseId}.${locale}`
            const blob = await container.getBlockBlobClient(blobName)

            let studyGuide = ''

            if (await blob.exists()) {
                const content = await blob.download(0)
                const json = await streamToText(content.readableStreamBody)
                studyGuide = JSON.parse(json)
            } else {
                studyGuide = await getStudyGuide(courseId, locale)
                // studyGuide = JSON.parse(fs.readFileSync(`./KCGen/test.json`))

                const studyGuideJson = JSON.stringify(studyGuide)

                await blob.upload(studyGuideJson, studyGuideJson.length)
            }

            // content = generateKnowledgeCheckDocumentToString(studyGuide)
            const template = pug.compileFile(`${templatePath}/document.pug`)
            content = template(studyGuide)
        } else {
            const template = pug.compileFile(`${templatePath}/form.pug`)

            // content = `<!doctype html><form><hidden name="code" value="${code}"></hidden>Course ID: <input name="courseId"><button type="submit">Generate</button></form>`
            content = template({
                code
            })
            contentType = `text/html`
        }
    } catch (e) {
        status = 500
        content = e.toString()
        console.error(e)
    }

    context.res = {
        status,
        headers: {
            'content-type': contentType
        },
        body: content
    }
}