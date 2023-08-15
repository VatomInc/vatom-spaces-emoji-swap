import React, { useEffect, useMemo, useState } from "react"
import { StateBridge } from "../../src/StateBridge"

/** 
 * Use an asynchronous result of an operation.
 *
 * @param {function} asyncFn The async function to call.
 * @param {any[]} deps The dependencies to watch for changes.
 * @returns {[ result : any, error : Error, retry : function ]} The result of the async function. First value is the result, second is any error, third is a retry function.
 */
export const useAsyncMemo = (asyncFn, deps) => {

    // State
    let [ result, setResult ] = useState()
    let [ error, setError ] = useState()
    let [ retryCounter, setRetryCounter ] = useState(0)

    // Called to retry
    const retry = () => {
        setResult(null)
        setError(null)
        setRetryCounter(c => c + 1)
    }

    // Create and run promise
    let promise = useMemo(() => Promise.resolve().then(asyncFn), [ ...deps, retryCounter ])

    // Handle state
    useEffect(() => {

        // Monitor promise
        promise.then(result => {
            setResult(result)
            setError(null)
        }).catch(err => {
            console.warn(err)
            setResult(null)
            setError(err)
        })

    }, [ promise ])

    // Done
    return [ result, error, retry ]

}

/**
 * Hook to get the current app state. Using this hook has the benefit of re-rendering when the state changes.
 * 
 * @returns {StateBridge} The current app state.
 */
export const useStateBridge = () => {

    // State
    let [ nonce, setNonce ] = useState(0)

    // Listen for changes
    useEffect(() => {

        // Create listener
        const listener = () => setNonce(n => n + 1)

        // Add listener
        StateBridge.shared.addEventListener("updated", listener)

        // Remove listener afterwards
        return () => StateBridge.shared.removeEventListener("updated", listener)

    }, [])

    // Done
    return StateBridge.shared

}