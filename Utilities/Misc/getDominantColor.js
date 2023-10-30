import axios from "axios";
import Color from "color";
import domcolor from "domcolor";
import path from "path";
import { getColor } from "colorthief";

const __dirname = path.resolve(path.dirname(''));

export default (url, paths = false) => {
    return new Promise(async (resolve) => {
        try {
            let dataImg;

            if (url && paths) {
                dataImg = await getColor(path.join(__dirname, url));
                return resolve(Color(dataImg).rgbNumber());
            } else {
                dataImg = Buffer.from((await axios.get(url, { responseType: "arraybuffer" })).data);
            }

            if (!dataImg)
                return resolve(Color({ r: 255, g: 255, b: 255 }).rgbNumber());

            const dom = (await domcolor(dataImg));

            resolve(Color(dom.rgb).rgbNumber())

        } catch (error) {
            console.log(error);
            resolve(Color({ r: 255, g: 255, b: 255 }).rgbNumber())
        }
    });

}