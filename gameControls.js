// Ensure your event listeners are correctly set up
document.addEventListener('DOMContentLoaded', function() {
    // Event listener for the 'Left' button
    document.getElementById('left-button').addEventListener('touchstart', function(e) {
        e.preventDefault();  // Prevents the default touch behavior
        moveLeft();
    }, { passive: false });

    // Event listener for the 'Right' button
    document.getElementById('right-button').addEventListener('touchstart', function(e) {
        e.preventDefault();
        moveRight();
    }, { passive: false });

    // Event listener for the 'Down' button
    document.getElementById('down-button').addEventListener('touchstart', function(e) {
        e.preventDefault();
        moveDown();
    }, { passive: false });

    // Event listener for the 'Rotate' button
    document.getElementById('rotate-button').addEventListener('touchstart', function(e) {
        e.preventDefault();
        rotatePiece();
    }, { passive: false });
});
