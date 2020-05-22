

import dotenv from 'dotenv'
import faunadb, { query as q } from 'faunadb'
const OpenTok = require("opentok");

dotenv.config()
const client = new faunadb.Client({ secret: process.env.FAUNA_SECRET })
const OT = new OpenTok(process.env.VONAGE_KEY, process.env.VONAGE_SECRET);

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
}

exports.handler = async (event, context) => {
    try {
        if (event.httpMethod == 'OPTIONS') {
            return {
                headers: { ...headers, 'Allow': 'POST' },
                statusCode: 204
            }
        }
        const { name } = JSON.parse(event.body)
        const document = await createSession(name)
        return {
            headers,
            statusCode: 200,
            body: JSON.stringify(document)
        }
    } catch (e) {
        console.error('Error', e)
        return { headers, statusCode: 500, body: 'Error: ' + e }
    }
}

const createSession = (name) => {
    return new Promise((resolve, reject) => {
        OT.createSession(async (error, session) => {
            try {
                if (error) { throw error }
                // Send document to FaunaDB
                const document = await client.query(
                    q.Create(
                        q.Collection('sessions'),
                        { data: { name, id: session.sessionId } }
                    )
                )

                resolve(document)
            } catch (e) {
                reject(e)
            }
        })
    })
}
