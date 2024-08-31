document.addEventListener('DOMContentLoaded', function() {
    if ('ontouchstart' in window || navigator.maxTouchPoints) {
        // Touch is supported, show the controls
        document.getElementById('game-controls').style.display = 'block';
    } else {
        // Touch is not supported, hide the controls
        document.getElementById('game-controls').style.display = 'none';
    }
});



document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('left-button').addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevents scrolling and zooming on touch
        moveLeft();
    });

    document.getElementById('right-button').addEventListener('touchstart', (e) => {
        e.preventDefault();
        moveRight();
    });

    document.getElementById('down-button').addEventListener('touchstart', (e) => {
        e.preventDefault();
        moveDown();
    });

    document.getElementById('rotate-button').addEventListener('touchstart', (e) => {
        e.preventDefault();
        rotatePiece();
    });
});
