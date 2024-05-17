// render.js

// Function to render table with room availability data
function renderTable(allRooms, timeSlots, currentPage = 1, rowsPerPage = 3) {
    const tableBody = document.querySelector('#roomAvailability tbody');
    const tableHead = document.querySelector('#roomAvailability thead');
    tableBody.innerHTML = '';
    tableHead.innerHTML = '';

    const indexOfLastRoom = currentPage * rowsPerPage;
    const indexOfFirstRoom = indexOfLastRoom - rowsPerPage;
    const currentRooms = allRooms.slice(indexOfFirstRoom, indexOfLastRoom);

    const currentTime = new Date();
   
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
  
    // Create table head with "Reserve" button in the last column
    const headRow = document.createElement('tr');
    headRow.innerHTML = `
        <th>Room Number</th>
        <th>Room Size</th>
        <th>Time Slot</th>
        <th>Availability</th>
        <th>Reserve</th>
    `;
    tableHead.appendChild(headRow);

    currentRooms.forEach(room => {
        timeSlots.forEach(timeSlot => {
            const [startTime, endTime] = timeSlot.split('-').map(time => parseInt(time));
            const [startHour, startMinute] = timeSlot.split('-')[0].split(':').map(time => parseInt(time));
            const [endHour, endMinute] = timeSlot.split('-')[1].split(':').map(time => parseInt(time));
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
                        isDisabled = true;
                        break;
                    default:
                        break;
                }
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${room.roomNumber}</td>
                <td>${room.roomSize}</td>
                <td>${formatTimeSlot(timeSlot)}</td>
                <td class="${availabilityClass}">${room.status[timeSlot]}</td>
                <td><button class="btn btn-primary reserve-btn" ${isDisabled ? 'disabled' : ''}>Reserve</button></td>
            `;
            tableBody.appendChild(tr);
        });
    });

    // Pagination and arrows
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
             renderTable(allRooms, timeSlots, i, rowsPerPage);
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
             renderTable(allRooms, timeSlots, currentPage - 1, rowsPerPage);
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
             renderTable(allRooms, timeSlots, currentPage + 1, rowsPerPage);
         });
     }
    // ...
}

// Function to format time slot
function formatTimeSlot(timeSlot) {
    const [startHour, startMinute] = timeSlot.split('-')[0].split(':').map(time => parseInt(time));
    const [endHour, endMinute] = timeSlot.split('-')[1].split(':').map(time => parseInt(time));

    const startPeriod = startHour >= 12 ? 'PM' : 'AM';
    const endPeriod = endHour >= 12 ? 'PM' : 'AM';

    const formattedStartTime = `${startHour % 12}:${startMinute.toString().padStart(2, '0')} ${startPeriod}`;
    const formattedEndTime = `${endHour % 12}:${endMinute.toString().padStart(2, '0')} ${endPeriod}`;

    return `${formattedStartTime} - ${formattedEndTime}`;
}
