import {getStudyGuide} from '../scrapper.js'
import {generateKnowledgeCheckDocumentToString} from "../generator.js";

export default async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    // const name = (req.query.name || (req.body && req.body.name));
    // const responseMessage = name
    //     ? "Hello, " + name + ". This HTTP triggered function executed successfully."
    //     : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";

    var content = ``
    var status = 200
    var contentType = `text`

    try {
        const code = req.params.code
        const courseId = req.query.courseId
        const locale = req.query.locale ?? `en-us`

        if (courseId) {
            const studyGuide = await getStudyGuide(courseId, locale)
            content = generateKnowledgeCheckDocumentToString(studyGuide)
        } else {
            content = `<!doctype html><form><hidden name="code" value="${code}"></hidden>Course ID: <input name="courseId"><button type="submit">Generate</button></form>`
            contentType = `text/html`
        }
    } catch (e) {
        status = 500
        content = e.toString()
    }

    context.res = {
        status,
        headers: {
            'content-type': contentType
        },
        body: content
    }
}