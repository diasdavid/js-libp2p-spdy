/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const pair = require('pull-pair/duplex')
const pull = require('pull-stream')

const spdy = require('../src')

describe('spdy-generic', () => {
  let listenerSocket
  let dialerSocket

  let listener
  let dialer

  before(() => {
    const p = pair()
    dialerSocket = p[0]
    listenerSocket = p[1]
  })

  it('attach to a duplex stream, as listener', () => {
    listener = spdy.listen(listenerSocket)
    expect(listener).to.exist
  })

  it('attach to a duplex stream, as dialer', () => {
    dialer = spdy.dial(dialerSocket)
    expect(dialer).to.exist
  })

  it('open a multiplex stream from client', (done) => {
    listener.once('stream', (conn) => {
      pull(conn, conn)
    })

    const conn = dialer.newStream()
    pull(
      pull.values(['hello']),
      conn,
      pull.collect((err, res) => {
        expect(err).to.not.exist
        expect(res).to.be.eql([Buffer('hello')])
        done()
      })
    )
  })

  it('open a multiplex stream from listener', (done) => {
    dialer.once('stream', (conn) => {
      pull(conn, conn)
    })

    const conn = listener.newStream()
    pull(
      pull.values(['hello']),
      conn,
      pull.collect((err, res) => {
        expect(err).to.not.exist
        expect(res).to.be.eql([Buffer('hello')])
        done()
      })
    )
  })
})
