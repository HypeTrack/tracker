/** A deconstructed hostname. */
export type HTHost = {
    serviceName: string,
    clusterHash: string,
    podHash: string
}