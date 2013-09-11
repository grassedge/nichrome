module Nicr {
    export class Event {

        private handlers:any = {};

        on(name:string, func:(...values:any[]) => any) {
            if (!this.handlers[name]) this.handlers[name] = [];
            this.handlers[name].push(func);
        }

        off(name?) {
            if (name === undefined) {
                this.handlers = {};
            } else {
                this.handlers[name] = [];
            }
        }

        emit(name, event) {
            var handlers = this.handlers[name] || [];
            for (var i = 0, len = handlers.length; i < len; i++) {
                try {
                    handlers[i](event);
                } catch (e) {
                    console.log('Error on emit[' + name + '] ' + e);
                }
            }
        }
    }
}