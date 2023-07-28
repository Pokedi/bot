import crypto from "crypto";

function randomint(i = 32) {
    const randomBytes = crypto.randomBytes(4);
    const randomValue = randomBytes.readUInt32LE(0);
    return randomValue % i; // Modulo 32 to get a number between 0 and 31
}

export default randomint;