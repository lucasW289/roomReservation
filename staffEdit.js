// Add event listener for disable buttons
document.addEventListener('DOMContentLoaded', function () {
    const disableButtons = document.querySelectorAll('.disable-btn');
    disableButtons.forEach(button => {
        button.addEventListener('click', function () {
            const roomNumber = this.getAttribute('data-room');
            const timeSlot = this.getAttribute('data-time');
            
            // Show confirmation dialog
            Swal.fire({
                title: 'Are you sure?',
                text: 'You are about to disable this room. This action cannot be undone.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, disable it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Update availability in data.js
                    disableRoom(roomNumber, timeSlot);
                }
            });
        });
    });
});

// Event listener for edit buttons
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('edit-btn')) {
        const roomNumber = event.target.dataset.room;
        const timeSlot = event.target.dataset.time;
        // Check if the room is disabled
        const roomIndex = allRooms.findIndex(room => room.roomNumber === roomNumber);
        if (roomIndex !== -1 && allRooms[roomIndex].status[timeSlot] !== 'disabled') {
            handleEditAvailability(roomNumber, timeSlot);
        } else {
            Swal.fire(
                'Error!',
                'The selected room is disabled and cannot be edited.',
                'error'
            );
        }
    }
});

// Function to handle editing room availability
function handleEditAvailability(roomNumber, timeSlot) {
    Swal.fire({
        title: 'Edit Availability',
        html: `
            <select id="availabilitySelect" class="form-control">
                <option value="available">Available</option>
                <option value="pending">Pending</option>
                <option value="reserved">Reserved</option>
            </select>
        `,
        showCancelButton: true,
        confirmButtonText: 'Save',
        cancelButtonText: 'Cancel',
        preConfirm: () => {
            const availability = document.getElementById('availabilitySelect').value;
            // Update data.js with the new availability
            updateAvailability(roomNumber, timeSlot, availability);
        }
    });
}

// Function to update availability in data.js
function updateAvailability(roomNumber, timeSlot, availability) {
    // Find the room in the allRooms array and update its availability
    const roomIndex = allRooms.findIndex(room => room.roomNumber === roomNumber);
    if (roomIndex !== -1) {
        allRooms[roomIndex].status[timeSlot] = availability;
        // Update data in localStorage
        updateDataInLocalStorage(allRooms);
        // You might want to trigger a re-render of the table here
        // depending on how your application is structured
        renderTable(allRooms, timeSlots, 'staff');
        // Show a success message
        Swal.fire('Success', 'Availability updated successfully', 'success');
    } else {
        Swal.fire('Error', 'Room not found', 'error');
    }
}

// Function to update data in localStorage
function updateDataInLocalStorage(data) {
    // Update data in localStorage
    localStorage.setItem('allRooms', JSON.stringify(data));
}

// Function to update availability in data.js
function disableRoom(roomNumber, timeSlot) {
    // Find the room in allRooms array
    const roomIndex = allRooms.findIndex(room => room.roomNumber === roomNumber);
    if (roomIndex !== -1) {
        // Check if the room is available in the specified time slot
        if (allRooms[roomIndex].status[timeSlot] === 'available') {
            // Update the status of the room for the specified time slot to 'disabled'
            allRooms[roomIndex].status[timeSlot] = 'disabled';
            // Update data in localStorage
            updateDataInLocalStorage(allRooms);
            // Render the table
            renderTable(allRooms, timeSlots, 'staff');
        } else {
            // Show error message if the room is not available
            Swal.fire(
                'Error!',
                'The selected room is not available to be disabled.',
                'error'
            );
        }
    }
}
