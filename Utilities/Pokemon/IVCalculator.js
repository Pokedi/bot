/**
  *
  * IV Calculator
  *
  * @author: Ditto Duck Penguin
  */

function IVCalculator(a, e, s, k, t) {
    let d = "hp" != k ? Math.floor((2 * (a + e) * s) / 100 + 5) : Math.floor((2 * (a + e) * s) / 100 + 5 + s);
    if (t) {
        let a = Math.floor(d + 0.1 * d)
            , e = Math.floor(d - 0.1 * d);
        switch (t) {
            case "lonely":
                "atk" == k && (d = a),
                    "def" == k && (d = e);
                break;
            case "brave":
                "atk" == k && (d = a),
                    "spd" == k && (d = e);
                break;
            case "adamant":
                "atk" == k && (d = a),
                    "spatk" == k && (d = e);
                break;
            case "naughty":
                "atk" == k && (d = a),
                    "spdef" == k && (d = e);
                break;
            case "bold":
                "def" == k && (d = a),
                    "atk" == k && (d = e);
                break;
            case "relaxed":
                "def" == k && (d = a),
                    "spd" == k && (d = e);
                break;
            case "impish":
                "def" == k && (d = a),
                    "spatk" == k && (d = e);
                break;
            case "lax":
                "def" == k && (d = a),
                    "spdef" == k && (d = e);
                break;
            case "timid":
                "spd" == k && (d = a),
                    "atk" == k && (d = e);
                break;
            case "hasty":
                "spd" == k && (d = a),
                    "def" == k && (d = e);
                break;
            case "jolly":
                "spd" == k && (d = a),
                    "spatk" == k && (d = e);
                break;
            case "naive":
                "spd" == k && (d = a),
                    "spdef" == k && (d = e);
                break;
            case "modest":
                "spatk" == k && (d = a),
                    "atk" == k && (d = e);
                break;
            case "mild":
                "spatk" == k && (d = a),
                    "def" == k && (d = e);
                break;
            case "quiet":
                "spatk" == k && (d = a),
                    "spd" == k && (d = e);
                break;
            case "rash":
                "spatk" == k && (d = a),
                    "spdef" == k && (d = e);
                break;
            case "calm":
                "spdef" == k && (d = a),
                    "atk" == k && (d = e);
                break;
            case "gentle":
                "spdef" == k && (d = a),
                    "def" == k && (d = e);
                break;
            case "sassy":
                "spdef" == k && (d = a),
                    "spd" == k && (d = e);
                break;
            case "careful":
                "spdef" == k && (d = a),
                    "spatk" == k && (d = e);
        }
    }
    return d;
}

export default IVCalculator;