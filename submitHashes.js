export async function submitHashes(hashes, uris) {
    uris = uris || []
    let gatewayUris
  
    // Validate args before doing anything else
    validateHashesArg(hashes, h => isHex(h))
    validateUrisArg(uris)
  
    if (isEmpty(uris)) {
      try {
        let coreIps = await getCores(3)
        let allCoreIps = await getCorePeerListAsync(coreIps)
        let gateways = await getGatewayListAsync(allCoreIps)
        gatewayUris = gateways
          .filter(function(gatewayIP) {
            if (gatewayIP === '3.92.247.27') {
              //filter proof whitelist IP
              return false
            }
            return true
          })
          .map(function(gatewayIP) {
            return 'http://' + gatewayIP
          })
      } catch (error) {
        console.log(`getting GatewayIps from network failed, falling back to defaults: ${error}`)
        gatewayUris = ['http://3.133.135.157', 'http://18.191.50.129', 'http://18.224.185.143']
      }
    } else {
      // eliminate duplicate URIs
      uris = uniq(uris)
  
      // non-empty, check that *all* are valid or throw
      let badURIs = reject(uris, function(h) {
        return isValidURI(h)
      })
      if (!isEmpty(badURIs)) throw new Error(`uris arg contains invalid URIs : ${badURIs.join(', ')}`)
      // all provided URIs were valid
      gatewayUris = uris
    }
  
    try {
      // Setup an options Object for each Gateway we'll submit hashes to.
      // Each Gateway will then be sent the full Array of hashes.
      let gatewaysWithPostOpts = map(gatewayUris, gatewayUri => {
        let headers = {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
  
        let postOptions = {
          method: 'POST',
          uri: gatewayUri + '/hashes',
          body: {
            hashes: hashes
          },
          headers,
          timeout: 10000
        }
        return postOptions
      })
  
      // All requests succeed in parallel or all fail.
      const fetchResults = await fetchEndpoints(gatewaysWithPostOpts)
  
      let submitResponses = fetchResults
        // Filter out and log any failed requests
        .filter(result => {
          if (result.error) {
            console.log(`Client error submiting hash to ${result.uri} : ${result.error} : Skipping`)
            return false
          }
          return true
        })
        // Gateways cannot be guaranteed to know what IP address they are reachable
        // at, so we need to amend each result with the Gateway URI it was submitted
        // to so that proofs may later be retrieved from the appropriate Gateway(s).
        .map(result => {
          console.log(JSON.stringify(result))
          result.response.meta.submitted_to = result.uri
          return result.response
        })
  
      // Map the API response to a form easily consumable by getProofs
      let proofHandles = mapSubmitHashesRespToProofHandles(submitResponses)
  
      return proofHandles
    } catch (err) {
      console.error(err.message)
      throw err
    }
  }
  