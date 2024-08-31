document.addEventListener('DOMContentLoaded', function() {
    // Array of button IDs and corresponding functions
    const buttons = [
        { id: 'left-button', action: moveLeft },
        { id: 'right-button', action: moveRight },
        { id: 'down-button', action: moveDown },
        { id: 'rotate-button', action: rotatePiece }
    ];

    // Iteratively add event listeners to each button
    buttons.forEach(button => {
        const element = document.getElementById(button.id);
        if (element) {
            element.addEventListener('touchstart', function(e) {
                e.preventDefault();
                button.action();  // Execute the corresponding action
            }, { passive: false });
        }
    });
});

// Debounce function to limit resize calls
function debounce(func, timeout = 300) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

// Resize handler with debounce
const handleResize = debounce(function() {
    adjustGameSettings();  // Adjust game settings based on new dimensions
    if (canvasContainer) {
        canvas.width = canvasContainer.offsetWidth;
        canvas.height = canvasContainer.offsetHeight;
        redrawCanvas();  // Redraw the game to fit new dimensions
    }
});

window.addEventListener('resize', handleResize);
