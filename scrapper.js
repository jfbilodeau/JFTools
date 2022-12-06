import fetch from "node-fetch";
import {parse} from "node-html-parser";

export async function getStudyGuide(courseId, locale) {
    console.log(`Fetching Learning Path for ${courseId}`)

    const pathUrl = `https://learn.microsoft.com/api/lists/studyguide/exam/exam.${courseId}?locale=${locale}`

    const pathResponse = await fetch(pathUrl, {})

    const studyGuide = await pathResponse.json()

    const paths = []

    for (const item of studyGuide.items) {
        const path = {
            id: item.id,
            title: item.data.title,
            childUids: item.data.childUids,
            questions: []
        }

        path.modules = await getModules(path, locale)

        paths.push(path)
    }

    return paths
}

export async function getModules(path, locale) {
    console.log(`Fetchings modules for ${path.title}`)

    const modulePath = `https://learn.microsoft.com/api/hierarchy/paths/${path.id}?locale=${locale}`

    const moduleResponse = await fetch(modulePath, {})

    const json = await moduleResponse.json()

    const modules = []

    for (const moduleJson of json.modules) {
        console.log(`Fetching module ${moduleJson.uid}`)

        const module = {
            id: moduleJson.uid,
            title: moduleJson.title,
            path: moduleJson.url,
            url: `https://learn.microsoft.com/${locale}/${moduleJson.url}`,
            units: []
        }

        for (const unitJson of moduleJson.units) {
            console.log(`Fetching unit ${unitJson.uid}`)
            const unit = {
                id: unitJson.uid,
                title: unitJson.title,
                path: unitJson.url,
                url: `https://learn.microsoft.com/${locale}/${unitJson.url}`,
            }

            unit.questions = await getKnowledgeCheckQuestionsForUnit(unit, locale)

            module.units.push(unit)
        }

        modules.push(module)
    }

    return modules
}

async function getKnowledgeCheckQuestionsForUnit(unit, locale) {
    const questionsResponse = await fetch(unit.url)
    const body = await questionsResponse.text()

    const root = parse(body)

    const questionNodes = root.querySelectorAll(`div[role="listitem"]`)

    const questions = []

    let questionIndex = 1;
    for (const questionNode of questionNodes) {
        const questionText = questionNode.querySelector(`#quiz-question-${questionIndex} p`).text.trim()
        questionIndex++

        console.log(`Found question '${questionText}'`)

        const question = {
            question: questionText,
            options: []
        }

        const answers = questionNode.querySelectorAll(`div[class="margin-inline-sm"]`)

        for (const answer of answers) {
            const answerText = answer.text.trim();

            console.log(` - ${answerText}`)

            question.options.push(answerText)
        }

        questions.push(question)
    }

    const quizAnswers = []
    for (const index in questions) {
        quizAnswers.push({
            id: `${Number.parseInt(index)}`,
            answers: ["0"],
        })
    }

    const answerBody = JSON.stringify(quizAnswers);
    const kcApiUrl = `https://learn.microsoft.com/api/progress/units/${unit.id}/?locale=${locale}`
    const answersResponse = await fetch(kcApiUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: answerBody
    })

    const answers = await answersResponse.json()

    for (const index in questions) {
        const question = questions[index]

        const answer = answers.details[index].choices.find(a => a.isCorrect)

        question.answer = answer.id
        question.answerText = parse(answer.explanation).text.trim()

        console.log(`   Answer: [${question.answer}] ${question.answerText}`)
    }

    return questions
}

