import {getStudyGuide} from '../../scrapper.js'
import pug from 'pug'

export default async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    let content = ``;
    let status = 200;
    let contentType = `text/html`;

    try {
        const templatePath = `KCGen/templates`
        const code = req.query.code
        const courseId = req.query.courseId?.toLowerCase()
        const locale = req.query.locale?.toLowerCase() ?? `en-us`

        if (courseId) {
            const studyGuide = await getStudyGuide(courseId, locale)

            console.log(`Content: ${studyGuide}`)

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