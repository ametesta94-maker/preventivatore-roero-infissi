import { Text, View, StyleSheet } from '@react-pdf/renderer'
import React from 'react'

const htmlStyles = StyleSheet.create({
    paragraph: { fontSize: 8, lineHeight: 1.5, marginBottom: 4, color: '#333' },
    bold: { fontWeight: 'bold' },
    italic: { fontStyle: 'italic' },
    underline: { textDecoration: 'underline' },
    listItem: { fontSize: 8, lineHeight: 1.5, marginBottom: 2, paddingLeft: 12, color: '#333' },
    listRow: { flexDirection: 'row', marginBottom: 2 },
})

/**
 * Simple HTML to react-pdf elements parser.
 * Supports: <p>, <strong>/<b>, <em>/<i>, <u>, <ul>/<ol>/<li>, <br>, plain text.
 */
export function renderHtmlToPdf(html: string): React.ReactNode[] {
    if (!html) return []

    const elements: React.ReactNode[] = []
    const blocks = html.split(/<\/(?:p|li|div)>/gi)

    let listCounter = 0
    let inOrderedList = false

    for (let i = 0; i < blocks.length; i++) {
        let block = blocks[i].trim()
        if (!block) continue

        const isListItem = /<li[^>]*>/i.test(block)
        if (/<ol[^>]*>/i.test(block)) { inOrderedList = true; listCounter = 0 }
        if (/<ul[^>]*>/i.test(block)) { inOrderedList = false }
        if (/<\/ol>/i.test(block)) { inOrderedList = false }
        if (/<\/ul>/i.test(block)) { inOrderedList = false }

        block = block.replace(/<(?:p|li|div|ul|ol)[^>]*>/gi, '')
        block = block.replace(/<br\s*\/?>/gi, '\n')

        if (!block.trim()) continue

        if (isListItem) {
            listCounter++
            const bullet = inOrderedList ? `${listCounter}. ` : '\u2022 '
            elements.push(
                <View key={`block-${i}`} style={htmlStyles.listRow}>
                    <Text style={htmlStyles.listItem}>
                        {bullet}{renderInlineHtml(block)}
                    </Text>
                </View>
            )
        } else {
            elements.push(
                <Text key={`block-${i}`} style={htmlStyles.paragraph}>
                    {renderInlineHtml(block)}
                </Text>
            )
        }
    }

    return elements
}

function renderInlineHtml(html: string): React.ReactNode[] {
    const nodes: React.ReactNode[] = []
    const tempHtml = html
    const allMatches: Array<{ start: number; end: number; tag: string; content: string }> = []

    const inlineRegex = /<(strong|b|em|i|u)>(.*?)<\/\1>/gis
    let match
    while ((match = inlineRegex.exec(tempHtml)) !== null) {
        allMatches.push({
            start: match.index,
            end: match.index + match[0].length,
            tag: match[1].toLowerCase(),
            content: match[2],
        })
    }

    if (allMatches.length === 0) {
        return [stripTags(html)]
    }

    let lastIndex = 0
    for (const m of allMatches) {
        if (m.start > lastIndex) {
            const textBefore = stripTags(tempHtml.slice(lastIndex, m.start))
            if (textBefore) nodes.push(textBefore)
        }

        const style = m.tag === 'strong' || m.tag === 'b'
            ? htmlStyles.bold
            : m.tag === 'em' || m.tag === 'i'
                ? htmlStyles.italic
                : htmlStyles.underline

        nodes.push(
            <Text key={`inline-${m.start}`} style={style}>
                {stripTags(m.content)}
            </Text>
        )
        lastIndex = m.end
    }

    if (lastIndex < tempHtml.length) {
        const textAfter = stripTags(tempHtml.slice(lastIndex))
        if (textAfter) nodes.push(textAfter)
    }

    return nodes
}

function stripTags(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
}

/**
 * Replace template variables in HTML string.
 */
export function replaceVariables(html: string, variables: Record<string, string>): string {
    let result = html
    for (const [key, value] of Object.entries(variables)) {
        result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '\u2014')
    }
    result = result.replace(/\{\{[^}]+\}\}/g, '________')
    return result
}
