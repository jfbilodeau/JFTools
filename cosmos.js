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
      id: "settings",
      partitionKey: "/username",
    })

    await database.containers.createIfNotExists({
      id: "privateLinks",
      partitionKey: "/username",
    })

    await database.containers.createIfNotExists({
      id: "publicLinks",
      partitionKey: "/courseId",
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

export async function getPrivateLinks (username) {
  const links = await getItem('privateLinks', username)

  if (links.id === undefined) {
    // Links are not initialized. Create empty links object.
    links.id = username
    links.links = []
  }

  return links
}

export async function savePrivateLinks(links) {
  await writeItem('privateLinks', links)
}

export async function addPrivateLink(username, label, url) {
  const links = await getPrivateLinks(username)

  const link = {
    label,
    url
  }

  links.links.push(link)

  const response = await writeItem('privateLinks', link)
}

export async function updatePrivateLink(username, index, label, url) {
  const links = await getPrivateLinks(username)

  links.links[index].label = label
  links.links[index].url = url

  await writeItem('privateLinks', links)
}

export async function deletePrivateLink(username, index) {
  const links = await getPrivateLinks(username)

  links.links.splice(index, 1)

  await writeItem('privateLinks', links)
}