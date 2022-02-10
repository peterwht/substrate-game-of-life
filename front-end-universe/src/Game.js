import React, { useEffect, useState } from 'react'
import { Form, Grid } from 'semantic-ui-react'

import { useSubstrate } from './substrate-lib'
import { TxButton } from './substrate-lib/components'

export default function Game(props) {
  const { api, keyring } = useSubstrate()
  const { accountPair } = props

  const [universe, setUniverse] = useState({})

  const updateUniverse = () => {
    const asyncFetch = async () => {
      const entries = await api.query.templateModule.universes.entries()
      setUniverse(entries[0][1].toJSON())
    }

    asyncFetch()
  }

  function hexStringToArrayBuffer(hexString) {
    // remove the leading 0x
    hexString = hexString.replace(/^0x/, '')

    // ensure even number of characters
    if (hexString.length % 2 != 0) {
      console.log(
        'WARNING: expecting an even number of characters in the hexString'
      )
    }

    // check for some non-hex characters
    var bad = hexString.match(/[G-Z\s]/i)
    if (bad) {
      console.log('WARNING: found non-hex characters', bad)
    }

    // split the string into pairs of octets
    var pairs = hexString.match(/[\dA-F]{2}/gi)

    // convert the octets to integers
    var integers = pairs.map(function (s) {
      return parseInt(s, 16)
    })

    var array = new Uint8Array(integers)

    return array
  }

  const PrintUniverse = () => {
    if (!universe.cells) {
      return <div></div>
    }

    let cells = hexStringToArrayBuffer(universe.cells)

    const getIndex = (row, column) => {
      return row * universe.width + column
    }

    let grid = []
    for (let row = 0; row < universe.height; row++) {
      let currRow = []
      for (let col = 0; col < universe.width; col++) {
        let color = 'black'
        if (cells[getIndex(row, col)] === 1) {
          color = 'green'
          currRow.push(<span style={{ color, paddingRight: '4px' }}>x </span>)
        } else {
          color = 'black'
          currRow.push(<span style={{ color, paddingRight: '4px' }}>x </span>)
        }
      }
      grid.push(
        <>
          <div>{currRow}</div> {'\n'}
        </>
      )
    }
    return <div>{grid}</div>
  }

  //   useEffect(() => {
  //     const interval = setInterval(() => {
  //       updateUniverse()
  //     }, 500)

  //     return () => clearInterval(interval) // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
  //   }, [])

  //   useEffect(() => {
  //     tick()
  //   }, [universe])

  const getUniverse = async () => {
    const asyncFetch = async () => {
      const entries = await api.query.templateModule.universes.entries()
      setUniverse(entries[0][1].toJSON())
    }
    await asyncFetch()
  }

  const tick = async () => {
    const asyncFetch = async () => {
      const txHash = await api.tx.templateModule
        .tick(
          '0x0e11156ca32362db46247872dc4a9c2508111e35a4ff0c0b32942af2f0b5c779'
        )
        .signAndSend(props.accountPair, { nonce: -1 })
      console.log('tick' + txHash)
    }
    await asyncFetch()
  }

  const start = () => {
    setInterval(() => {
      const asyncFetch = async () => {
        await getUniverse()
        // await tick()
      }
      asyncFetch()
    }, 10)
  }

  // useEffect(() => {

  // }, [])

  return (
    <Grid.Column
      width={16}
      style={{ padding: '100px', backgroundColor: 'black' }}
    >
      <PrintUniverse style={{ padding: '100px', backgroundColor: 'black' }} />
      {/* {'\n'}
      {'\n'}
      {'\n'}
      {'\n'}
      {'\n'} */}
      <button onClick={getUniverse}>Get</button>
      <button onClick={tick}>Tick</button>
      <button onClick={start}>start</button>
    </Grid.Column>
  )
}
