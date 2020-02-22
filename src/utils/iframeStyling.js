export function loadIFramePromise(iFrame) {
    return new Promise((resolve, reject) => {
        iFrame.onload = () => resolve(true)
        iFrame.onerror = reject
    })
}

export function getIFrameCustomCSS(iFrame) {
    const stylesArray = Array.from(iFrame.contentDocument.styleSheets) // Get the stylesheets of the embedded iframe
        .filter(sheet => sheet.href === null || sheet.href.startsWith(iFrame.contentWindow.origin)) // Get only local stylesheets
        .reduce((acc, sheet) => ( // shoutout to stackoverflow for incredibly hard-to-understand reduce() functions!
            acc = [...acc,
                    ...Array.from(sheet.cssRules).reduce((def, rule) => (
                        def = (rule.selectorText === 'body' || rule.selectorText === ':root' || rule.selectorText === '*') // Grab global rulesets
                            ? [
                                ...def,
                                ...Array.from(rule.style).filter(name => name.startsWith('--')) // Grab css variables
                                    .map(styleProp => (
                                        [
                                            styleProp, 
                                            (rule.selectorText === 'body')
                                                ? iFrame.contentWindow.getComputedStyle(iFrame.contentDocument.body).getPropertyValue(styleProp)
                                                : iFrame.contentWindow.getComputedStyle(iFrame.contentDocument.documentElement).getPropertyValue(styleProp)
                                        ]
                                    ))
                            ] : def
                    ), [])
                ]
    ), [])

    return stylesArray
}