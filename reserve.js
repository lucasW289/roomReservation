    // Function to add event listeners to reserve buttons
    function addEventListenersToReserveButtons() {
        const reserveButtons = document.querySelectorAll('.reserve-btn');
        reserveButtons.forEach(button => {
            button.addEventListener('click', () => {
                const roomNumber = button.getAttribute('data-room');
                const timeSlot = button.getAttribute('data-time');
                const roomDetails = `Room Number: ${roomNumber}, Time Slot: ${timeSlot}`;

                // Show SweetAlert2 modal for reservation
                Swal.fire({
                    title: 'Reservation',
                    html: `
                        <div>
                            <p>${roomDetails}</p>
                            <input id="email" class="swal2-input" type="email" placeholder="Enter your email">
                        </div>
                    `,
                    showCancelButton: true,
                    confirmButtonText: 'Submit',
                    cancelButtonText: 'Cancel',
                    preConfirm: () => {
                        const email = Swal.getPopup().querySelector('#email').value;
                        if (!email) {
                            Swal.showValidationMessage('Please enter your email');
                        }
                        return { email: email };
                    }
                }).then(result => {
                    if (result.isConfirmed) {
                        const email = result.value.email;
                        // You can perform further actions with the email, such as sending it to a server for processing
                        // For demonstration, let's just show an alert with the email
                        Swal.fire({
                            title: 'Success!',
                            text: `Your reservation for ${roomDetails} has been confirmed. We will contact you at ${email}.`,
                            icon: 'success',
                            confirmButtonText: 'OK'
                        });
                    }
                });
            });
        });
    }

    // Add event listeners to reserve buttons when DOM content is loaded
    document.addEventListener('DOMContentLoaded', addEventListenersToReserveButtons);

    // Re-add event listeners to reserve buttons after pagination
    document.addEventListener('click', event => {
        if (event.target.classList.contains('page-link')) {
            addEventListenersToReserveButtons();
        }
    });
