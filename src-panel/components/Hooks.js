import React, { useEffect, useMemo, useState } from "react"

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