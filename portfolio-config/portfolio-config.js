#!/usr/bin/env node
const fs = require('fs')
const dateOverride = new Date('2020-06-05')

function getConfig() {
    const now = dateOverride || new Date()
    const month = (now.getMonth()+1).toString().padStart(2,'0')
    const day = now.getDate().toString().padStart(2,'0')

    return {
        "name": "Simple Page Concepting Tool",
        "lastUpdated": `${now.getFullYear()}-${month}-${day}`,
        "lastUpdatedMMDD": month+"/"+day,
        "isLocal": true,
        "isPublic": true,
        "path": "/concepting-tool",
        "themeColor": "hsl(220deg, 70%, 70%)",
        "tools": "Svelte.js",
        "image": '/img/concepting-tool.jpg'
    }
}

fs.writeFile('portfolio-config.json', JSON.stringify(getConfig(),null,2), err => {
    if (err) console.error(err)
    else console.log('Portfolio file written successfully')
})