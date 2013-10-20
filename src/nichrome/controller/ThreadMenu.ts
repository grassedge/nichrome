/// <reference path="../../d.ts/DefinitelyTyped/jqueryui/jqueryui.d.ts" />
/// <reference path="../Util.ts" />
/// <reference path="../service/Thread.ts" />
/// <reference path="./ThreadList.ts" />

declare var JST:any;

module Nicr.Controller {

    export class ThreadMenu {
        private $el: JQuery;

        private threadService: Service.Thread;

        constructor(args:{
            $el:JQuery;
            threadService:Service.Thread;
        }) {
            this.$el = args.$el;
            this.threadService = args.threadService;

            this.$el.on('click', '.open-recent', (e) => { this.onClickOpenRecent(e) });
            $(document).on('click', (e) => { this.onClickBody(e) });
        }

        onClickOpenRecent(event) {
            this.threadService.openRecent();
        }

        onClickBody(event) {
            var $target = $(event.target);
            if ($target.hasClass('thread-menu-button')) return;
            this.$el.hide();
        }
    }

}
