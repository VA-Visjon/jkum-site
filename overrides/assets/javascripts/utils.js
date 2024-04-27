
export function clockPositionToRadians(clockPosition) {
    // Convert clock position to degrees counterclockwise from east
    var degreesCCWFromEast = (360 + (90 - clockPosition)) % 360;

    // Convert degrees to radians
    var radians = degreesCCWFromEast * (Math.PI / 180);
    return radians;
}

export function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    .replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}