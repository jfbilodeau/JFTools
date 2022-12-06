export function generateKnowledgeCheckDocumentToConsole(studyGuide) {
    const content = generateKnowledgeCheckDocumentToString(studyGuide)

    console.log(content)
}


export function generateKnowledgeCheckDocumentToString(studyGuide) {
    var content = ``

    for (const path of studyGuide) {
        for (const module of path.modules) {
            content += `Module: ${module.title} (${module.url})\n`
            for (const unit of module.units) {
                content += `   Unit: ${unit.title} (${unit.url})\n`

                if (unit.questions.length) {
                    for (const question of unit.questions) {
                        content += `   - ${question.question}\n`

                        let index = 0;
                        for (const option of question.options) {
                            const check = index === question.answer ? `[*]` : `[ ]`
                            const message = `     ${check} ${option}`

                            content += `${message}\n`

                            index++
                        }
                        content += `  ${question.answerText}\n\n`
                    }
                } else {
                    content += `      (no knowledge check questions)\n\n`
                }
            }
        }
    }
    return content;
}

export function generateKnowledgeCheckDocumentToFile(filename, studyGuide) {
    const content = generateKnowledgeCheckDocumentToString(studyGuide);

    fs.writeFileSync(filename, content)
}
