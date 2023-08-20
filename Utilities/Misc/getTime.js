/**
 *
 * @author Ditto Duck Penguin
 *
 * Returns the status of the sky
 *
 */
export default function getTime(hour = new Date().getHours()) {
    let $1 = hour;
    let $2;
    if ($1 == 0) {
        $2 = "midnight"
    } else if ($1 <= 4 || $1 >= 20) {
        $2 = "night";
    } else if ($1 >= 7 && $1 <= 14) {
        $2 = "day";
    } else if ($1 >= 4 && $1 <= 7) {
        $2 = "dawn";
    } else if ($1 >= 14 && $1 <= 20) {
        $2 = "dusk"
    }

    return $2;
}