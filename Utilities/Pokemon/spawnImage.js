import sharp from "sharp";
import { Chance } from "chance";

async function spawnImage(pokemon, shiny) {
    let lands = {
        "cave": {
            r: [[[0, 0.29, 0.30], [0, 0.15, 0.49], [0, 0.31, 0.39]], [[0, 0.30, 0.13], [0, 0.019, 0.25], [0, 0.29, 0.06]], [[0, 0.46, 0.32], [0, 0.19, 0.36], [0, 0.12, 0.27]], [[0, 0.34, 0.29], [0, 0.47, 0.40], [0, 0.44, 0.12]], [[0, 0.11, 0.29], [0, 0.11, 0.14], [0, 0.26, 0.41]], [[0, 0.02, 0.3755], [0, 0.14, 0.1764], [0, 0.27, 0.35]]],
            f: "png"
        },
        "field": {
            f: "png",
            d: true,
            "c-day": [[0.3, 0.4, 0.2], [0.3, 0.3, 0.2], [0.4, 0.5, 0.3]],
            "c-night": [[0.1, 0.4, 0.2], [0.2, 0.3, 0.2], [0.3, 0.5, 0.3]],
            "c-eve": [[0.2, 0.4, 0.3], [0.3, 0.5, 0.3], [0.2, 0.3, 0.4]]
        },
        "wild": {
            f: "jpg",
            d: true,
            "c-eve": [[0.2, 0.4, 0.3], [0.3, 0.5, 0.3], [0.2, 0.3, 0.4]],
            "c-night": [[0.1, 0.1, 0.5], [0, 0.1, 0.4], [0.2, 0.1, 0.4]],
        },
        "mine": {
            f: "jpg",
            c: [[0.2, 0.1, 0.2], [0.1, 0.2, 0.2], [0.1, 0.3, 0.3]]
        }
    };

    let _l = Object.keys(lands)[Chance().integer({
        min: 0,
        max: Object.keys(lands).length - 1
    })];

    let _s = _l;
    if (lands[_l].d) {
        let tim = "day";
        let tie = new Date();
        if (tie.getHours() > 8 && tie.getHours() < 19) { } else if ((tie.getHours() > 18 && tie.getHours() < 20) || (tie.getHours() > 4 && tie.getHours() < 7)) {
            tim = "eve";
        } else if ((tie.getHours() < 5 && tie.getHours() > 0) || (tie.getHours() > 19 && tie.getHours() < 23) || tie.getHours() == 23) {
            tim = "night";
        }
        _s += '-' + tim;
    }

    if (lands["c" + _s])
        lands[_l].c = lands["c" + _s];

    let b = sharp(`../pokedi/card/resources/${_s}.${lands[_l].f}`);

    let meta = await b.metadata();
    b = b.extract({
        left: Chance().integer({
            min: 0,
            max: meta.width - 300
        }),
        top: Chance().integer({
            min: 0,
            max: meta.height - 300
        }),
        width: 300,
        height: 300
    });

    let a = sharp(`../pokedi/pokemon/${shiny ? "shiny" : "regular"}/${pokemon}.png`).png().trim().extend({
        top: Chance().integer({
            min: 0,
            max: 20
        }),
        left: Chance().integer({
            min: 0,
            max: 20
        }),
        right: Chance().integer({
            min: 0,
            max: 20
        }),
        bottom: 0
    }).resize({
        height: 200,
        width: 200,
        fit: 'contain'
    });
    a.options.resizeBackground = [0, 0, 0, 0],
        a.options.extendBackground = [0, 0, 0, 0],
        a.modulate({
            brightness: 1,
        });
    let [lf, rf] = [Chance().integer({
        min: 0,
        max: 100
    }), Chance().integer({
        min: 0,
        max: 100
    })]
        , c = a.clone()
        , d = a.clone();

    d.recomb([[0, 0, 0], [0, 0, 0], [0, 0, 0]]);

    if (lands[_l].r) {
        let ui = lands[_l].r[Chance().integer({
            min: 0,
            max: lands[_l].r.length - 1
        })];
        a.recomb(ui);
        b.recomb(ui);
    }

    if (lands[_l].c)
        a.recomb(lands[_l].c);

    b.composite([{
        input: await d.resize({
            height: 30,
            width: 200,
            fit: 'fill'
        }).blur(3).toBuffer(),
        blend: 'soft-light',
        left: lf,
        top: rf + 170
    }, {
        input: await a.toBuffer(),
        blend: 'atop',
        left: lf,
        top: rf
    }, {
        input: await c.toBuffer(),
        blend: 'overlay',
        left: lf,
        top: rf
    }]);

    return await b.toBuffer();
}

export default spawnImage;