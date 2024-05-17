const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const bcrypt = require('bcrypt');
const cron = require('cron');
const con = require('./config/db');
const axios = require('axios');

const app = express();

app.use(cors());
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files from the current directory


// Configure session middleware
app.use(session({
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, //1 day in millisec
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
   // config MemoryStore here
    store: new MemoryStore({
        checkPeriod: 24 * 60 * 60 * 1000 // prune expired entries every 24h
    })
}));

//check connection
con.connect((err) => {
   if (err) {
       console.log('Error connecting to mysql:', err);
       return;
   }
   console.log('The database connection was successful');
});

//hash the password
app.get('/password/:pass', function(req,res){
    const raw = req.params.pass;
    bcrypt.hash(raw, 10, function(err, hash){
        if(err)
        {
            res.status(500).send('Server Error');
        }
        else
        {
            console.log(hash.length);
            res.send(hash);
        }
    });
 });

// =========== LOGIN AND REGISTER API ===========
// register page
 app.get('/regist', (_req, res) => {
    res.sendFile(path.join(__dirname, '/views/regist.html'));
 });

// register, create an account
app.post('/create', async function(req,res)
{
  //get name, email, username, password
  const username = req.body.Username;
  const name = req.body.Name;
  const email = req.body.Email;
  const password = req.body.Password;
  try
  {
      //validate the input
      if(!username || !name || !email || !password)
      {
          res.status(400).send('Please fill all the fields!');
          return;
      }
      //hash the password
      const hashpassword = await bcrypt.hash(password,10);
      // insert the new users into users table RoleID = 1 coz it has to be students
      const sql1 = "INSERT INTO users(Username, Name, Email, Password, RoleID) VALUES(?,?,?,?,1);";
      con.query(sql1, [username, name, email, hashpassword], function(err, result){
          if(err){
              res.status(500).send('Server Error');
          }
          else{
              res.status(201).send('/');
          }
      });
  }
  catch{
      res.status(500).send('Server Error');
  }
});

// login into the website
 app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE Username = ?';
    con.query(query, [username], async (err, results) => {
        if (err) {
            console.log('Error while querying the database:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        const userData = results[0];
        const hashedPassword = userData.Password;
        // Compare hashed password with provided password
        const passwordMatch = await bcrypt.compare(password, hashedPassword);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        // Set userID in session
        req.session.userID = userData.UserID;
        req.session.username = userData.Username;
        req.session.roleID = userData.RoleID;
        console.log('UserID stored in session:', req.session.userID);
        console.log('Username in session:', req.session.username);
        console.log('RoleID in session:', req.session.roleID);
        res.status(200).json(userData);
    });
 });

//-----------Logout-----------*****
 app.get("/logout", function (req, res) {
    //clear session variable
    req.session.destroy(function (err) {
        if (err) {
            console.error(err);
            res.status(500).send("Cannot clear session");
        }
        else {
            console.log('logout');
            res.redirect("/");
        }
    });
});


