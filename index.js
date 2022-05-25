const cors = require('cors')
const path = require('path')
const axios = require('axios')
const express = require('express')
const fs_promises = require('fs/promises')
const ratelimit = require('express-rate-limit')

/** config variable */
const IS_DEVELOPMENT = true
const GITHUB_USERNAME = 'bakunya'
const TIME_REVALIDATED_MS = 86400000
const CORS_WHITELIST = ['http://localhost:3000']
/** end config variable */

const app = express()
const limiter = ratelimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 60, // Limit each IP to 60 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})
const delegate = (whitelist, isDevelopment) => function (req, callback) {
    const origin = req.header('Origin')

    if(!isDevelopment) {
        if (whitelist.includes(origin)) {
            return callback(null, { origin: true })
        } else {
            return callback(new Error('Not allowed by CORS'), { origin: false })
        }
    } else {
        if (origin === undefined || whitelist.includes(origin)) {
            return callback(null, { origin: true })
        } else {
            return callback(new Error('Not allowed by CORS'), { origin: false })
        }
    }
}

async function getRepoFromGithubAPI() {
    try {
        const res = await axios.get(`https://api.github.com/users/${GITHUB_USERNAME}/repos`)
        const parse = res.data.map(({ id, name, full_name, html_url, description }) => ({ id, name, full_name, html_url, description }))
        return Promise.resolve({
            data: parse,
            last_saved: Date.now()
        })
    } catch(er) {
        return Promsie.reject(er)
    }
}

async function saveToLocalFile(data) {
    try {
        await fs_promises.writeFile(path.resolve('./repos.json'), JSON.stringify(data))
        return Promise.resolve(true)
    } catch(er) {
        return Promise.reject(er)
    }
}

async function getFromLocalFile() {
    try {
        let response = await fs_promises.readFile(path.resolve('./repos.json'))
        response = JSON.parse(response.toString())
        return Promise.resolve(response)
    } catch(er) {
        return Promise.resolve(false)
    }
}

function shouldRevalidate(currentScrape) {
    const lastScrape = new Date(currentScrape)
    const timeToScrapeAgain = new Date(lastScrape.getTime() + TIME_REVALIDATED_MS) // 1 day
    const dateNow = new Date(Date.now())
    return dateNow.getTime() > timeToScrapeAgain.getTime()
}

async function bootstrappingAllScrapeProcess() {
    try {
        const data = await getRepoFromGithubAPI()
        await saveToLocalFile(data)
        return Promise.resolve(data)
    } catch(er) {
        return Promise.reject(er)
    }
}


async function main() {
    app.use(limiter)
    app.use(cors(delegate(CORS_WHITELIST, IS_DEVELOPMENT)))

    app.get('/', async (req, res) => {
        try {
            const dataFromLocal = await getFromLocalFile()

            if(!dataFromLocal) {
                console.log('data from local not found, scrap started')
                const responseAPI = await bootstrappingAllScrapeProcess()
                return res.status(200).json(responseAPI.data)
            }

            if(shouldRevalidate(dataFromLocal.last_saved)) {
                console.log('data from local must be revalidate, scrap started')
                bootstrappingAllScrapeProcess()
                    .catch(er => console.log(er))
                    .finally(() => console.log('data from local must be revalidate, scrap ended'))
            }
            return res.status(200).json(dataFromLocal.data)

        } catch(er) {
            return res.status(500).json(er.message)
        }
    })

    app.listen(process.env?.PORT ?? 8000, () => console.log(`server running on port ${process.env?.PORT ?? 8000}`))
}

main()