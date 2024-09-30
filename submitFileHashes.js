async function submitFileHashes(paths, uris) {
    uris = uris || []
    const hashObjs = await getFileHashes(paths)
    const hashes = hashObjs.map(hashObj => hashObj.hash)
    // Validate all Gateway URIs provided
    validateUrisArg(uris)
  
    const proofHandles = await submit.submitHashes(hashes, uris)
    return proofHandles.map(proofHandle => {
      proofHandle.path = hashObjs.find(hashObj => hashObj.hash === proofHandle.hash).path
      return proofHandle
    })
  }
  