app.get('/historytable', (req, res) => {
    const userID = req.session.userID; // Retrieve user ID from session
    const roleID = req.session.roleID; // Retrieve role ID from session

    let query;
    if (roleID === 1) {
        // If the user is a student (RoleID 1), retrieve their own history
        query = 'SELECT history.*, rooms.RoomNumber, approver.Name AS ApproverName FROM history JOIN rooms ON history.RoomID = rooms.RoomID JOIN users AS approver ON history.ApproverID = approver.UserID WHERE history.UserID = ?';
    } else if (roleID === 2) {
        // If the user is an approver (RoleID 2), retrieve history of requests they have approved
        query = 'SELECT history.*, rooms.RoomNumber, users.Name AS ApproverName, requester.Name AS UserName FROM history JOIN rooms ON history.RoomID = rooms.RoomID JOIN users ON history.ApproverID = users.UserID JOIN users AS requester ON history.UserID = requester.UserID WHERE history.ApproverID = ?';
    } else if (roleID === 3) {
        // If the user is a staff member (RoleID 3), retrieve all history
        query = 'SELECT history.HistoryID AS No, rooms.RoomNumber AS Room, history.BookingDate AS `Booking date`, history.TimeSlot AS `Time slots`, requester.Name AS `Student name`, approver.Name AS `Approver name`, history.Actions AS Action FROM history JOIN rooms ON history.RoomID = rooms.RoomID JOIN users AS requester ON history.UserID = requester.UserID LEFT JOIN users AS approver ON history.ApproverID = approver.UserID;';
    } else {
        // If the user has an unsupported role, return an error
        return res.status(403).json({ error: 'Role not supported for viewing history' });
    }

    // Query the history table based on the determined query
    con.query(query, [userID], (err, results) => {
        if (err) {
            console.error('Error retrieving user history:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        // Send the user's history records as a JSON response
        res.status(200).json(results);
    });
});







// ------------- get user info --------------
app.get('/userInfo', function (req, res) {
    res.json({ "userID": req.session.userID, "username": req.session.username });
});

// staff Hitosry
app.get('/staff/history', function(req, res){
    res.sendFile(path.join(__dirname, 'views/historyStaff.html'));
});



// ---------- footer for every user ----------
app.get('/footer.html', (_req, res) => {
    res.sendFile(path.join(__dirname, '/views/footer.html'));
 });


 // Endpoint to reset all room bookings at the end of the day
app.post('/resetRoomBookings', (_req, res) => {
    // Update all room bookings to set Status to 'Free' and UserID to NULL
    con.query('UPDATE roombooking SET Status = "Free", UserID = NULL, ApproverID = NULL', (err, results) => {
        if (err) {
            console.log('Error resetting room bookings:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        return res.status(200).json({ success: true });
    });
});

// Set up the cron job to trigger the /resetRoomBookings endpoint at 12:00 AM daily
const job = new cron.CronJob('0 0 * * *', () => {
    // Send a request to the /resetRoomBookings endpoint to reset room bookings
    axios.post('http://localhost:3002/resetRoomBookings')
        .then(response => {
            console.log('Room bookings reset successfully');
        })
        .catch(error => {
            console.error('Error resetting room bookings:', error);
        });
});

job.start();

// ========== Student API ===========
app.get('/browseRoomUser', (_req, res) => {
   con.query('SELECT * FROM roombooking', (err, results) => {
       if (err) {
           console.log('Error while querying room bookings:', err);
           return res.status(500).json({ error: 'Internal server error' });
       }
       return res.status(200).json(results);
   });
});
// get data from the database
app.get('/rooms', (_req, res) => {
   con.query('SELECT * FROM rooms', (err, results) => {
       if (err) {
           console.log('Error while querying rooms:', err);
           return res.status(500).json({ error: 'Internal server error' });
       }
       return res.status(200).json(results);
   });
});

// get a room data from the database
// Endpoint for fetching room details based on room ID
// Endpoint to fetch room details including room number
app.get('/rooms/:roomID', (req, res) => {
    const roomID = req.params.roomID;
    // Query the database to retrieve room details including room number based on room ID
    con.query('SELECT RoomID, RoomNumber, RoomSize FROM rooms WHERE RoomID = ?', [roomID], (err, results) => {
        if (err) {
            console.log('Error while querying room details:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Room not found' });
        }
        const roomDetails = results[0];
        return res.status(200).json(roomDetails);
    });
});

 

// Endpoint to retrieve reservation status for a specific user
app.get('/user/reservationStatus', (req, res) => {
    const userID = req.session.userID; // Retrieve user ID from session
    if (!userID) {
        return res.status(401).json({ error: 'User ID not found in session' });
    }
    // Join the roombooking table with the rooms table to get room details
    const query = `
        SELECT rb.*, r.RoomNumber, r.RoomSize
        FROM roombooking rb
        INNER JOIN rooms r ON rb.RoomID = r.RoomID
        WHERE rb.UserID = ? AND rb.Status != 'Free';
    `;
    con.query(query, [userID], (err, results) => {
        if (err) {
            console.log('Error fetching reservation status:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'No reservations found for the specified user' });
        }

        // If reservation status data is found, send it back as a JSON response
        res.status(200).json(results);
    });
});

// --------- reservation for student ---------
app.post('/reserveRoom', (req, res) => {
    const { roomId, timeSlot } = req.body;
    const userID = req.session.userID; // Access userID from session

    // Check if the user has already made a reservation for any time slot
    con.query('SELECT * FROM roombooking WHERE UserID = ? AND Status = "Pending"', [userID], (err, results) => {
        if (err) {
            console.log('Error fetching user reservations:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (results.length > 0) {
            // If the user already has a pending reservation, deny the new reservation
            return res.status(403).json({ error: 'You already have a pending reservation' });
        }

        // If the user doesn't have any pending reservations, proceed to reserve the room
        // Update the room booking with the userID
        con.query('UPDATE roombooking SET Status = ?, UserID = ? WHERE RoomID = ? AND TimeSlot = ?', ['Pending', userID, roomId, timeSlot], (err, results) => {
            if (err) {
                console.log('Error updating room booking status:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Room booking not found' });
            }
            return res.status(200).json({ success: true });
        });
    });
});


// =========== Staff API ===========
// edit room status?
// New endpoint to update room availability
app.post('/updateAvailability', (req, res) => {
   const { roomId, timeSlot, status } = req.body;
   // Update the availability in your database based on the provided roomId, timeSlot, and status
   con.query('UPDATE roombooking SET Status = ? WHERE RoomID = ? AND TimeSlot = ?', [status, roomId, timeSlot], (err, results) => {
       if (err) {
           console.log('Error updating room availability:', err);
           return res.status(500).json({ error: 'Internal server error' });
       }
       if (results.affectedRows === 0) {
           return res.status(404).json({ error: 'Room booking not found' });
       }
       return res.status(200).json({ success: true });
   });
});

// edit room size?
// Update room size endpoint
app.put('/rooms/:roomID', (req, res) => {
    const roomID = req.params.roomID;
    const { roomSize } = req.body;
    // Validate room size
    const validSizes = ['Small', 'Medium', 'Large'];
    if (!validSizes.includes(roomSize)) {
        return res.status(400).json({ error: 'Invalid room size' });
    }
    // Update room size in the database
    con.query('UPDATE rooms SET RoomSize = ? WHERE RoomID = ?', [roomSize, roomID], (err, results) => {
        if (err) {
            console.log('Error updating room size:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Room not found' });
        }
        return res.status(200).json({ success: true });
    });
});

// Add the new room to the database and also add corresponding records to the roombooking table
app.post('/addRoom', (req, res) => {
    const { roomName, roomSize } = req.body;

    // Insert the new room into the rooms table
    con.query('INSERT INTO rooms (RoomNumber, RoomSize) VALUES (?, ?)', [roomName, roomSize], (err, result) => {
        if (err) {
            console.error('Error adding room:', err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
        
        // Insert corresponding records into the roombooking table for each time slot
        const timeSlots = ['8-10', '10-12', '13-15', '15-17']; // Assuming these are the time slots
        const insertQueries = timeSlots.map(timeSlot => {
            return new Promise((resolve, reject) => {
                con.query('INSERT INTO roombooking (RoomID, TimeSlot, Status, UserID, ApproverID) VALUES (?, ?, ?, ?, ?)', [result.insertId, timeSlot, 'Free', null, null], (err, result) => {
                    if (err) {
                        console.error('Error adding room booking:', err);
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
        });

        // Execute all insert queries
        Promise.all(insertQueries)
            .then(() => {
                res.status(200).json({ success: true, message: 'Room added successfully' });
            })
            .catch(error => {
                res.status(500).json({ success: false, message: 'Error adding room booking' });
            });
    });
});




// Endpoint to check if a room name already exists
app.post('/checkRoomName', (req, res) => {
    let { roomName } = req.body;

    // Remove spaces and dashes from the room name and convert it to lowercase
    roomName = roomName.replace(/[\s-]/g, '').toLowerCase();

    // Query the database to check if the modified room name already exists
    con.query('SELECT * FROM rooms', (err, results) => {
        if (err) {
            console.error('Error checking room name:', err);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }
        
        // Iterate through the results to check if any room names match the modified room name
        for (const row of results) {
            const dbRoomName = row.RoomNumber.replace(/[\s-]/g, '').toLowerCase();
            if (dbRoomName === roomName) {
                return res.status(200).json({ success: false, message: 'Room name already exists' });
            }
        }

        // If no matching room name is found, send a response indicating it
        return res.status(200).json({ success: true, message: 'Room name is available' });
    });
});

// =========== Approver API ===========
// request table
app.get('/pendingRoomRequests', (req, res) => {
    // Query the database to retrieve pending room reservation requests with room numbers and user names
    con.query(`
        SELECT roombooking.*, rooms.RoomNumber, users.Name
        FROM roombooking
        JOIN rooms ON roombooking.RoomID = rooms.RoomID
        JOIN users ON roombooking.UserID = users.UserID
        WHERE roombooking.Status = "Pending"
        LIMIT 25;
    `, (err, results) => {
        if (err) {
            console.error('Error fetching pending room requests:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(200).json(results); // Send the pending room requests as JSON response with room_number and user_name
    });
});
// Update the status of a room reservation to 'Approved' and insert into history table
app.put('/approveRequest/:bookingID', (req, res) => {
    const bookingID = req.params.bookingID;
    const approverID = req.session.userID; // Retrieve the approver's userID from session

    // Check if the approverID is null or undefined
    if (!approverID) {
        return res.status(403).json({ error: 'Approver ID not found in session' });
    }

    // Perform a database query to update the status of the reservation and set the ApproverID
    con.query(
        'UPDATE roombooking SET Status = "Reserved", ApproverID = ? WHERE BookingID = ?',
        [approverID, bookingID],
        (err, result) => {
            if (err) {
                console.error('Error updating room reservation status:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            // Check if the update affected any rows
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Room booking not found' });
            }
            // Query the database to get additional information needed for history table
            con.query('SELECT RoomID, TimeSlot, UserID FROM roombooking WHERE BookingID = ?', [bookingID], (err, rows) => {
                if (err) {
                    console.error('Error querying room booking:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }
                if (rows.length === 0) {
                    return res.status(404).json({ error: 'Room booking not found' });
                }
                const { RoomID, TimeSlot, UserID } = rows[0];
                // If the update is successful, insert data into the history table
                const timestamp = new Date().toISOString();
                const insertQuery = 'INSERT INTO history (BookingID, RoomID, BookingDate, TimeSlot, UserID, ApproverID, Actions) VALUES (?, ?, ?, ?, ?, ?, ?)';
                con.query(insertQuery, [bookingID, RoomID, timestamp, TimeSlot, UserID, approverID, 'Approved'], (err, result) => {
                    if (err) {
                        console.error('Error inserting into history table:', err);
                        return res.status(500).json({ error: 'Internal server error' });
                    }
                    // Send a success response
                    res.status(200).json({ message: 'Room reservation approved successfully' });
                });
            });
        }
    );
});


// Update the status of a room reservation to 'Rejected' and insert into history table
app.put('/rejectRequest/:bookingID', (req, res) => {
    const bookingID = req.params.bookingID;
    const approverID = req.session.userID; // Retrieve the approver's userID from session

    // Check if the approverID is null or undefined
    if (!approverID) {
        return res.status(403).json({ error: 'Approver ID not found in session' });
    }

    // Query the database to get additional information needed for history table
    con.query('SELECT RoomID, TimeSlot, UserID FROM roombooking WHERE BookingID = ?', [bookingID], (err, rows) => {
        if (err) {
            console.error('Error querying room booking:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Room booking not found' });
        }
        const { RoomID, TimeSlot, UserID } = rows[0];

        // If the roombooking exists, insert data into the history table
        const timestamp = new Date().toISOString();
        const insertQuery = 'INSERT INTO history (BookingID, RoomID, BookingDate, TimeSlot, UserID, ApproverID, Actions) VALUES (?, ?, ?, ?, ?, ?, ?)';
        con.query(insertQuery, [bookingID, RoomID, timestamp, TimeSlot, UserID, approverID, 'Rejected'], (err, result) => {
            if (err) {
                console.error('Error inserting into history table:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            
            // After inserting into history table, update the status of the reservation
            con.query(
                'UPDATE roombooking SET Status = "Free" , UserID = NULL WHERE BookingID = ?',
                [bookingID],
                (err, result) => {
                    if (err) {
                        console.error('Error updating room reservation status:', err);
                        return res.status(500).json({ error: 'Internal server error' });
                    }
                    res.status(200).json({ message: 'Room reservation rejected successfully' });
                }
            );
        });
    });
});



// Route to get dashboard
app.get('/Dashboard', (req, res) => {
    // Query to count rooms with different statuses
    const query = `
      SELECT 
        COUNT(CASE WHEN status = 'free' THEN 1 END) AS free,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending,
        COUNT(CASE WHEN status = 'reserved' THEN 1 END) AS reserved,
        COUNT(CASE WHEN status = 'disabled' THEN 1 END) AS disabled
      FROM roomBooking;
    `;
    // Execute query
    con.query(query, (error, results, fields) => {
      if (error) {
        console.error('Error executing MySQL query: ' + error.stack);
        res.status(500).send('Error retrieving room status');
        return;
    }
  
        // Send room status as JSON response
        res.json(results[0]);
    });
});





// ========== Student routes ==========
// ------- student landing page -------
app.get('/browseRoomUser.html', (_req, res) => {
    res.sendFile(path.join(__dirname, '/views/browseRoomUser.html'));
});
// ------- navbar for student -------
app.get('/navbar.html', (_req, res) => {
    res.sendFile(path.join(__dirname, '/views/navbar.html'));
});
// ------- status page -------
app.get('/status', (_req, res) => {
    res.sendFile(path.join(__dirname, '/views/status.html'));
});
// ------- user history page -------
app.get('/user/history', function(req, res){
    res.sendFile(path.join(__dirname, 'views/historyUser.html'));
});

// ========== Approver routes ==========
// ------- approver landing page -------
app.get('/browseRoomApv.html', (_req, res) => {
    res.sendFile(path.join(__dirname, '/views/browseRoomApv.html'));
});
// ------- navbar for approver -------
app.get('/navbarApprover.html', (_req, res) => {
    res.sendFile(path.join(__dirname, '/views/navbarApprover.html'));
});
// ------- approver history page -------
app.get('/approver/history', function(req, res){
    res.sendFile(path.join(__dirname, '/views/historyApprover.html'));
});
// ------- request Status -------
app.get('/approver/request', function(req, res){
    res.sendFile(path.join(__dirname, '/views/ApproveRequest.html'));
});
// ------- dashboard approver -------
app.get('/approver/dashboard', function(req, res){
    res.sendFile(path.join(__dirname, '/views/DashboardApprover.html'));
});


// ========== Staff routes ==========
// ------- Staff landing page -------
app.get('/browseRoomStaff.html', (_req, res) => {
    res.sendFile(path.join(__dirname, '/views/browseRoomStaff.html'));
});
// ------- navbar for approver -------
app.get('/navbarStaff.html', (_req, res) => {
    res.sendFile(path.join(__dirname, '/views/navbarStaff.html'));
});
// ------- staff history page -------
app.get('/staff/history', function(req, res){
    res.sendFile(path.join(__dirname, 'views/historyStaff.html'));
});
// ------- dashboard staff -------
app.get('/staff/dashboard', function(req, res){
    res.sendFile(path.join(__dirname, '/views/DashboardStaff.html'));
});




// ------- root service -------
app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, '/views/login.html'));
});

 
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
