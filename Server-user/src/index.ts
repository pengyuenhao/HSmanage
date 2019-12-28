import { range } from "rxjs";
import { map, filter } from "rxjs/operators";

import { inject, IRoot, IContext } from "peng-ioc";
import MainContext from "./content/MainContext";


export default class Main implements IRoot {
    /**环境容器 */
    public context: IContext;

    constructor() {
        this.context = new MainContext(this);
    }
}
new Main();

//let config = JSON.parse(fs.readFileSync("../config/config.json",{encoding:"utf8"}));

/* let source = range(1, 10);
source.pipe(
    filter((x, i) => (x + i) % 2 === 1),
    map((x, i) => x + i),
).subscribe(x => console.log(x)); */