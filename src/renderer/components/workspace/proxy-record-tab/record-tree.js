const isNodeExist = (parent, label) => {
  const children = parent.children
  const found = children.find(child => {
    return child.label === label
  })

  return found
}

const insertHost = (root, record) => {
  const host = `${record.protocol}://${record.host}`
  const found = isNodeExist(root, host)
  if (found) {
    return found
  }

  const node = {
    label: host,
    key: host,
    children: []
  }
  root.children.push(node)

  return node
}

export function insertTree (root, record) {
  let currentNode = insertHost(root, record)
  const path = record.path
  if (path === '/' || path === '') {
    const children = currentNode.children
    children.push({
      id: record.id,
      key: `${record.id}$${path}`,
      label: '/'
    })
  } else {
    const subPathArr = path.split('/')
    for (let i = 0; i < subPathArr.length; i++) {
      const subPath = subPathArr[i]
      if (subPath === '') {
        continue
      }
      const children = currentNode.children
      if ((subPathArr.length - 1) === i) {
        children.push({
          id: record.id,
          key: `${record.id}$${subPath}`,
          label: subPath
        })
      } else {
        if (!isNodeExist(currentNode, subPath)) {
          currentNode = {
            label: subPath,
            key: `${record.id}$${subPath}`,
            children: []
          }
          children.push(currentNode)
        }
      }
    }
  }
}
