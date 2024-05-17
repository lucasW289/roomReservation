document.addEventListener('DOMContentLoaded', () => {
    fetchRoomData();
});

function fetchRoomData() {
    fetch('/browseRoomUser')
        .then(response => response.json())
        .then(data => {
            const allRooms = data; // Assuming the data received is an array of room objects
            const timeSlots = ['8-10', '10-12', '12-2', '2-4']; // Assuming this array is defined somewhere
            const userType = 'user'; // Assuming userType is defined somewhere or passed from server
            renderTable(allRooms, timeSlots, userType);
        })
        .catch(error => console.error('Error fetching room data:', error));
}

// Function to render table with room availability data
function renderTable(allRooms, timeSlots, userType, currentPage = 1, rowsPerPage = 3) {
    const tableBody = document.querySelector('#roomAvailability tbody');
    const tableHead = document.querySelector('#roomAvailability thead');
    tableBody.innerHTML = '';
    tableHead.innerHTML = '';

    const indexOfLastRoom = currentPage * rowsPerPage;
    const indexOfFirstRoom = indexOfLastRoom - rowsPerPage;
    const currentRooms = allRooms.slice(indexOfFirstRoom, indexOfLastRoom);

    const currentTime = new Date();
    currentTime.setHours(11);
    currentTime.setMinutes(0);
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();

    // Create table head with appropriate buttons based on user type
    const headRow = document.createElement('tr');
    headRow.innerHTML = `
        <th>Room Number</th>
        <th>Room Size</th>
        <th>Time Slot</th>
        <th>Availability</th>
        ${userType === 'staff' ? '<th>Edit</th><th>Disable</th>' : '<th>Reserve</th>'}
    `;
    tableHead.appendChild(headRow);

    currentRooms.forEach(room => {
        timeSlots.forEach(timeSlot => {
            const [startTime, endTime] = timeSlot.split('-').map(time => parseInt(time));
            let availabilityClass = '';
            let isDisabled = false;

            // Compare current time with the start time of the time slot
            if (currentHour > startTime || (currentHour === startTime && currentMinute >= 0)) {
                room.status[timeSlot] = 'disabled'; // Time slot has passed, disable
                availabilityClass = 'table-secondary';
                isDisabled = true;
            } else {
                switch (room.status[timeSlot]) {
                    case 'available':
                        availabilityClass = 'table-success'; // Green color for available
                        break;
                    case 'pending':
                        availabilityClass = 'table-warning'; // Orange color for pending
                        break;
                    case 'reserved':
                        availabilityClass = 'table-danger'; // Red color for reserved
                        break;
                    case 'disabled':
                        availabilityClass = 'table-secondary'; // Gray color for disabled
                        isDisabled = true; // Mark the button as disabled
                        break;
                    default:
                        break;
                }
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${room.roomNumber}</td>
                <td>${room.roomSize}</td>
                <td>${timeSlot}</td>
                <td class="${availabilityClass}">${room.status[timeSlot]}</td>
                ${userType === 'staff' ? 
                    `<td><button class="btn btn-primary edit-btn" data-room="${room.roomNumber}" data-time="${timeSlot}">Edit</button></td>
                     <td><button class="btn btn-danger disable-btn" ${isDisabled ? 'disabled' : ''} data-room="${room.roomNumber}" data-time="${timeSlot}">Disable</button></td>` :
                    `<td><button class="btn btn-primary reserve-btn" ${isDisabled ? 'disabled' : ''} data-room="${room.roomNumber}" data-time="${timeSlot}">Reserve</button></td>`
                }
            `;
            tableBody.appendChild(tr);
        });
    });

    // Pagination
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    const pageCount = Math.ceil(allRooms.length / rowsPerPage);
    for (let i = 1; i <= pageCount; i++) {
        const li = document.createElement('li');
        li.classList.add('page-item');
        if (i === currentPage) {
            li.classList.add('active'); // Add 'active' class to the current page link
        }
        const link = document.createElement('a');
        link.classList.add('page-link');
        link.href = '#';
        link.textContent = i;
        li.appendChild(link);
        pagination.appendChild(li);

        link.addEventListener('click', () => {
            renderTable(allRooms, timeSlots, userType, i, rowsPerPage);
        });
    }

    // Add "Previous" arrow
    if (currentPage > 1) {
        const prevLi = document.createElement('li');
        prevLi.classList.add('page-item');
        const prevLink = document.createElement('a');
        prevLink.classList.add('page-link');
        prevLink.href = '#';
        prevLink.innerHTML = '&laquo;';
        prevLi.appendChild(prevLink);
        pagination.insertBefore(prevLi, pagination.firstElementChild);

        prevLink.addEventListener('click', () => {
            renderTable(allRooms, timeSlots, userType, currentPage - 1, rowsPerPage);
        });
    }

    // Add "Next" arrow
    if (currentPage < pageCount) {
        const nextLi = document.createElement('li');
        nextLi.classList.add('page-item');
        const nextLink = document.createElement('a');
        nextLink.classList.add('page-link');
        nextLink.href = '#';
        nextLink.innerHTML = '&raquo;';
        nextLi.appendChild(nextLink);
        pagination.appendChild(nextLi);

        nextLink.addEventListener('click', () => {
            renderTable(allRooms, timeSlots, userType, currentPage + 1, rowsPerPage);
        });
    }
}
