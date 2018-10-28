import React, { Component } from 'react';
import io from "socket.io-client";
import './App.css';

class App extends Component {
  state = { messages: [], username: null, usernames: [] }
  // make the socket available to our application component
  socket = io("http://localhost:9999")

  componentDidMount() {
    fetch("http://localhost:9999/chat")
      .then(res => res.json())
      .then(json => this.setState({ messages: json }))

    this.socket.on("chat message", message => {
      console.log("message from server", message);
      //take the previous msgs from the state and add the new one to the end of the array
      this.setState({ messages: [...this.state.messages, message] })
    })

    // Listen for active users from the server && put the active users into the list
    this.socket.on("chat username", usernames => {
      this.setState({ usernames })
    })
  }

  // the function for sending username to the server
  chooseUsername = (e) => {
    // prevent page from reloading
    e.preventDefault()
    // preventing from sending nothing
    if (this.refs.usernameinput.value === "") return
    // get the text from the input
    const username = this.refs.usernameinput.value
    console.log(username)
    // send the chat username
    this.socket.emit("chat username", {
      username,
      timestamp: Date.now()
    })
    // set the username to the state
    this.setState({ username })
  }

  // the function for sending msgs to the server
  sendMessage = (e) => {
    // prevent page from reloading
    e.preventDefault()
    // preventing from sending nothing
    if (this.refs.chatinput.value === "") return;
    // get the text from the input
    const message = this.refs.chatinput.value
    console.log(message)
    // send the chat message
    this.socket.emit("chat message", {
      content: message,
      timestamp: Date.now(),
      username: this.state.username // we set the username to the value that was taken from the state
    })
    // reset the chatinput after message
    this.refs.chatinput.value = "";
  }


  render() {
    return (
      <div className="App">
        {/* here we check if we have a user, in case of no so give the regestration form back
      and in case of yes display the data  */}
        {this.state.username === null ? (
          <form onSubmit={this.chooseUsername} ref="username">
            <label>Choose username</label>
            <input type="text" ref="usernameinput" />
          </form>
        ) : (
            <div>
              <ul className="onlineUsersList" >
                {this.state.usernames.length !== 0 ? this.state.usernames.map((user, i) =>
                  <li key={i} > {user.username} </li>)
                  : "no active users"}
              </ul>
              {/* display the username */}
              <p>logged in as {this.state.username} </p>
              <ul>
                {this.state.messages.map((message, i) => (
                  <li key={i}>{message.username}, {new Date(message.timestamp).toISOString()}: {message.content} </li>
                ))}
              </ul>
              <form onSubmit={this.sendMessage} ref="chatform" action="">
                <input ref="chatinput" type="text" />
              </form>
            </div>
          )}
      </div>
    );
  }
}

export default App;