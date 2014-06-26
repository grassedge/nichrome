module Nicr {

    export interface Indexed {
        id?:any;
    };

    export class IndexedList<T extends Indexed> {

        private index: any;
        private list: T[];

        constructor(array?:T[]) {
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

        slice(start:number, end?:number):T[] {
            return this.getList().slice(start, end);
        }

        splice(index:number, howMany:number, ...values:T[]):T[] {
            var args = (<any[]>[index, howMany]).concat(values);
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

        forEach(
            callback: (value: T, index: number, array: T[]) => void ,
            thisArg?: any
        ): void {
            this.list.forEach(callback, thisArg);
        }

        sort(compare:(a:T, b:T) => number):IndexedList<T> {
            var sorted = this.list.sort(compare);
            return new IndexedList<T>(sorted);
        }

        // map(callback:any):IndexedList<T> {
        //     return new IndexedList(this.list.map(callback));
        // }
    }

}
