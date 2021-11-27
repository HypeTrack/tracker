# HQ Trivia `x-hostname` Header Explained

When sending a request to an HQ Trivia server that uses the `hypeapi` codebase, it will append an `x-hostname` header to the response headers.
```
[reed@kuma ~]$ curl -i https://api.prod.hype.space
HTTP/2 200 
x-cloud-trace-context: 64e9c40d69bd8da1700693c2be630984/10746971833909774284;o=1
access-control-allow-origin: *
access-control-allow-headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, x-hq-test-key, x-hq-client
access-control-allow-methods: GET, PUT, POST, PATCH, DELETE, OPTIONS, HEAD
x-hostname: hypeapi-6649cb8c69-xlw4t
x-join-us: f3ada69ae0002019e7611b47b18b1397
content-type: application/json; charset=utf-8
content-length: 67
vary: Accept-Encoding
x-response-time: 0.001s
date: Sat, 27 Nov 2021 22:24:30 GMT
via: 1.1 google
alt-svc: clear

{
  "authentication": "/authenticate",
  "registration": "/users"
}
```

It follows this format:
```
x-hostname: [service_name]-[cluster_hash]-[pod_hash]
```

Therefore, if we take the `x-hostname` from the above example, it would deconstruct out to this:
```json
{
  "serviceName": "hypeapi",
  "clusterHash": "6649cb8c69",
  "podHash": "xlw4t"
}
```

This can get tricky when a `serviceName` has a dash in it, though. For example, https://ws.prod.hype.space's `serviceName` has a dash in it:
```
[reed@kuma ~]$ curl -i https://ws.prod.hype.space
HTTP/2 200 
x-cloud-trace-context: 23da1ad557e690c1a23e0fff858174e3/2044814023719949294;o=1
access-control-allow-origin: *
access-control-allow-headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, x-hq-test-key, x-hq-client
access-control-allow-methods: GET, PUT, POST, PATCH, DELETE, OPTIONS, HEAD
x-hostname: hypeapi-websocket-86f54b4ddb-pzblc
x-join-us: f3ada69ae0002019e7611b47b18b1397
content-type: application/json; charset=utf-8
content-length: 67
vary: Accept-Encoding
x-response-time: 0.000s
date: Sat, 27 Nov 2021 22:29:10 GMT
via: 1.1 google
alt-svc: clear

{
  "authentication": "/authenticate",
  "registration": "/users"
}
```

The way this is handled is simple. We pop the last two elements, then join the existing elements with dashes. Implementation in TypeScript:
```ts
type HTHost = {
    serviceName: string,
    clusterHash: string,
    podHash: string
}

const hostname = "hypeapi-websocket-86f54b4ddb-pzblc"

// Split the hostname
const splitHostname = hostname.split('-')

// Use Array.pop() to get the last elements.
// The ! operator is used here pretty dangerously - in the code, the array length is checked first.
const podHash = splitHostname.pop()!
const clusterHash = splitHostname.pop()!

const destructuredHostname: HTHost = {
    serviceName: splitHostname.join('-'),
    clusterHash,
    podHash
}
```

When we have this object, we only really want to check `clusterHash`. If this has changed, it's assumed that something has happened which has resulted in the cluster changing.