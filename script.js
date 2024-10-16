const elevators = [
  { id: 'elevator1', currentFloor: 0, targetFloor: null, isMoving: false, waitingTime: null },
  { id: 'elevator2', currentFloor: 0, targetFloor: null, isMoving: false, waitingTime: null },
  { id: 'elevator3', currentFloor: 0, targetFloor: null, isMoving: false, waitingTime: null },
  { id: 'elevator4', currentFloor: 0, targetFloor: null, isMoving: false, waitingTime: null },
  { id: 'elevator5', currentFloor: 0, targetFloor: null, isMoving: false, waitingTime: null }
];

const requestQueue = [];

document.querySelectorAll('.call-button').forEach(button => {
  button.addEventListener('click', handleCallButton);
});

function handleCallButton(event) {
  const button = event.target;
  const targetFloor = parseInt(button.dataset.floor);
  const requestTime = Date.now();
  
  button.style.backgroundColor = 'red';
  button.disabled = true;
  
  const request = { floor: targetFloor, requestTime: requestTime, button: button, timerInterval: null };
  requestQueue.push(request);

  updateButtonWaitingTime(request);
  processQueue();
}

function updateButtonWaitingTime(request) {
  const waitingTime = Math.floor((Date.now() - request.requestTime) / 1000);
  request.button.textContent = `Waiting: ${waitingTime}s`;
}

function startButtonTimer(request) {
  updateButtonWaitingTime(request);
  request.timerInterval = setInterval(() => updateButtonWaitingTime(request), 1000);
}

function stopButtonTimer(request) {
  if (request.timerInterval) {
    clearInterval(request.timerInterval);
    request.timerInterval = null;
  }
}

function processQueue() {
  while (requestQueue.length > 0) {
    const request = requestQueue[0];
    const availableElevator = findClosestElevator(request.floor);

    if (availableElevator) {
      startButtonTimer(request);
      moveElevator(availableElevator, request);
      requestQueue.shift();
    } else {
      break;
    }
  }
}

function findClosestElevator(targetFloor) {
  const availableElevators = elevators.filter(elevator => !elevator.isMoving);
  if (availableElevators.length === 0) return null;

  return availableElevators.reduce((closest, elevator) => {
    const distance = Math.abs(elevator.currentFloor - targetFloor);
    return distance < Math.abs(closest.currentFloor - targetFloor) ? elevator : closest;
  });
}

function moveElevator(elevator, request) {
  elevator.isMoving = true;
  elevator.targetFloor = request.floor;
  elevator.waitingTime = 0;

  const elevatorElement = document.querySelector(`#${elevator.id} .elevator`);
  elevatorElement.style.backgroundColor = 'red';

  const totalDistance = Math.abs(elevator.currentFloor - request.floor);
  const duration = totalDistance * 1000; // 1 second per floor

  elevatorElement.style.transition = `bottom ${duration}ms linear`;
  updateElevatorPosition(elevator, request.floor);

  setTimeout(() => {
    elevatorArrived(elevator, request);
  }, duration);
}

function updateElevatorPosition(elevator, targetFloor) {
  const elevatorElement = document.querySelector(`#${elevator.id} .elevator`);
  elevatorElement.style.bottom = `${targetFloor * 50}px`;
}

function elevatorArrived(elevator, request) {
  elevator.isMoving = false;
  elevator.currentFloor = request.floor;

  const arrivalSound = document.getElementById('arrival-sound');
  arrivalSound.play();

  const elevatorElement = document.querySelector(`#${elevator.id} .elevator`);
  elevatorElement.style.backgroundColor = 'blue';
  elevatorElement.style.transition = ''; // Reset transition

  stopButtonTimer(request);
  request.button.textContent = 'Arrived';
  request.button.style.backgroundColor = 'blue';

  // Wait 2 seconds before moving to the next call
  setTimeout(() => {
    // Change the elevator color back to black
    elevatorElement.style.backgroundColor = '';

    // Change the button to "Call" with the initial design
    request.button.textContent = 'Call';
    request.button.style.backgroundColor = '';
    request.button.disabled = false;

    // Process the next request in the queue
    processQueue();
  }, 2000);
}

// Initialize the elevator positions
elevators.forEach(elevator => updateElevatorPosition(elevator, 0));