export async function getModulesViaStudyGuide(courseId, locale) {
    const outlineUrl = `https://learn.microsoft.com/api/lists/studyguide/course/course.${courseId}`

    console.log(`Fetch outlines from ${outlineUrl}`)

    const outlineResponse = await fetch(outlineUrl);
    const outline = await outlineResponse.json();

    console.log(`Cataloging Knowledge Checks`)

    const modules = []

    for (const item of outline.items) {
        const module = {
            id: item.id,
            title: item.data.title,
            questionUrl: item.data.url,
            kc: [],
            questions: []
        }

        for (const index in item.data.childUids) {
            const childUid = item.data.childUids[index]

            if (childUid.endsWith(`.knowledge-check`)) {
                const kcModuleId = childUid
                let childIndex = Number.parseInt(index) + 1;

                module.kc.push(kcModuleId)

                const questionUrl = `https://learn.microsoft.com/${locale}${module.questionUrl}${childIndex}-knowledge-check`
                const questionsResponse = await fetch(questionUrl)
                const body = await questionsResponse.text()

                const root = parse(body)

                const questionNodes = root.querySelectorAll(`div[role="listitem"]`)

                let questionIndex = 1;
                for (const questionNode of questionNodes) {
                    const questionText = questionNode.querySelector(`#quiz-question-${questionIndex} p`).text.trim()
                    questionIndex++

                    const question = {
                        question: questionText,
                        options: []
                    }

                    const answers = questionNode.querySelectorAll(`div[class="margin-inline-sm"]`)

                    for (const answer of answers) {
                        question.options.push(answer.text.trim())
                    }

                    module.questions.push(question)
                }

                const quizAnswers = []
                for (const index in module.questions) {
                    quizAnswers.push({
                        id: `${Number.parseInt(index)}`,
                        answers: ["0"],
                    })
                }

                const answerBody = JSON.stringify(quizAnswers);
                const kcApiUrl = `https://learn.microsoft.com/api/progress/units/${kcModuleId}/?locale=${locale}`
                const answersResponse = await fetch(kcApiUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: answerBody
                })

                const answers = await answersResponse.json()

                for (const index in module.questions) {
                    const question = module.questions[index]

                    const answer = answers.details[index].choices.find(a => a.isCorrect)

                    question.answer = answer.id
                    question.answerText = parse(answer.explanation).text.trim()
                }
            }
        }

        modules.push(module)
    }

    return modules
}

export async function getModulesViaHierarchy(courseId, locale) {
    const outlineUrl = `https://learn.microsoft.com/api/lists/studyguide/course/course.${courseId}`

    console.log(`Fetch outlines from ${outlineUrl}`)

    const outlineResponse = await fetch(outlineUrl);
    const outline = await outlineResponse.json();

    console.log(`Cataloging Knowledge Checks`)

    const modules = []

    for (const item of outline.items) {
        const module = {
            id: item.id,
            title: item.data.title,
            path: item.data.url,
            url: `https://learn.microsoft.com/${locale}${module.path}${childIndex}-knowledge-check`,
            kc: [],
            questions: []
        }

        for (const index in item.data.childUids) {
            const childUid = item.data.childUids[index]

            if (childUid.endsWith(`.knowledge-check`)) {
                const kcModuleId = childUid
                let childIndex = Number.parseInt(index) + 1;

                module.kc.push(kcModuleId)

                const questionsResponse = await fetch(question.url, {})
                const body = await questionsResponse.text()

                const root = parse(body)

                const questionNodes = root.querySelectorAll(`div[role="listitem"]`)

                let questionIndex = 1;
                for (const questionNode of questionNodes) {
                    const questionText = questionNode.querySelector(`#quiz-question-${questionIndex} p`).text.trim()
                    questionIndex++

                    const question = {
                        question: questionText,
                        options: []
                    }

                    const answers = questionNode.querySelectorAll(`div[class="margin-inline-sm"]`)

                    for (const answer of answers) {
                        question.options.push(answer.text.trim())
                    }

                    module.questions.push(question)
                }

                const quizAnswers = []
                for (const index in module.questions) {
                    quizAnswers.push({
                        id: `${Number.parseInt(index)}`,
                        answers: ["0"],
                    })
                }

                const answerBody = JSON.stringify(quizAnswers);
                const kcApiUrl = `https://learn.microsoft.com/api/progress/units/${kcModuleId}/?locale=${locale}`
                const answersResponse = await fetch(kcApiUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: answerBody
                })

                const answers = await answersResponse.json()

                for (const index in module.questions) {
                    const question = module.questions[index]

                    const answer = answers.details[index].choices.find(a => a.isCorrect)

                    question.answer = answer.id
                    question.answerText = parse(answer.explanation).text.trim()
                }
            }
        }

        modules.push(module)
    }

    return modules
}


