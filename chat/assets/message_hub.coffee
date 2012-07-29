class window.MessageHub
  constructor: (@address, @reconnectTimeout, @alertHelper) ->
    @eventListeners = {}

  init: ->
    @createSocket()

  createSocket: =>
    @timeoutID = setTimeout(@createSocket, @reconnectTimeout)
    console.log "Connecting to #{@address}"
    @socket = new WebSocket(@address)
    @socket.onmessage = @onMessage
    @socket.onclose = @onConnectionFailed
    @socket.onopen = @onConnectionOpened

  subscribe: (eventTypes, callback) ->
    eventTypes = [eventTypes] unless eventTypes instanceof Array
    for eventType in eventTypes
      @eventListeners[eventType] ?= []
      @eventListeners[eventType].push(callback)

  onMessage: (message) =>
    messageObject = JSON.parse(message.data)
    for callback in @eventListeners[messageObject.action] ? []
      callback(messageObject)

  sendJSON: (messageObject) => @socket.send(JSON.stringify(messageObject))

  switchChannel: (channel) =>
    @sendJSON
      action: "switch_channel"
      data:
        channel: channel

  sendChat: (message, channel) =>
    @sendJSON
      action: "publish_message"
      data:
        message: message
        channel: channel

  onConnectionFailed: =>
    clearTimeout(@timeoutID)
    @alertHelper.newAlert("alert-error", "Connection failed, reconnecting in #{@reconnectTimeout/1000} seconds")
    console.log "Connection failed, reconnecting in #{@reconnectTimeout/1000} seconds"
    setTimeout(@createSocket, @reconnectTimeout)

  onConnectionOpened: =>
    @alertHelper.delAlert()
    clearTimeout(@timeoutID)
    console.log "Connection successful"

  onConnectionTimedOut: =>
    @alertHelper.newAlert("alert-error", "Connection timed out")
    console.log "Connection timed out"
    @socket.close()


