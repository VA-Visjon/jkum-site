
export function clockPositionToRadians(clockPosition) {
    // Convert clock position to degrees counterclockwise from east
    var degreesCCWFromEast = (360 + (90 - clockPosition)) % 360;

    // Convert degrees to radians
    var radians = degreesCCWFromEast * (Math.PI / 180);
    return radians;
}