const splitText = (text, maxLength = 1000, overlap = 200) => {
    const chunks = [];
    let start = 0;

    // Normalize newlines
    const normalizedText = text.replace(/\r\n/g, '\n');

    while (start < normalizedText.length) {
        let end = start + maxLength;

        if (end >= normalizedText.length) {
            chunks.push(normalizedText.slice(start));
            break;
        }

        // Try to find a natural break point (newline or period)
        let breakPoint = normalizedText.lastIndexOf('\n', end);
        if (breakPoint === -1 || breakPoint < start) {
            breakPoint = normalizedText.lastIndexOf('. ', end);
        }

        if (breakPoint !== -1 && breakPoint > start) {
            end = breakPoint + 1; // Include the delimiter
        }

        chunks.push(normalizedText.slice(start, end));
        start = end - overlap; // Overlap for context continuity

        // Avoid infinite loop if overlap is too big or no progress
        if (start < 0) start = 0;
        if (start >= end) start = end;
    }

    return chunks;
};

module.exports = { splitText };
