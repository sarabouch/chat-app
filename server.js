// add the file system module so we can work with files
const fs = require("fs")
// 1.import and start express
const app = require("express")();
// 2.cretae a http server using express
const http = require("http").Server(app)
// to enable the real time connection we will enhance our http server with socket.io
const io = require("socket.io")(http)

// Enable Cross Origing Rescource sharing
// p.s. this code is copied from CROS on ExpressJS
app.use((req, res, next) => {
    // Set the headers of our response to allow communication with our server from a different domain or port
    res.header("Access-Control-Allow-Origin", "*")
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    )
    // Continue with the steps after this
    next()
})

// define our index route
app.get("/", (req, res) => {
    // send the user a response
    res.send("hello world!")
})

// if the client goes to //localhost:9999/chat
app.get("/chat", (req, res) => {
    //we go to the file chat.json and read its content
    fs.readFile("chat.json", (err, data) => {
        // then we parse the data to be JS objects
        const messages = JSON.parse(data)
        // we responde with our found data
        res.json(messages)
    })
})

// listen to a connection event on the server side (like event listners)
io.on("connection", socket => {
    console.log("USer has connected");

    // listen for a disconnect
    socket.on("disconnect", () => {
        console.log("user has disconnected")
    })

    // listen for a "chat message" event
    socket.on("chat message", message => {
        console.log("USER :", message)

        //send the "chat message" to all the other users
        io.emit("chat message", message)
        // save the messages in a JSON file with readFile
        fs.readFile("chat.json", (err, data) => {
            //and then parse it into JSON again because its gonna be a buffer code(turn it to json again)
            const messages = JSON.parse(data)
            // add the message to the json
            messages.push(message)
            // turn json into a string
            const string = JSON.stringify(messages)
            // write the new data to the file after being stringified
            fs.writeFile("chat.json", string, err => {
                if (err) throw err
            })
        })
    })

    // Listen to a user entering his username
    socket.on("chat username", username => {
        ACTIVE_USERS.push(username)

        // and now we send the list of active users to all clients
        io.emit("chat username", ACTIVE_USERS)
    })
})

// create the arry of the active users
const ACTIVE_USERS = []

// define the port 9999 to be open
http.listen(9999, () => {
    console.log("Server is running on port 9999!")
})