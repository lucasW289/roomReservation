// Define the Room constructor function
function Room(roomNumber, roomSize, status) {
    this.roomNumber = roomNumber;
    this.roomSize = roomSize;
    this.status = status; // Status is an object containing time slots
}

// Array to store rooms
const allRooms = [];

// Function to create and store rooms
function createStoreData(prefix, size, start, end) {
    for (let i = start; i <= end; i++) {
        const roomNumber = `${prefix}${i}`;
        const status = {
            '8-10': 'available',
            '10-12': 'available',
            '12-2': 'available',
            '2-4': 'available'
        };
        allRooms.push(new Room(roomNumber, size, status));
    }
}

createStoreData('LR', 'Large', 101, 110);
createStoreData('MR', 'Medium', 201, 210);
createStoreData('SR', 'Small', 301, 310);


