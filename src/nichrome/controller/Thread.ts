/// <reference path="../service/Thread.ts" />

module Nicr.Controller {

    export class Thread {
        el: JQuery;
        threadService: Service.Thread;
        constructor(args:{el:JQuery; threadService:Service.Thread;}) {
            this.el = args.el;
            this.threadService = args.threadService;
        }
    }
}