import {getStudyGuide} from '../../scrapper.js'
import AdmZip from 'adm-zip'
import fetch from 'node-fetch'
import axios from "axios";

export default async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const templatePath = `KlaxGen/templates`
    const code = req.query.code
    const courseId = req.query.courseId?.toLowerCase()
    const locale = req.query.locale?.toLowerCase() ?? `en-us`


    const studyGuide = await getStudyGuide(courseId, locale)

    const uri = `https://enterprise.klaxoon.com/manager/api/meeting_create`
    const payload = `--BOUNDARY\r\nContent-Disposition: form-data; name="data"\r\n\r\n{"label":"${studyGuide.}","type":null,"image":{}}\r\n--BOUNDARY--`
    const cookie = `__zlcmid=1BclAvfpYQKQ9JD; axeptio_authorized_vendors=,,; axeptio_all_vendors=,,; hubspotutk=3123dc8426f202d022524a590320b3e3; axeptio_cookies={"$$token":"arounmotz8hslkf47ep9td","$$date":"2022-08-29T15:20:34.786Z","$$completed":true}; _gcl_au=1.1.480910693.1669735513; messagesUtk=22b2fd71ea94422fbf702588ec915bee; u=W3sidSI6ImVudGVycHJpc2UtYWNjZXNzIiwiciI6MzAsImMiOm51bGx9XSAg; enterprise-prod_token=4f2911f4b205bda3051b1c979a9968b41669735556732; cc=OK; ccss=OK; a2xheG9vbi5jb20=-_lr_uf_-psyfkp=c71c1f99-b3ff-4cf0-ba84-283fd8d93c4c; __hssrc=1; ln_or=d; _gid=GA1.2.227749124.1670857869; TTMSESSID=75fdpg09cotrl39fgm9umair39; a2xheG9vbi5jb20=-_lr_hb_-psyfkp/klaxoon={"heartbeat":1670877433093}; __hstc=39637244.3123dc8426f202d022524a590320b3e3.1661786410712.1670868235255.1670877433907.13; a2xheG9vbi5jb20=-_lr_tabs_-psyfkp/klaxoon={"sessionID":0,"recordingID":"5-70ca3a07-b214-41b9-87e4-0755051a3d0c","lastActivity":1670877442386}; _ga=GA1.1.265143858.1661786421; _ga_N7NQM6ZZ1C=GS1.1.1670877444.8.0.1670877446.58.0.0; firstConnection=false`

    const init = {
        method: `post`,
        body: payload,
        headers: {
            cookie,
            'accept': `application/json`,
            'accept-language': `en-CA,en;q=0.9,fr-CA;q=0.8,fr;q=0.7`,
            'sec-ch-ua': "\"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"108\", \"Microsoft Edge\";v=\"108\"",
            'sec-ch-ua-mobile': "?0",
            'sec-ch-ua-platform': "\"Windows\"",
            'sec-fetch-dest': "empty",
            'sec-fetch-mode': "same-origin",
            'sec-fetch-site': "same-origin",
            'x-requested-with': "XMLHttpRequest",
            'Referer': "https://enterprise.klaxoon.com/userspace/studio/manager/activities/",
            'Referrer-Policy': "strict-origin-when-cross-origin",
            'origin': `https://enterprise.klaxoon.com`,
            'referer': `https://enterprise.klaxoon.com/userspace/studio/manager/activities/`,
            'content-type': `multipart/form-data; boundary=BOUNDARY`,
        }
    };

    // const response = await fetch(uri, init)
    // const body = await response.text()


    const res = await axios.post(uri, payload, init)

    const body = res.data

    console.log(body)

    // const metadata = {
    //     objects: {
    //         Session: [
    //             {
    //                 id: 1,
    //                 path: `Session`,
    //                 label: `Test Session`,
    //                 updatedAt: new Date().getTime(),
    //                 createdBy: `Jean-Fran\u00e7ois Bilodeau`,
    //                 activityCount: 0
    //             }
    //         ]
    //     },
    //     type: `Schema`,
    //     exported_at: new Date().getTime(),
    //     // version: `1.11.0`,
    //     migrable_version: 2,
    //     extra: {
    //         klaxoon_id: `smartdock_smartunivers`
    //     },
    //     type_saas: `data`
    // }
    // // const metadata = `{"objects":{"Session":[{"id":12230,"path":"Session","label":"Klaxoon Session","updatedAt":1670868858,"createdBy":"Jean-Fran\u00e7ois Bilodeau","activityCount":0}]},"type":"schema","exported_at":1670868875,"version":"1.11.0","migrable_version":2,"extra":{"klaxoon_id":"smartdock_smartunivers"},"type_saas":"data"}`
    //
    // const session = {
    //     label: `Test Session Label`,
    //     has_func_klaxoon: true,
    //     checksum: "a379d0c50e008030c5a5003904689023",
    //     activities: [],
    //     presentations: [],
    //     klaxs: [
    //         {
    //             label: `First vote`,
    //             rank: 0,
    //             element_id: `a379d0c50e008030c5a5003904689023`,
    //             sub_type: `ucq`,
    //             choices: [
    //                 {
    //                     label: `Basic`,
    //                     element_id: `1`
    //                 },
    //                 {
    //                     label: `Standard`,
    //                     element_id: `2`
    //                 }
    //             ],
    //             _polymorphic_type: `KlaxPoll`
    //         },
    //     ],
    //     is_anonymous: false
    // }
    //
    // // const session = `{"label":"Klaxoon Session","has_func_klaxoon":true,"checksum":"a379d0c50e008030c5a5003904689023","activities":[],"presentations":[],"klaxs":[],"is_anonymous":false}`
    //
    // const zip = new AdmZip()
    //
    // zip.addFile(`metadata.json`, JSON.stringify(metadata))
    // zip.addFile(`Session/12230/data.json`, JSON.stringify(session))
    //
    // const buffer = await zip.toBufferPromise()
    //
    // context.res = {
    //     headers: {
    //         'content-disposition': `attachment; filename="Session.klx"`
    //     },
    //     body: buffer
    // }

    // const name = (req.query.name || (req.body && req.body.name));
    // const responseMessage = name
    //     ? "Hello, " + name + ". This HTTP triggered function executed successfully."
    //     : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";
    //
    // context.res = {
    //     // status: 200, /* Defaults to 200 */
    //     body: responseMessage
    // };
}