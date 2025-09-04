export function formatMemberSince(dateString) {
    const date = new Date(dateString)
    const month = date.toLocaleDateString("default", { month: "short" })
    const year = date.getFullYear()
    return `${month} ${year}`
}

export function formatPublishDate(dateString) {
    const date = new Date(dateString)
    const month = date.toLocaleDateString("default", { month: "long" })
    const year = date.getFullYear()
    const day = date.getDate()
    return `${month} ${day}, ${year}`
}
