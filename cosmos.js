import { CosmosClient } from '@azure/cosmos'

const client = new CosmosClient(process.env.JFTOOLS_COSMOS_DB_CONNECTION_STRING)

var database= null

async function getDatabase() {
  if (database === null) {
    const result = await client.databases.createIfNotExists({
      id: process.env.JFTOOLS_COSMOS_DB_DATABASE_NAME
    })

    database = result.database

    await database.containers.createIfNotExists({
      id: `settings`,
      partitionKey: `/username`,
    })

    await database.containers.createIfNotExists({
      id: `privateLinks`,
      partitionKey: `/username`,
    })

    await database.containers.createIfNotExists({
      id: `publicLinks`,
      partitionKey: `/courseCode`
    })
  }

  return database
}

async function getContainer(containerId) {
  const database = await getDatabase()

  const container = database.container(containerId)

  return container
}

async function getItem(containerId, itemId) {
  const container = await getContainer(containerId)

  const response = await container.item(itemId).read()

  const item = response.resource
  return item ?? {}
}

async function queryItem(containerId, query) {
  const container = await getContainer(containerId)

  const response = await container.items.query(query).fetchAll()

  const item = response.resources

  return item ?? {}
}

async function writeItem(containerId, item) {
  const container = await getContainer(containerId)

  await container.items.upsert(item)
}

async function deleteItem(containerId, partitionKey, itemId) {
  const container = await getContainer(containerId)

  await container.item(itemId, partitionKey).delete()
}

export async function getSettings (username) {
  return await getItem('settings', username)
}

export async function saveSettings (settings) {
  await writeItem('settings', settings)
}

export async function getPrivateLinks (username, courseCode) {
  let query = `SELECT * FROM c WHERE c.id = '${courseCode}' AND c.username = '${username}'`
  const result = await queryItem('privateLinks', query)

  let links = result[0] ?? {
    id: courseCode,
    username,
    links: [],
  }

  return links
}

export async function savePrivateLinks(links) {
  await writeItem('privateLinks', links)
}

