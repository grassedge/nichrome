module Nicr {

    interface Indexed {
        id?:any;
    };

    export class IndexedList<T extends Indexed> {

        private index: any;
        private list: T[];

        constructor(array?:any[]) {
            this.index = {};
            this.list = (array === undefined) ? [] : [].concat(array);
            this.list.forEach((value) => {
                this.index[value.id()] = value;
            });
        }

        push(value:T) {
            this.list.push(value);
            this.index[value.id()] = value;
        }

        splice(index:number, howMany:number, ...values:T[]):T[] {
            var args = [index, howMany].concat(values);
            var removed = Array.prototype.splice.apply(this.list, args);
            values.forEach((value) => {
                this.index[value.id()] = value;
            });
            removed.forEach((value) => {
                delete this.index[value.id()];
            })
            return removed;
        }

        set(idx:number, value:T) {
            this.list[idx] = value;
            this.index[value.id()] = value;
        }

        at(idx:number):T {
            return this.list[idx];
        }

        get(key:string):T {
            return this.index[key];
        }

        indexOf(value:T):number {
            return this.list.indexOf(value);
        }

        getList():T[] {
            return this.list;
        }

        forEach(callback:any):void {
            this.list.forEach(callback);
        }

        sort(compare:(a:T, b:T) => number):IndexedList<T> {
            var sorted = this.list.sort(compare);
            return new IndexedList(sorted);
        }

        // map(callback:any):IndexedList<T> {
        //     return new IndexedList(this.list.map(callback));
        // }
    }

}
