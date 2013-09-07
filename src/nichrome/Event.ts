module Nicr {
    export class Event {

        handlers:any;

        constructor() {
            this.handlers = {};
        }

        on(name, func) {
            if (!this.handlers[name]) this.handlers[name] = [];
            this.handlers[name].push(func);
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